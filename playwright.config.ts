import { defineConfig, devices } from "@playwright/test";

// Testes de fluxo do build estático (mock). Normalmente rodados por: npm run testar -- <slug>
// BASE_URL e EMPRESA vêm do scripts/testar.mjs. CHROME troca o executável do navegador.
const empresa = process.env.EMPRESA ?? "logmovy";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  workers: process.env.WORKERS ? Number(process.env.WORKERS) : 4,
  retries: 0,
  timeout: 30_000,
  expect: { timeout: 7_000 },
  outputDir: `.qa-build/resultados-${empresa}`,
  reporter: [["list"], ["html", { outputFolder: `relatorios/${empresa}/testes`, open: "never" }]],
  use: {
    ...devices["Desktop Chrome"],
    baseURL: process.env.BASE_URL ?? "http://localhost:3000",
    viewport: { width: 1440, height: 900 },
    locale: "pt-BR",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    launchOptions: { executablePath: process.env.CHROME ?? "/usr/bin/google-chrome" },
  },
});
