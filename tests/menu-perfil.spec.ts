// Menu do usuário (topbar) e tela de perfil.
import { expect, test } from "@playwright/test";
import { EMAIL_TESTE, entrar, NOME_MOCK, perfil } from "./apoio";

test.describe(`menu e perfil (${perfil.slug})`, () => {
  test.beforeEach(async ({ page }) => {
    await entrar(page);
  });

  test("menu mostra o e-mail e Sair encerra a sessão", async ({ page }) => {
    await page.getByRole("button", { name: /^Menu da conta/ }).click();
    const menu = page.getByRole("menu");
    await expect(menu).toBeVisible();
    await expect(menu.getByText(EMAIL_TESTE)).toBeVisible();
    await menu.getByRole("menuitem", { name: "Sair da conta" }).click();
    // Saída voluntária: volta ao login limpo, sem aviso de sessão expirada.
    await expect.poll(() => new URL(page.url()).pathname).toMatch(/^\/login\/?$/);
    await expect(page.getByRole("button", { name: "Entrar no painel" })).toBeVisible();
    expect(new URL(page.url()).searchParams.get("motivo")).toBeNull();
    await expect(page.getByText(/sessão expirou/i)).toHaveCount(0);
    await page.goto("/painel/");
    await expect(page).toHaveURL(/\/login\/?\?.*motivo=sessao/);
  });

  test("perfil mostra dados, validade do link e envia o pedido de nova senha", async ({ page }) => {
    await page.goto("/perfil/", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { level: 1, name: NOME_MOCK })).toBeVisible();
    await expect(page.getByText(EMAIL_TESTE).first()).toBeVisible();
    await expect(page.getByText(`Link válido por ${perfil.recursos.tokenSenhaMin} min`)).toBeVisible();
    await page.getByRole("button", { name: "Quero redefinir minha senha" }).click();
    await expect(page.getByText("Link enviado. Confira seu e-mail.")).toBeVisible();
  });
});
