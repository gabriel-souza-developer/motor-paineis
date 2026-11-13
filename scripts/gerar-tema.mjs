#!/usr/bin/env node
// Gera empresas/<slug>/tema.css e empresas/<slug>/relatorio-cores.md a partir de paleta.json.
// Uso: npm run tema -- <slug>   (sem slug: todas as empresas)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { oklch, clampChroma, formatHex, parse } from "culori";
import Color from "colorjs.io";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PASTA_EMPRESAS = path.join(RAIZ, "empresas");

// ---------- utilidades de cor ----------
const PASSOS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const L_ESCALA = { 50: 0.975, 100: 0.95, 200: 0.9, 300: 0.83, 400: 0.75, 500: 0.67, 600: 0.58, 700: 0.5, 800: 0.42, 900: 0.34, 950: 0.25 };
const C_FATOR = { 50: 0.12, 100: 0.22, 200: 0.42, 300: 0.65, 400: 0.88, 500: 1, 600: 1, 700: 0.92, 800: 0.82, 900: 0.7, 950: 0.6 };

const limitar = (v, a, b) => Math.min(b, Math.max(a, v));
const norm = (h) => ((h % 360) + 360) % 360;

function paraOklch(entrada) {
  const c = oklch(parse(entrada));
  if (!c) throw new Error(`cor inválida: ${entrada}`);
  return { l: c.l, c: c.c ?? 0, h: c.h ?? 0 };
}

// OKLCH > hex, com croma reduzido até caber em sRGB
function hex({ l, c, h }) {
  const cor = clampChroma({ mode: "oklch", l: limitar(l, 0, 1), c: Math.max(0, c), h: norm(h) }, "oklch", "rgb");
  return formatHex(cor);
}

const contraste = (a, b) => Math.abs(Color.contrast(a.slice(0, 7), b.slice(0, 7), "WCAG21"));

// Move L de `cor` (passo 0.005) até atingir `minimo` sobre `fundo`. Direção automática: afasta do fundo.
function ajustarL(cor, fundoHex, minimo) {
  const inicial = hex(cor);
  if (contraste(inicial, fundoHex) >= minimo) return { hex: inicial, ajustado: false, l: cor.l };
  const fundoL = paraOklch(fundoHex).l;
  const dir = fundoL > 0.5 ? -1 : 1;
  let l = cor.l;
  for (let i = 0; i < 200; i++) {
    l = limitar(l + dir * 0.005, 0, 1);
    const h = hex({ ...cor, l });
    if (contraste(h, fundoHex) >= minimo) return { hex: h, ajustado: true, l, de: cor.l };
    if (l === 0 || l === 1) break;
  }
  throw new Error(`não foi possível atingir ${minimo}:1 para ${inicial} sobre ${fundoHex}`);
}

function escala(base, { cromaFixo } = {}) {
  const out = {};
  for (const p of PASSOS) {
    const c = cromaFixo !== undefined ? cromaFixo * (p <= 100 || p >= 900 ? 0.8 : 1) : base.c * C_FATOR[p];
    out[p] = hex({ l: L_ESCALA[p], c, h: base.h });
  }
  return out;
}

// ---------- geração ----------
function gerar(slug) {
  const pasta = path.join(PASTA_EMPRESAS, slug);
  const arqPaleta = path.join(pasta, "paleta.json");
  if (!fs.existsSync(arqPaleta)) throw new Error(`MAYDAY empresa "${slug}" sem paleta.json`);
  const paleta = JSON.parse(fs.readFileSync(arqPaleta, "utf8"));
  if (!paleta.primaria) throw new Error(`MAYDAY ${slug}: paleta.json sem "primaria"`);

  const notas = [];
  const P = paraOklch(paleta.primaria);
  const primariaHex = formatHex(parse(paleta.primaria));
  const S = paleta.secundaria
    ? paraOklch(paleta.secundaria)
    : { l: 0.67, c: Math.max(0.1, P.c * 0.8), h: norm(P.h + 150) };
  if (!paleta.secundaria) notas.push(`Sem secundária na paleta: gerada no hue ${S.h.toFixed(0)} (primária + 150°).`);
  const hueNeutro = paleta.secundaria ? S.h : P.h;
  const N = { l: 0.5, c: 0.015, h: hueNeutro };

  const esc = { primaria: escala(P), secundaria: escala(S), neutro: escala(N, { cromaFixo: 0.015 }) };

  // Superfície da marca
  let m1;
  if (paleta.superficieMarca) {
    m1 = paraOklch(paleta.superficieMarca);
  } else {
    m1 = { l: 0.13, c: 0.02, h: S.h };
    notas.push("Sem superficieMarca na paleta: gerada com L 0,13 no hue da secundária.");
  }
  const marca = {
    1: paleta.superficieMarca ? formatHex(parse(paleta.superficieMarca)) : hex(m1),
    2: hex({ ...m1, l: m1.l + 0.02 }),
    3: hex({ ...m1, l: m1.l + 0.04 }),
    borda: hex({ l: 0.28, c: Math.min(0.03, Math.max(m1.c, 0.012)), h: m1.h }),
    texto: hex({ l: 0.97, c: 0.006, h: m1.h }),
  };
  // texto suave: AA sobre a superfície mais clara (-3) garante também -1 e -2
  const suave = ajustarL({ l: 0.72, c: 0.02, h: m1.h }, marca[3], 4.5);
  marca.textoSuave = suave.hex;

  const AZUL_ESCURO = hex({ l: 0.18, c: 0.03, h: 260 });
  const BRANCO = "#ffffff";
  const melhorTexto = (fundo) => (contraste(AZUL_ESCURO, fundo) >= contraste(BRANCO, fundo) ? AZUL_ESCURO : BRANCO);

  // Primária para fundos escuros (marca-* e .dark)
  let primariaEscuro = primariaHex;
  let primariaClareada = false;
  if (P.l < 0.5 || contraste(primariaHex, marca[1]) < 3) {
    const r = ajustarL({ ...P, l: Math.max(P.l, 0.72) }, marca[1], 3);
    primariaEscuro = r.hex;
    primariaClareada = true;
    notas.push(
      `Primária escura (L ${P.l.toFixed(2)}): no .dark e sobre marca-* usa a primária clareada ${primariaEscuro} (L ${r.l.toFixed(2)}), contraste ${contraste(primariaEscuro, marca[1]).toFixed(2)}:1 sobre marca-superficie-1. No tema claro, --primary segue a original ${primariaHex}; dentro de .bg-marca-1/2/3 o tema.css redefine --primary para a versão clareada.`
    );
  }

  const degradeDe = (hx) => {
    const o = paraOklch(hx);
    // desloca ~25° rumo à faixa verde/ciano (hue ~165)
    const dh = o.h >= 165 && o.h < 345 ? -25 : 25;
    return hex({ ...o, h: o.h + dh });
  };
  const hoverDe = (hx, escuro) => {
    const o = paraOklch(hx);
    return hex({ ...o, l: o.l + (escuro && o.l < 0.75 ? 0.05 : -0.05) });
  };
  const comAlpha = (hx, a) => hx + Math.round(a * 255).toString(16).padStart(2, "0");

  const ajustes = [];
  const registrar = (tema, token, r, fundo, min) => {
    if (r.ajustado) ajustes.push(`${tema}: ${token} teve L ajustado de ${r.de.toFixed(3)} para ${r.l.toFixed(3)} para atingir ${min}:1 sobre ${fundo}.`);
    return r.hex;
  };
  if (suave.ajustado) registrar("ambos", "--marca-superficie-texto-suave", suave, "marca-superficie-3", 4.5);

  const HUES = { success: 145, warning: 75, info: 235, destructive: 25 };

  function tema(nome) {
    const escuro = nome === "escuro";
    const t = {};
    if (!escuro) {
      t.background = esc.neutro[50];
      t.card = "#ffffff";
      t.foreground = esc.neutro[950];
      t.muted = esc.neutro[100];
      t.border = esc.neutro[200];
      t.input = esc.neutro[200];
    } else {
      t.background = hex({ l: 0.16, c: 0.015, h: hueNeutro });
      t.card = hex({ l: 0.205, c: 0.016, h: hueNeutro });
      t.foreground = esc.neutro[50];
      t.muted = hex({ l: 0.26, c: 0.016, h: hueNeutro });
      t.border = hex({ l: 0.3, c: 0.016, h: hueNeutro });
      t.input = hex({ l: 0.33, c: 0.016, h: hueNeutro });
    }
    t["card-foreground"] = t.foreground;
    t.foreground = registrar(nome, "--foreground", ajustarL(paraOklch(t.foreground), t.background, 4.5), "--background", 4.5);
    t["card-foreground"] = registrar(nome, "--card-foreground", ajustarL(paraOklch(t["card-foreground"]), t.card, 4.5), "--card", 4.5);

    // muted-foreground: escala do neutro, AA sobre card e muted
    const mfBase = paraOklch(escuro ? esc.neutro[400] : esc.neutro[500]);
    const pior = escuro ? t.muted : t.muted; // muted é o fundo mais exigente dos dois
    t["muted-foreground"] = registrar(nome, "--muted-foreground", ajustarL(mfBase, pior, 4.5), "--muted", 4.5);

    t.primary = escuro ? primariaEscuro : primariaHex;
    t["primary-foreground"] = melhorTexto(t.primary);
    t["primary-hover"] = hoverDe(t.primary, escuro);
    t["primary-degrade"] = degradeDe(t.primary);
    t.brilho = comAlpha(t.primary, 0.25);
    t.ring = t.primary;

    // primary-texto: tom da escala da primária com >= 4.5:1
    if (!escuro) {
      const cand = PASSOS.map((p) => esc.primaria[p]).find((h) => contraste(h, t.card) >= 4.5 && contraste(h, t.background) >= 4.5);
      t["primary-texto"] = cand ?? registrar(nome, "--primary-texto", ajustarL(P, t.background, 4.5), "--background", 4.5);
    } else {
      const fundoMaisClaro = t.card; // card é mais claro que background no escuro
      const original = paraOklch(t.primary);
      const r = ajustarL(original, fundoMaisClaro, 4.5);
      t["primary-texto"] = registrar(nome, "--primary-texto", r, "--card", 4.5);
    }

    // secundária
    const sec = paleta.secundaria ? formatHex(parse(paleta.secundaria)) : hex(S);
    t.secondary = escuro && paraOklch(sec).l < 0.5 ? hex({ ...paraOklch(sec), l: 0.72 }) : sec;

    // estados
    const estado = (h, lBase, c) => (escuro ? { l: Math.max(lBase, 0.72), c, h } : { l: lBase, c, h });
    t.destructive = registrar(nome, "--destructive", ajustarL(estado(HUES.destructive, escuro ? 0.68 : 0.58, 0.21), t.card, 4.5), "--card", 4.5);
    for (const [k, lb, c] of [["success", 0.7, 0.17], ["warning", 0.79, 0.16], ["info", 0.68, 0.14]]) {
      t[k] = hex(estado(HUES[k], lb, c));
      const base = escuro ? { l: 0.78, c, h: HUES[k] } : { l: 0.55, c, h: HUES[k] };
      t[`${k}-texto`] = registrar(nome, `--${k}-texto`, ajustarL(base, t.card, 4.5), "--card", 4.5);
    }

    // ícones e gráficos: >= 3:1 sobre card
    const PO = paraOklch(t.primary);
    const SO = paraOklch(t.secondary);
    const lAlvo = escuro ? 0.74 : 0.6;
    const huesIcone = [PO.h, SO.h, PO.h + 30, PO.h - 30, SO.h + 35];
    const huesChart = [PO.h, SO.h, PO.h + 60, SO.h + 60, PO.h + 180];
    const fam = (lista, prefixo) =>
      lista.forEach((h, i) => {
        const cBase = i === 0 ? PO.c : i === 1 ? SO.c : Math.max(0.12, (PO.c + SO.c) / 2);
        const base = { l: i === 0 && !escuro ? Math.min(PO.l, lAlvo) : lAlvo, c: cBase, h };
        t[`${prefixo}-${i + 1}`] = registrar(nome, `--${prefixo}-${i + 1}`, ajustarL(base, t.card, 3), "--card", 3);
      });
    fam(huesIcone, "icone");
    fam(huesChart, "chart");
    return t;
  }

  const claro = tema("claro");
  const escuro = tema("escuro");

  const varsMarca = {
    "marca-superficie-1": marca[1],
    "marca-superficie-2": marca[2],
    "marca-superficie-3": marca[3],
    "marca-superficie-borda": marca.borda,
    "marca-superficie-texto": marca.texto,
    "marca-superficie-texto-suave": marca.textoSuave,
    "marca-primary": primariaEscuro,
  };

  // ---------- CSS ----------
  const ORDEM = [
    "background", "foreground", "card", "card-foreground", "primary", "primary-foreground", "primary-hover",
    "primary-texto", "primary-degrade", "brilho", "secondary", "muted", "muted-foreground", "border", "input", "ring",
    "destructive", "success", "success-texto", "warning", "warning-texto", "info", "info-texto",
    "icone-1", "icone-2", "icone-3", "icone-4", "icone-5", "chart-1", "chart-2", "chart-3", "chart-4", "chart-5",
  ];
  const bloco = (sel, t, extra = {}) =>
    `${sel} {\n${[...ORDEM.map((k) => `  --${k}: ${t[k]};`), ...Object.entries(extra).map(([k, v]) => `  --${k}: ${v};`)].join("\n")}\n}\n`;

  const escalasCss = Object.entries(esc)
    .map(([nome, e]) => PASSOS.map((p) => `  --escala-${nome}-${p}: ${e[p]};`).join("\n"))
    .join("\n");

  let css = `/* Gerado por scripts/gerar-tema.mjs para "${slug}". Não editar à mão: rode npm run tema -- ${slug} */\n`;
  css += bloco(":root", claro, varsMarca).replace(/\n}\n$/, `\n${escalasCss}\n}\n`);
  css += "\n" + bloco(".dark", escuro, varsMarca);
  if (primariaClareada) {
    const fg = melhorTexto(primariaEscuro);
    css += `\n/* Primária escura: sobre a superfície da marca usa a versão clareada */\n`;
    css += `.superficie-marca, .bg-marca-1, .bg-marca-2, .bg-marca-3 {\n  --primary: ${primariaEscuro};\n  --primary-foreground: ${fg};\n  --primary-hover: ${hoverDe(primariaEscuro, true)};\n  --primary-texto: ${primariaEscuro};\n  --primary-degrade: ${degradeDe(primariaEscuro)};\n  --brilho: ${comAlpha(primariaEscuro, 0.25)};\n  --ring: ${primariaEscuro};\n}\n`;
  }
  fs.writeFileSync(path.join(pasta, "tema.css"), css);

  // ---------- relatório ----------
  const pares = (t, nomeTema) => {
    const lista = [
      ["foreground", "background", 4.5],
      ["card-foreground", "card", 4.5],
      ["muted-foreground", "card", 4.5],
      ["muted-foreground", "muted", 4.5],
      ["primary-foreground", "primary", 4.5],
      ["primary-texto", "card", 4.5],
      ...(nomeTema === "escuro" ? [["primary-texto", "background", 4.5]] : [["primary-texto", "background", 4.5]]),
      ["marca-superficie-texto", "marca-superficie-1", 4.5],
      ["marca-superficie-texto-suave", "marca-superficie-1", 4.5],
      ["marca-superficie-texto-suave", "marca-superficie-3", 4.5],
      [primariaClareada ? "marca-primary" : "primary", "marca-superficie-1", 3],
      ["destructive", "card", 4.5],
      ["success-texto", "card", 4.5],
      ["warning-texto", "card", 4.5],
      ["info-texto", "card", 4.5],
      ...[1, 2, 3, 4, 5].map((i) => [`icone-${i}`, "card", 3]),
      ...[1, 2, 3, 4, 5].map((i) => [`chart-${i}`, "card", 3]),
    ];
    const todos = { ...t, ...varsMarca };
    const ajustadosTema = new Set(
      ajustes.filter((a) => a.startsWith(nomeTema + ":") || a.startsWith("ambos:")).map((a) => a.split(" ")[1])
    );
    return lista.map(([a, b, min]) => {
      const r = contraste(todos[a], todos[b]);
      const ok = r >= min;
      const status = !ok ? "REPROVADO" : ajustadosTema.has(`--${a}`) ? "AJUSTADO" : "OK";
      return { par: `${a} / ${b}`, a: todos[a], b: todos[b], r, min, status, ok };
    });
  };
  const rc = pares(claro, "claro");
  const re = pares(escuro, "escuro");
  const todosPares = [...rc, ...re];
  const aprovados = todosPares.filter((p) => p.ok).length;
  const pct = ((aprovados / todosPares.length) * 100).toFixed(0);

  const tabela = (linhas) =>
    "| Par | Cores | Razão WCAG 2.1 | Mínimo | Resultado |\n|---|---|---|---|---|\n" +
    linhas.map((p) => `| ${p.par} | ${p.a} sobre ${p.b} | ${p.r.toFixed(2)}:1 | ${p.min}:1 | ${p.status} |`).join("\n");

  const md = `# Relatório de cores: ${slug}

Gerado por scripts/gerar-tema.mjs. Contraste calculado com colorjs.io (algoritmo WCAG21).

## Entrada (paleta.json)

- Primária: ${primariaHex} (OKLCH L ${P.l.toFixed(3)}, C ${P.c.toFixed(3)}, H ${P.h.toFixed(1)})
- Secundária: ${paleta.secundaria ? formatHex(parse(paleta.secundaria)) : `gerada ${hex(S)}`}
- Superfície da marca: ${paleta.superficieMarca ? formatHex(parse(paleta.superficieMarca)) : `gerada ${marca[1]}`}

## Resumo

- Pares avaliados: ${todosPares.length}
- Aprovados em AA: ${aprovados} (${pct}%)
- Ajustes automáticos: ${ajustes.length}

## Tema claro (:root)

${tabela(rc)}

## Tema escuro (.dark)

${tabela(re)}

## Ajustes automáticos

${ajustes.length ? ajustes.map((a) => `- ${a}`).join("\n") : "- Nenhum."}

## Observações

${notas.length ? notas.map((n) => `- ${n}`).join("\n") : "- Nenhuma."}
- --primary-texto (claro) é o tom mais claro da escala da primária com pelo menos 4,5:1 sobre card e background.
- --primary-degrade é a primária com hue deslocado 25° rumo ao verde/ciano, mesma faixa de L.
- --brilho é a primária com alpha 0,25.

## Escalas OKLCH

| Passo | Primária | Secundária | Neutro |
|---|---|---|---|
${PASSOS.map((p) => `| ${p} | ${esc.primaria[p]} | ${esc.secundaria[p]} | ${esc.neutro[p]} |`).join("\n")}
`;
  if (/[–—]/.test(md)) throw new Error("relatório contém travessão");
  fs.writeFileSync(path.join(pasta, "relatorio-cores.md"), md);
  return { slug, total: todosPares.length, aprovados, pct, ajustes: ajustes.length, primariaClareada };
}

// ---------- CLI ----------
export { gerar };

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2).filter((a) => !a.startsWith("-"));
  const slugs = args.length
    ? args
    : fs.readdirSync(PASTA_EMPRESAS).filter((d) => fs.existsSync(path.join(PASTA_EMPRESAS, d, "paleta.json")));
  let falhou = false;
  for (const s of slugs) {
    try {
      const r = gerar(s);
      console.log(`TEMA ${r.slug}: ${r.aprovados}/${r.total} pares AA (${r.pct}%), ${r.ajustes} ajustes${r.primariaClareada ? ", primária clareada no escuro" : ""}`);
      if (r.aprovados !== r.total) falhou = true;
    } catch (e) {
      console.error(e.message);
      falhou = true;
    }
  }
  process.exit(falhou ? 1 : 0);
}
