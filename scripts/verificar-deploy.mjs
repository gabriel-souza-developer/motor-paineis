// Confere um site JÁ PUBLICADO. Só leitura, sem login.
// Uso: npm run verificar-deploy -- <slug> <url> [--ambiente <dev|homologacao|producao>]
// Rodar sempre depois de subir os arquivos no servidor.
import fs from "node:fs";
import path from "node:path";

const raiz = path.resolve(import.meta.dirname, "..");
const args = process.argv.slice(2);
const iAmb = args.indexOf("--ambiente");
const ambiente = iAmb >= 0 ? args[iAmb + 1] : undefined;
const posicionais = args.filter((a, i) => !a.startsWith("--") && !(iAmb >= 0 && i === iAmb + 1));
const [slug, urlBruta] = posicionais;
const AMBIENTES = ["dev", "homologacao", "producao"];

if (!slug || !urlBruta) {
  console.error("MAYDAY uso: npm run verificar-deploy -- <slug> <url> [--ambiente <dev|homologacao|producao>]");
  process.exit(1);
}
if (iAmb >= 0 && !AMBIENTES.includes(ambiente)) {
  console.error(`MAYDAY --ambiente deve ser ${AMBIENTES.join("|")}`);
  process.exit(1);
}
const arqPerfil = path.join(raiz, "empresas", slug, "perfil.json");
if (!fs.existsSync(arqPerfil)) {
  console.error(`MAYDAY empresa "${slug}" sem empresas/${slug}/perfil.json`);
  process.exit(1);
}
const perfil = JSON.parse(fs.readFileSync(arqPerfil, "utf8"));
const base = urlBruta.replace(/\/+$/, "");
const pasta = path.join(raiz, "relatorios", slug);
fs.mkdirSync(pasta, { recursive: true });

const linhas = [];
const avisos = [];
let falhas = 0;
const item = (nome, ok, detalhe = "") => {
  if (!ok) falhas++;
  linhas.push(`${nome.padEnd(30, ".")} ${ok ? "OK" : "FALHA"}${detalhe ? "  " + detalhe : ""}`);
};

async function pedir(rota, opcoes = {}) {
  try {
    const r = await fetch(base + rota, { redirect: "manual", signal: AbortSignal.timeout(15000), ...opcoes });
    const tipo = r.headers.get("content-type") ?? "";
    const corpo = opcoes.method === "HEAD" ? "" : await r.text();
    return { status: r.status, tipo, corpo, local: r.headers.get("location") ?? "" };
  } catch (e) {
    return { status: 0, tipo: "", corpo: "", local: "", erro: String(e.cause?.code ?? e.message) };
  }
}

// 1. Páginas do app (grupos entre parênteses não entram na URL)
const rotas = fs
  .readdirSync(path.join(raiz, "src", "app"), { recursive: true })
  .filter((f) => f.endsWith("page.tsx"))
  .map((f) => path.dirname(f).split(path.sep).filter((p) => p !== "." && !p.startsWith("(")).join("/"))
  .sort();

const html = {};
const ruins = [];
let semRedirectBarra = [];
for (const r of rotas) {
  const comBarra = r ? `/${r}/` : "/";
  const a = await pedir(comBarra);
  if (a.status !== 200 || !/text\/html/.test(a.tipo)) ruins.push(`${comBarra} ${a.status || a.erro}`);
  else html[comBarra] = a.corpo;
  if (!r) continue;
  const b = await pedir(`/${r}`);
  const destinoOk = (loc) => new URL(loc, base + "/").pathname === comBarra;
  if (b.status === 200 && /text\/html/.test(b.tipo)) continue;
  if ([301, 302, 307, 308].includes(b.status) && destinoOk(b.local)) continue;
  if (b.status === 404) semRedirectBarra.push(`/${r}`);
  else ruins.push(`/${r} ${b.status || b.erro}${b.local ? " > " + b.local : ""}`);
}
item("PAGINAS 200", ruins.length === 0, ruins.length ? ruins.slice(0, 6).join(", ") : `${rotas.length} rotas, com e sem barra final`);
if (semRedirectBarra.length) {
  avisos.push(`PAN-PAN servidor sem redirect de barra final: links diretos sem barra quebram (${semRedirectBarra.join(", ")})`);
}

// 2. Título do login
const titulo = (html["/login/"] ?? "").match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? "";
item("TITULO DO LOGIN", titulo.includes(perfil.nome), titulo ? `"${titulo}"` : "sem <title>");

// 3. Arquivos /_next referenciados no login e no painel
const refs = new Set();
for (const p of ["/login/", "/painel/"]) {
  for (const m of (html[p] ?? "").matchAll(/\/_next\/[A-Za-z0-9_\-.\/~%@]+/g)) {
    refs.add(m[0].replace(/[.\/]+$/, ""));
  }
}
const faltando = [];
const cssRuim = [];
const js = [];
for (const ref of refs) {
  const r = await pedir(ref);
  if (r.status !== 200) faltando.push(`${ref} ${r.status || r.erro}`);
  else if (ref.endsWith(".css") && !/^text\/css/.test(r.tipo)) cssRuim.push(`${ref} (${r.tipo || "sem tipo"})`);
  if (r.status === 200 && ref.endsWith(".js")) js.push({ ref, corpo: r.corpo });
}
item("ARQUIVOS _NEXT", refs.size > 0 && faltando.length === 0, refs.size ? (faltando.length ? faltando.slice(0, 4).join(", ") : `${refs.size} arquivos`) : "nenhum referenciado");
item("CSS TEXT/CSS", cssRuim.length === 0, cssRuim.slice(0, 3).join(", "));

// 4. 404
const n = await pedir("/rota-que-nao-existe");
item("PAGINA 404", n.status === 404 && n.corpo.includes("Página não encontrada"), `status ${n.status || n.erro}`);

// 5. Favicon
const fav = await pedir(`/${perfil.logos.favicon}`);
item("FAVICON", fav.status === 200, `/${perfil.logos.favicon} ${fav.status || fav.erro}`);

// 6. Ambiente
if (ambiente) {
  const url = perfil.api?.[ambiente];
  const comApi = url ? js.filter((j) => j.corpo.includes(url)) : [];
  item(`API ${ambiente.toUpperCase()}`, !!url && comApi.length > 0, url ? (comApi.length ? url : `nenhum JS contém ${url}`) : "URL vazia no perfil");
  if (ambiente === "producao") {
    const comDev = js.filter((j) => j.corpo.includes("/Dev/")).map((j) => j.ref);
    item("PRODUCAO SEM DEV", comDev.length === 0, comDev.slice(0, 3).join(", "));
    if (comDev.length) avisos.push(`MAYDAY build de producao com referência a /Dev/: ${comDev.slice(0, 3).join(", ")}`);
  }
}

// 7. Opcional: navegador real
let pw;
try {
  pw = await import("@playwright/test");
} catch {
  /* sem playwright */
}
const chrome = process.env.CHROME ?? ["/usr/bin/google-chrome", "/usr/bin/chromium"].find((p) => fs.existsSync(p));
if (pw && chrome) {
  let browser;
  try {
    browser = await pw.chromium.launch({ executablePath: chrome });
  } catch {
    linhas.push(`${"NAVEGADOR LOGIN".padEnd(30, ".")} PULADO  chrome não abriu (${chrome})`);
  }
  if (browser) {
    try {
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      const erros = [];
      page.on("pageerror", (e) => erros.push(e.message.slice(0, 120)));
      await page.goto(base + "/login/", { waitUntil: "networkidle", timeout: 30000 });
      const visivel = await page.getByRole("button", { name: "Entrar no painel" }).isVisible();
      await page.screenshot({ path: path.join(pasta, "deploy-login.png"), fullPage: true });
      item("NAVEGADOR LOGIN", visivel && erros.length === 0, erros.length ? erros.slice(0, 2).join(" | ") : visivel ? `relatorios/${slug}/deploy-login.png` : "botão Entrar no painel não visível");
    } catch (e) {
      item("NAVEGADOR LOGIN", false, String(e.message).split("\n")[0]);
    } finally {
      await browser?.close();
    }
  }
} else {
  linhas.push(`${"NAVEGADOR LOGIN".padEnd(30, ".")} PULADO  playwright ou chrome indisponível`);
}

const saida =
  `DEPLOY ${slug} ${base}${ambiente ? " " + ambiente : ""} STATUS: ${falhas ? "PARCIAL" : "PRONTO"}\n` +
  linhas.join("\n") +
  (avisos.length ? "\n" + avisos.join("\n") : "");
fs.writeFileSync(path.join(pasta, "deploy-checklist.txt"), saida + "\n");
console.log(saida);
process.exit(falhas ? 1 : 0);
