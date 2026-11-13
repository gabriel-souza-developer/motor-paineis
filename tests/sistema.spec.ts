// Comportamento geral: 404, título da aba, erros de console e de rede, celular e movimento reduzido.
import { expect, test, type Page } from "@playwright/test";
import { abrir, entrar, perfil } from "./apoio";

const PUBLICAS = ["/login/", "/esqueci-senha/", "/redefinir-senha/", "/redefinir-senha/?token=abc"];
const LOGADAS = ["/painel/", "/perfil/", "/modulo/?id=" + encodeURIComponent(perfil.modulos[0]?.id ?? "x")];

/** Junta erros de página, console e rede. Requisição abortada pela própria navegação não conta. */
function vigiar(page: Page) {
  const erros: string[] = [];
  page.on("pageerror", (e) => erros.push(`pageerror ${page.url()}: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error") erros.push(`console ${page.url()}: ${m.text().slice(0, 160)}`);
  });
  page.on("response", (r) => {
    if (r.status() >= 400) erros.push(`HTTP ${r.status()} ${r.url()}`);
  });
  page.on("requestfailed", (r) => {
    const motivo = r.failure()?.errorText ?? "";
    if (!/ERR_ABORTED/.test(motivo)) erros.push(`falha ${r.url()}: ${motivo}`);
  });
  return erros;
}

test.describe(`sistema (${perfil.slug})`, () => {
  test("rota inexistente mostra página não encontrada", async ({ page }) => {
    const r = await page.goto("/rota-que-nao-existe/");
    expect(r?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Página não encontrada" })).toBeVisible();
  });

  test("título da aba tem o nome da empresa", async ({ page }) => {
    await abrir(page, "/login/");
    await expect(page).toHaveTitle(new RegExp(perfil.nome.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    await entrar(page);
    await expect(page).toHaveTitle(new RegExp(perfil.nome.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  });

  test("nenhuma página com erro de console ou requisição com falha", async ({ page }) => {
    const erros = vigiar(page);
    for (const rota of PUBLICAS) await abrir(page, rota);
    await entrar(page);
    for (const rota of LOGADAS) await abrir(page, rota);
    expect(erros).toEqual([]);
  });

  test.describe("celular 390px", () => {
    test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    test("login sem rolagem horizontal", async ({ page }) => {
      await abrir(page, "/login/");
      await expect(page.getByRole("button", { name: "Entrar no painel" })).toBeVisible();
      const { largura, total } = await page.evaluate(() => ({
        largura: document.documentElement.clientWidth,
        total: document.documentElement.scrollWidth,
      }));
      expect(total).toBeLessThanOrEqual(largura);
    });
  });

  test.describe("movimento reduzido", () => {
    test.use({ reducedMotion: "reduce" });
    test("páginas carregam sem erro", async ({ page }) => {
      const erros = vigiar(page);
      await abrir(page, "/login/");
      await expect(page.getByRole("button", { name: "Entrar no painel" })).toBeVisible();
      await entrar(page);
      await expect(page.locator('[data-testid^="modulo-"]').first()).toBeVisible();
      await abrir(page, "/perfil/");
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      expect(erros).toEqual([]);
    });
  });
});
