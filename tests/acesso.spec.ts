// Telas de acesso: proteção, validação, login, Google, selo ao vivo e senha.
import { expect, test } from "@playwright/test";
import { abrir, botaoEntrar, campoEmail, campoSenha, entrar, NOME_MOCK, perfil } from "./apoio";

test.describe(`acesso (${perfil.slug})`, () => {
  test("painel sem sessão vai para o login com aviso de sessão", async ({ page }) => {
    await page.goto("/painel/");
    await expect(page).toHaveURL(/\/login\/?\?.*motivo=sessao/);
    await expect(page.getByRole("alert").filter({ hasText: "Sua sessão expirou" })).toBeVisible();
  });

  test("validação do formulário de login", async ({ page }) => {
    await abrir(page, "/login/");
    await campoEmail(page).fill("email-invalido");
    await botaoEntrar(page).click();
    await expect(page.getByText("Digite um e-mail válido.")).toBeVisible();
    await expect(page.getByText("Informe sua senha.")).toBeVisible();
    await expect(campoEmail(page)).toHaveAttribute("aria-invalid", "true");
    await expect(campoSenha(page)).toHaveAttribute("aria-invalid", "true");
    await expect(page).toHaveURL(/\/login\/?$/);
  });

  test("login correto abre o painel com a saudação do usuário", async ({ page }) => {
    await entrar(page);
    const primeiro = NOME_MOCK.split(/\s+/)[0];
    await expect(page.getByRole("heading", { level: 1 })).toContainText(primeiro);
  });

  test("botão do Google só quando recursos.loginGoogle", async ({ page }) => {
    await abrir(page, "/login/");
    await expect(page.getByRole("button", { name: /Google/ })).toHaveCount(perfil.recursos.loginGoogle ? 1 : 0);
  });

  test("selo ao vivo só quando login.selo.fonte é api", async ({ page }) => {
    await abrir(page, "/login/");
    const selo = perfil.login.selo;
    test.skip(!selo, "perfil sem login.selo");
    const alvo = page.getByText(selo!.texto, { exact: true });
    if (selo!.fonte === "api") await expect(alvo.first()).toBeVisible();
    else await expect(alvo).toHaveCount(0);
  });

  test("esqueci a senha mostra a mensagem neutra", async ({ page }) => {
    await abrir(page, "/esqueci-senha/");
    await page.getByLabel(/^E-mail corporativo/).fill("qualquer@exemplo.com");
    await page.getByRole("button", { name: "Enviar link" }).click();
    await expect(page.getByText("Se o e-mail estiver cadastrado, você receberá um link")).toBeVisible();
  });

  test("redefinir senha sem token mostra link inválido", async ({ page }) => {
    await abrir(page, "/redefinir-senha/");
    await expect(page.getByRole("heading", { name: "Link inválido" })).toBeVisible();
  });

  test("redefinir senha com token expirado avisa que expirou", async ({ page }) => {
    await abrir(page, "/redefinir-senha/?token=expirado");
    await page.getByLabel(/^Nova senha/).fill("senha1234");
    await page.getByLabel(/^Confirmar nova senha/).fill("senha1234");
    await page.getByRole("button", { name: "Salvar nova senha" }).click();
    await expect(page.getByRole("heading", { name: "Este link expirou" })).toBeVisible();
  });
});
