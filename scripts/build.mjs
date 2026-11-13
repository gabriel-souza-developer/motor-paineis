// Build estático de UMA empresa em UM ambiente.
// Uso: EMPRESA=<slug> AMBIENTE=<dev|homologacao|producao> npm run build:empresa
// Regra do motor: só rodar com ordem explícita do usuário.
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const AMBIENTES = ["dev", "homologacao", "producao"];
const empresa = process.env.EMPRESA;
const ambiente = process.env.AMBIENTE;

function mayday(msg) {
  console.error(`MAYDAY ${msg}`);
  process.exit(1);
}

if (!empresa) mayday("informe EMPRESA=<slug>");
if (!AMBIENTES.includes(ambiente)) mayday(`informe AMBIENTE=${AMBIENTES.join("|")}`);

const raiz = path.resolve(import.meta.dirname, "..");
const perfil = JSON.parse(fs.readFileSync(path.join(raiz, "empresas", empresa, "perfil.json"), "utf8"));
const url = perfil.api?.[ambiente];
if (!url) mayday(`perfil.json de ${empresa} sem URL da API para "${ambiente}"`);
if (ambiente === "producao" && /\/dev\b/i.test(url)) mayday(`URL de producao aponta para Dev: ${url}`);

console.log(`BUILD ${empresa} ${ambiente} COTEJADO`);
execSync("node scripts/gerar-tema.mjs " + empresa, { stdio: "inherit", cwd: raiz });

const saida = path.join(raiz, "dist", empresa);
fs.rmSync(saida, { recursive: true, force: true });
fs.rmSync(path.join(raiz, "out"), { recursive: true, force: true });
const env = { ...process.env, EMPRESA: empresa, AMBIENTE: ambiente, MOCK: "0" };
execSync("node scripts/empresa-ativa.mjs && npx next build", { stdio: "inherit", cwd: raiz, env });
fs.mkdirSync(path.dirname(saida), { recursive: true });
fs.renameSync(path.join(raiz, "out"), saida);

// Conferência: um html por página do app
const paginas = fs.readdirSync(path.join(raiz, "src", "app"), { recursive: true })
  .filter((f) => f.endsWith("page.tsx"))
  .map((f) => path.dirname(f).split(path.sep).filter((p) => !p.startsWith("(") && p !== ".").join("/"));
const faltando = paginas.filter((r) => !fs.existsSync(path.join(saida, r, "index.html")));
if (faltando.length) mayday(`páginas sem html: ${faltando.join(", ")}`);
if (!fs.existsSync(path.join(saida, "404.html"))) mayday("404.html não gerado");
const jsComDev = ambiente === "producao" && execSync(`grep -rl "/Dev/" ${saida} || true`).toString().trim();
if (jsComDev) mayday(`build de producao contém referência a Dev: ${jsComDev}`);

const linha = `| ${new Date().toISOString().slice(0, 16).replace("T", " ")} | ${empresa} | ${ambiente} | ${url} | OK |\n`;
const reg = path.join(raiz, "registro.md");
if (!fs.existsSync(reg)) fs.writeFileSync(reg, "# Registro de builds\n\n| Data | Empresa | Ambiente | API | Resultado |\n|---|---|---|---|---|\n");
fs.appendFileSync(reg, linha);
console.log(`BUILD ${empresa} ${ambiente} STATUS: PRONTO > dist/${empresa}/`);
