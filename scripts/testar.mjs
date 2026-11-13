// Testes automáticos dos fluxos no BUILD ESTÁTICO (mock), servido como arquivos.
// Uso: npm run testar -- <slug> [--sem-build] [--servir] [argumentos extras do playwright]
//   --sem-build  reaproveita .qa-build/<slug> do último build
//   --servir     só sobe o servidor estático do build e espera (Ctrl+C para sair)
// Relatório HTML em relatorios/<slug>/testes (não abre sozinho).
import { execSync, spawn } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const raiz = path.resolve(import.meta.dirname, "..");
const args = process.argv.slice(2);
const slug = args.find((a) => !a.startsWith("-")) ?? "logmovy";
const semBuild = args.includes("--sem-build");
const soServir = args.includes("--servir");
const extras = args.filter((a) => a !== slug && a !== "--sem-build" && a !== "--servir");

if (!fs.existsSync(path.join(raiz, "empresas", slug, "perfil.json"))) {
  console.error(`MAYDAY empresa "${slug}" sem empresas/${slug}/perfil.json`);
  process.exit(1);
}

const qaDir = path.join(raiz, ".qa-build", slug);

// 1. Build estático com mock
if (!semBuild || !fs.existsSync(path.join(qaDir, "index.html"))) {
  console.log(`BUILD MOCK ..... ${slug}`);
  fs.rmSync(path.join(raiz, "out"), { recursive: true, force: true });
  try {
    execSync("node scripts/empresa-ativa.mjs && npx next build", {
      cwd: raiz,
      stdio: "pipe",
      env: { ...process.env, EMPRESA: slug, MOCK: "1" },
    });
  } catch (e) {
    console.error(`MAYDAY build falhou\n${String(e.stdout ?? "")}${String(e.stderr ?? "")}`.slice(0, 4000));
    process.exit(1);
  }
  fs.rmSync(qaDir, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(qaDir), { recursive: true });
  fs.renameSync(path.join(raiz, "out"), qaDir);
}

// 2. Servidor estático (mesma lógica do checar: pasta > index.html; inexistente > 404.html com status 404)
const tipos = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".webp": "image/webp",
};
const srv = http.createServer((req, res) => {
  let u;
  try {
    u = decodeURIComponent(new URL(req.url, "http://x").pathname);
  } catch {
    res.writeHead(400);
    return res.end();
  }
  let f = path.join(qaDir, path.normalize(u));
  if (!f.startsWith(qaDir)) {
    res.writeHead(403);
    return res.end();
  }
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, "index.html");
  if (!fs.existsSync(f)) {
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    return res.end(fs.readFileSync(path.join(qaDir, "404.html")));
  }
  res.writeHead(200, { "Content-Type": tipos[path.extname(f)] ?? "application/octet-stream" });
  res.end(fs.readFileSync(f));
});
await new Promise((r) => srv.listen(Number(process.env.PORTA ?? 0), r));
const base = `http://localhost:${srv.address().port}`;
console.log(`SERVIDOR ..... ${base}`);

if (soServir) {
  console.log("Servindo o build. Ctrl+C para sair.");
  process.on("SIGINT", () => srv.close(() => process.exit(0)));
  process.on("SIGTERM", () => srv.close(() => process.exit(0)));
} else {
  // 3. Playwright
  const codigo = await new Promise((resolve) => {
    const p = spawn("npx", ["playwright", "test", ...extras], {
      cwd: raiz,
      stdio: "inherit",
      env: { ...process.env, BASE_URL: base, EMPRESA: slug },
    });
    p.on("exit", (c) => resolve(c ?? 1));
    p.on("error", () => resolve(1));
  });
  srv.close();
  console.log(`TESTES ${slug} ..... ${codigo === 0 ? "OK" : "FALHA"}  relatorios/${slug}/testes/index.html`);
  process.exit(codigo);
}
