// Prepara a empresa ativa antes do dev/build: copia perfil.json e tema.css para src/tema/ativa
// e os arquivos públicos (logo, favicon) para public/. Uso: EMPRESA=<slug> node scripts/empresa-ativa.mjs
import fs from "node:fs";
import path from "node:path";

const raiz = path.resolve(import.meta.dirname, "..");
const slug = process.env.EMPRESA ?? "logmovy";
const origem = path.join(raiz, "empresas", slug);
if (!fs.existsSync(path.join(origem, "perfil.json"))) {
  console.error(`MAYDAY empresa "${slug}" sem empresas/${slug}/perfil.json`);
  process.exit(1);
}
if (!fs.existsSync(path.join(origem, "tema.css"))) {
  console.error(`MAYDAY empresa "${slug}" sem tema.css. Rode: npm run tema -- ${slug}`);
  process.exit(1);
}
const ativa = path.join(raiz, "src", "tema", "ativa");
fs.rmSync(ativa, { recursive: true, force: true });
fs.mkdirSync(ativa, { recursive: true });
// Só a URL do ambiente ativo entra no build (as outras ficam vazias e não vazam no JS).
const ambiente = process.env.AMBIENTE ?? "dev";
const perfil = JSON.parse(fs.readFileSync(path.join(origem, "perfil.json"), "utf8"));
perfil.api = { dev: "", homologacao: "", producao: "", [ambiente]: perfil.api?.[ambiente] ?? "" };
fs.writeFileSync(path.join(ativa, "perfil.json"), JSON.stringify(perfil, null, 2));
fs.copyFileSync(path.join(origem, "tema.css"), path.join(ativa, "tema.css"));
fs.writeFileSync(path.join(ativa, "LEIA.txt"), `Gerado a partir de empresas/${slug}/. Não editar aqui.\n`);
const pub = path.join(raiz, "public");
fs.rmSync(pub, { recursive: true, force: true });
fs.cpSync(path.join(origem, "public"), pub, { recursive: true });
console.log(`EMPRESA ATIVA ..... ${slug}`);
