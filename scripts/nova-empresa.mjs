#!/usr/bin/env node
// Cria uma empresa nova a partir do modelo logmovy e gera o tema.
// Uso: npm run nova-empresa -- <slug> --nome "Nome" --primaria "#hex" [--secundaria "#hex"] [--superficie "#hex"]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gerar } from "./gerar-tema.mjs";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MODELO = path.join(RAIZ, "empresas", "logmovy");

function lerArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const [k, v] = a.slice(2).split("=");
      out[k] = v ?? argv[++i];
    } else out._.push(a);
  }
  return out;
}

function falhar(msg) {
  console.error(`MAYDAY ${msg}`);
  process.exit(1);
}

const args = lerArgs(process.argv.slice(2));
const slug = args._[0];
const HEX = /^#([0-9a-f]{6})$/i;
if (!slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) falhar('slug inválido (use minúsculas, números e hífen). Ex.: npm run nova-empresa -- acme --nome "Acme" --primaria "#1E40AF"');
if (!args.nome) falhar('falta --nome "Nome da empresa"');
if (!args.primaria || !HEX.test(args.primaria)) falhar('falta --primaria "#rrggbb"');
for (const k of ["secundaria", "superficie"]) if (args[k] && !HEX.test(args[k])) falhar(`--${k} deve ser #rrggbb`);

const destino = path.join(RAIZ, "empresas", slug);
if (fs.existsSync(destino)) falhar(`empresas/${slug} já existe`);

const perfil = JSON.parse(fs.readFileSync(path.join(MODELO, "perfil.json"), "utf8"));
perfil.slug = slug;
perfil.nome = args.nome;

const paleta = { primaria: args.primaria.toUpperCase() };
if (args.secundaria) paleta.secundaria = args.secundaria.toUpperCase();
if (args.superficie) paleta.superficieMarca = args.superficie.toUpperCase();

fs.mkdirSync(path.join(destino, "public"), { recursive: true });
fs.writeFileSync(path.join(destino, "perfil.json"), JSON.stringify(perfil, null, 2) + "\n");
fs.writeFileSync(path.join(destino, "paleta.json"), JSON.stringify(paleta) + "\n");
for (const arq of fs.readdirSync(path.join(MODELO, "public"))) {
  fs.copyFileSync(path.join(MODELO, "public", arq), path.join(destino, "public", arq));
}

const r = gerar(slug);
console.log(`EMPRESA ${slug} criada. Logo e favicon provisórios (copiados de logmovy). Textos do perfil.json ainda são os do modelo.`);
console.log(`TEMA ${slug}: ${r.aprovados}/${r.total} pares AA (${r.pct}%), ${r.ajustes} ajustes${r.primariaClareada ? ", primária clareada no escuro" : ""}`);
process.exit(r.aprovados === r.total ? 0 : 1);
