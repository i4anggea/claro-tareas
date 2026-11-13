/* global getComputedStyle, innerWidth, document */
import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import process from "node:process";
const browser = await chromium.launch({ channel: "chrome" });
try {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 900 },
    colorScheme: "light",
    reducedMotion: "reduce",
  });
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("http://127.0.0.1:5173");
  await page.locator(".task-row").last().waitFor();
  assert.equal(
    await page
      .locator(".sidebar")
      .evaluate((el) => getComputedStyle(el).display),
    "flex",
  );
  await page
    .getByRole("button", { name: "Completadas", exact: false })
    .first()
    .click();
  assert.equal(await page.locator(".task-row").count(), 1);
  await page.getByRole("button", { name: "Para hoy", exact: false }).click();
  assert.equal(await page.locator(".task-row").count(), 6);
  await page.getByRole("button", { name: "Nueva tarea", exact: true }).click();
  await page.getByRole("dialog").waitFor();
  await page.screenshot({ path: "docs/evidence/form-desktop.png" });
  await page.getByRole("button", { name: "Cerrar formulario" }).click();
  await page.setViewportSize({ width: 320, height: 740 });
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await page.getByRole("button", { name: "Nueva tarea", exact: true }).click();
  await page.getByRole("dialog").waitFor();
  await page.screenshot({
    path: "docs/evidence/form-mobile.png",
    fullPage: true,
  });
  assert.deepEqual(errors, []);
  process.stdout.write(
    "PASS: CSS en desarrollo, navegación de hoy/completadas, formulario en 1280/320 px y consola sin errores.\n",
  );
} finally {
  await browser.close();
}
