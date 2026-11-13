// QA do motor. Uso: npm run checar -- <slug>   (padrão: logmovy)
// Checagens estáticas + capturas Playwright (desktop, celular, movimento reduzido).
// Não corrige nada: só aponta.
import { execSync, spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const raiz = path.resolve(import.meta.dirname, "..");
const slug = process.argv[2] ?? "logmovy";
const pasta = path.join(raiz, "relatorios", slug);
fs.mkdirSync(pasta, { recursive: true });
const linhas = [];
let falhas = 0;
const item = (nome, ok, detalhe = "") => {
  if (!ok) falhas++;
  linhas.push(`${nome.padEnd(28, ".")} ${ok ? "OK" : "FALHA"}${detalhe ? "  " + detalhe : ""}`);
};

function arquivos(dir, ext) {
  return fs.readdirSync(dir, { recursive: true }).filter((f) => ext.some((e) => f.endsWith(e))).map((f) => path.join(dir, f));
}
const fontes = arquivos(path.join(raiz, "src"), [".ts", ".tsx", ".css"]).filter((f) => !f.includes(`${path.sep}ativa${path.sep}`));

// 1. Cor fixa (exceção: logo do Google marcada com "marca-google")
const corFixa = /#[0-9a-fA-F]{3,8}\b|rgba?\(|\b(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b|\b(text|bg|border)-(white|black)\b/;
const comCor = [];
for (const f of fontes) {
  if (f.endsWith("estilos.css")) continue;
  fs.readFileSync(f, "utf8").split("\n").forEach((l, i) => {
    if (corFixa.test(l) && !l.includes("marca-google")) comCor.push(`${path.relative(raiz, f)}:${i + 1}`);
  });
}
item("CORES FIXAS", comCor.length === 0, comCor.slice(0, 8).join(", "));

// 2. Travessão em textos
const trav = [];
for (const f of [...fontes, ...arquivos(path.join(raiz, "empresas", slug), [".json"])]) {
  fs.readFileSync(f, "utf8").split("\n").forEach((l, i) => /[–—]/.test(l) && trav.push(`${path.relative(raiz, f)}:${i + 1}`));
}
item("TRAVESSAO", trav.length === 0, trav.slice(0, 8).join(", "));

// 3. Texto de empresa fixo no código
const perfil = JSON.parse(fs.readFileSync(path.join(raiz, "empresas", slug, "perfil.json"), "utf8"));
const comNome = fontes.filter((f) => new RegExp(`\\b${perfil.nome}\\b`, "i").test(fs.readFileSync(f, "utf8")));
item("EMPRESA NO CODIGO", comNome.length === 0, comNome.map((f) => path.relative(raiz, f)).join(", "));

// 3b. Ícones do perfil existem no Lucide
const { icons } = await import("lucide-react");
const nomesIcones = [...JSON.stringify(perfil).matchAll(/"icone":"([^"]+)"/g)].map((m) => m[1]);
const pascal = (n) => n.replace(/(^|-)(\w)/g, (_, __, c) => c.toUpperCase());
const semIcone = [...new Set(nomesIcones.filter((n) => !icons[pascal(n)]))];
item("ICONES DO PERFIL", semIcone.length === 0, semIcone.join(", "));

// 5. Contraste (relatório do tema)
const rel = path.join(raiz, "empresas", slug, "relatorio-cores.md");
const relTxt = fs.existsSync(rel) ? fs.readFileSync(rel, "utf8") : "";
item("CONTRASTE AA", !!relTxt && !/REPROVADO|FALHA/.test(relTxt), relTxt ? "" : "rode npm run tema");

// 6. Typecheck
try {
  execSync("node scripts/empresa-ativa.mjs && npx tsc --noEmit", { cwd: raiz, stdio: "pipe", env: { ...process.env, EMPRESA: slug } });
  item("TYPECHECK", true);
} catch (e) {
  item("TYPECHECK", false, String(e.stdout).split("\n").slice(0, 4).join(" | "));
}

// 7. Capturas
const chrome = process.env.CHROME ?? ["/usr/bin/google-chrome", "/usr/bin/chromium"].find((p) => fs.existsSync(p));
let pw;
try {
  pw = await import("@playwright/test");
} catch {
  /* sem playwright */
}
if (!pw) {
  item("CAPTURAS", false, "playwright indisponível");
} else {
  // Testa o BUILD ESTÁTICO real (com mock), servido como arquivos, igual ao servidor de destino.
  const qaDir = path.join(raiz, ".qa-build", slug);
  fs.rmSync(qaDir, { recursive: true, force: true });
  fs.rmSync(path.join(raiz, "out"), { recursive: true, force: true });
  execSync("node scripts/empresa-ativa.mjs && npx next build", { cwd: raiz, stdio: "pipe", env: { ...process.env, EMPRESA: slug, MOCK: "1" } });
  fs.mkdirSync(path.dirname(qaDir), { recursive: true });
  fs.renameSync(path.join(raiz, "out"), qaDir);
  const estatico = qaDir;
  const paginas = fs.readdirSync(path.join(raiz, "src", "app"), { recursive: true }).filter((f) => f.endsWith("page.tsx"))
    .map((f) => path.dirname(f).split(path.sep).filter((p) => !p.startsWith("(") && p !== ".").join("/"));
  const semHtml = paginas.filter((r) => !fs.existsSync(path.join(estatico, r, "index.html")));
  item("HTML POR ROTA", semHtml.length === 0 && fs.existsSync(path.join(estatico, "404.html")), semHtml.join(", "));
  const http = await import("node:http");
  const tipos = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".json": "application/json", ".txt": "text/plain", ".woff2": "font/woff2", ".ico": "image/x-icon" };
  const srv = http.createServer((req, res) => {
    const u = decodeURIComponent(new URL(req.url, "http://x").pathname);
    let f = path.join(estatico, u);
    if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, "index.html");
    if (!fs.existsSync(f)) { res.writeHead(404, { "Content-Type": "text/html" }); return res.end(fs.readFileSync(path.join(estatico, "404.html"))); }
    res.writeHead(200, { "Content-Type": tipos[path.extname(f)] ?? "application/octet-stream" });
    res.end(fs.readFileSync(f));
  });
  await new Promise((r) => srv.listen(0, r));
  const base = `http://localhost:${srv.address().port}`;
  const browser = await pw.chromium.launch(chrome ? { executablePath: chrome } : {});
  const erros = [];
  const telas = [
    ["login", "/login", false],
    ["esqueci-senha", "/esqueci-senha", false],
    ["painel", "/painel", true],
    ["perfil", "/perfil", true],
  ];
  const modos = [
    ["desktop", { viewport: { width: 1440, height: 900 } }],
    ["celular", { viewport: { width: 390, height: 844 }, isMobile: true }],
    ["reduzido", { viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" }],
  ];
  for (const [modo, opts] of modos) {
    const ctx = await browser.newContext(opts);
    const page = await ctx.newPage();
    page.on("pageerror", (e) => erros.push(`${modo}: ${e.message}`));
    page.on("console", (m) => m.type() === "error" && erros.push(`${modo}: ${m.text().slice(0, 120)}`));
    for (const [nome, rota, logado] of telas) {
      if (logado) {
        await page.goto(base + "/login");
        await page.evaluate((s) => sessionStorage.setItem(`${s}_sessao`, JSON.stringify({ token: "mock", expiraEm: Date.now() + 3.6e6, usuario: { id: "1", nome: "Operador Teste", email: `teste@${s}.com`, funcao: "Operador de Escalas e Monitoramento", status: "autenticado" } })), slug);
      }
      await page.goto(base + rota, { waitUntil: "networkidle" });
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(pasta, `${nome}-${modo}.png`), fullPage: true });
    }
    await ctx.close();
  }
  await browser.close();
  srv.close();
  fs.rmSync(path.join(raiz, ".qa-build"), { recursive: true, force: true });
  const errosUteis = erros.filter((e) => !/favicon|Download the React DevTools/.test(e));
  item("CAPTURAS", true, `relatorios/${slug}/ (${telas.length * modos.length} imagens)`);
  item("ERROS NO CONSOLE", errosUteis.length === 0, errosUteis.slice(0, 4).join(" | "));
}

const saida = `QA ${slug} STATUS: ${falhas ? "PARCIAL" : "PRONTO"}\n` + linhas.join("\n");
fs.writeFileSync(path.join(pasta, "checklist.txt"), saida + "\n");
console.log(saida);
process.exit(falhas ? 1 : 0);
