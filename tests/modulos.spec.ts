// Painel de módulos: tudo derivado de empresas/<EMPRESA>/perfil.json.
import { expect, test } from "@playwright/test";
import { entrar, normalizarRota, normalizarTexto, perfil, rotaDoModulo } from "./apoio";

const cards = (page: import("@playwright/test").Page) => page.locator('[data-testid^="modulo-"]');

test.describe(`módulos do painel (${perfil.slug})`, () => {
  test.beforeEach(async ({ page }) => {
    await entrar(page);
  });

  test("um card por módulo, na mesma ordem e com o status do perfil", async ({ page }) => {
    await expect(cards(page)).toHaveCount(perfil.modulos.length);
    const ids = await cards(page).evaluateAll((els) => els.map((el) => el.getAttribute("data-testid")));
    expect(ids).toEqual(perfil.modulos.map((m) => `modulo-${m.id}`));
    for (const m of perfil.modulos) {
      const card = page.getByTestId(`modulo-${m.id}`);
      await expect(card, `data-status de ${m.id}`).toHaveAttribute("data-status", m.status);
      await expect(card.getByRole("heading", { name: m.titulo })).toBeVisible();
    }
  });

  test("ativos são links para a rota do perfil; os demais não são clicáveis", async ({ page }) => {
    for (const m of perfil.modulos) {
      const card = page.getByTestId(`modulo-${m.id}`);
      const tag = await card.evaluate((el) => el.tagName.toLowerCase());
      if (m.status === "ativo") {
        expect(tag, `${m.id} deveria ser link`).toBe("a");
        const href = await card.getAttribute("href");
        expect(normalizarRota(href ?? ""), `href de ${m.id}`).toBe(normalizarRota(rotaDoModulo(m)));
      } else {
        expect(tag, `${m.id} não deveria ser link`).not.toBe("a");
        await expect(card).toHaveAttribute("aria-disabled", "true");
        await expect(card.locator("a")).toHaveCount(0);
      }
    }
  });

  test("clicar num módulo ativo navega para a rota dele", async ({ page }) => {
    const ativo = perfil.modulos.find((m) => m.status === "ativo");
    test.skip(!ativo, "perfil sem módulo ativo");
    await page.getByTestId(`modulo-${ativo!.id}`).click();
    await expect.poll(() => normalizarRota(page.url())).toBe(normalizarRota(rotaDoModulo(ativo!)));
  });

  test("contador de módulos disponíveis", async ({ page }) => {
    const ativos = perfil.modulos.filter((m) => m.status === "ativo").length;
    await expect(page.getByText(`${ativos} de ${perfil.modulos.length} disponíveis`)).toBeVisible();
  });

  test("busca filtra pelos módulos que casam e avisa quando não há resultado", async ({ page }) => {
    const busca = page.getByRole("searchbox", { name: "Pesquisar módulos" });
    const primeiro = perfil.modulos[0];
    // Parte do título: a palavra mais longa do primeiro módulo.
    const termo = primeiro.titulo.split(/\s+/).sort((a, b) => b.length - a.length)[0];
    const q = normalizarTexto(termo);
    const esperados = perfil.modulos.filter((m) => normalizarTexto(`${m.titulo} ${m.descricao}`).includes(q));
    await busca.fill(termo);
    await expect(cards(page)).toHaveCount(esperados.length);
    const ids = await cards(page).evaluateAll((els) => els.map((el) => el.getAttribute("data-testid")));
    expect(ids).toEqual(esperados.map((m) => `modulo-${m.id}`));

    await busca.fill("xyzqw sem modulo 000");
    await expect(page.getByText("Nenhum módulo encontrado")).toBeVisible();
    await expect(cards(page)).toHaveCount(0);
  });

  test("botão de destaque do hero (painel.cta)", async ({ page }) => {
    const cta = perfil.painel.cta;
    test.skip(!cta, "perfil sem painel.cta");
    const alvo = page.getByRole("link", { name: cta!.texto }).or(page.getByRole("button", { name: cta!.texto })).first();
    await expect(alvo).toBeVisible();
    const href = await alvo.getAttribute("href");
    if (href !== null) expect(normalizarRota(href)).toBe(normalizarRota(cta!.rota));
  });

  test("indicadores do painel (painel.indicadores)", async ({ page }) => {
    const inds = perfil.painel.indicadores;
    test.skip(!inds?.length, "perfil sem painel.indicadores");
    for (const ind of inds!) await expect(page.getByText(ind.rotulo, { exact: true }).first()).toBeVisible();
  });

  test("selo de SSO (recursos.sso)", async ({ page }) => {
    test.skip(!perfil.recursos.sso, "perfil sem recursos.sso");
    await expect(page.getByText("SSO Ativo").first()).toBeVisible();
  });
});
