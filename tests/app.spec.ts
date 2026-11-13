import { test, expect } from "@playwright/test";
test("gestionar tareas, validar, filtrar, restaurar y persistir", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Haz espacio para lo importante." }),
  ).toBeVisible();
  await expect(page.locator(".sidebar")).toHaveCSS("display", "flex");
  await page.screenshot({
    path: `docs/evidence/${testInfo.project.name}-light.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "Nueva tarea", exact: true }).click();
  await page.getByRole("button", { name: "Crear tarea", exact: true }).click();
  await expect(
    page.getByText("Escribe un título de 1 a 100 caracteres."),
  ).toBeVisible();
  await page
    .getByLabel("Título de la tarea")
    .fill("Prueba <script>alert(1)</script>");
  await page.getByLabel("Descripción").fill("Detalles de la tarea");
  await page.getByRole("button", { name: "Crear tarea", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Buscar tareas" })
    .fill("Prueba <script>");
  await expect(
    page.getByRole("button", {
      name: "Prueba <script>alert(1)</script>",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "Editar Prueba <script>alert(1)</script>",
      exact: true,
    })
    .click();
  await page.getByLabel("Título de la tarea").fill("Tarea editada");
  await page.getByLabel("Estado", { exact: true }).selectOption("En progreso");
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await page
    .getByRole("textbox", { name: "Buscar tareas" })
    .fill("Tarea editada");
  await page
    .getByRole("button", { name: "Completar Tarea editada", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Reabrir Tarea editada", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await page
    .getByRole("textbox", { name: "Buscar tareas" })
    .fill("Tarea editada");
  await expect(
    page.getByRole("button", { name: "Reabrir Tarea editada", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Eliminar Tarea editada", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Un poco de calma por aquí" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Deshacer", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Tarea editada", exact: true }),
  ).toBeVisible();
  await page.getByRole("textbox", { name: "Buscar tareas" }).fill("");
  await page
    .getByRole("combobox", { name: "Filtrar por prioridad" })
    .selectOption("Alta");
  await expect(page.locator(".task-row")).toHaveCount(2);
  await page
    .getByRole("combobox", { name: "Filtrar por prioridad" })
    .selectOption("Todas");
  await page.getByRole("button", { name: "Activar modo oscuro" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("html")).toHaveCSS("color", "rgb(236, 237, 244)");
  await expect(page.locator("html")).toHaveCSS(
    "background-color",
    "rgb(23, 25, 34)",
  );
  await expect(
    page.locator(".task-row:not(.is-complete) .task-title").first(),
  ).toHaveCSS("color", "rgb(236, 237, 244)");
  await page.screenshot({
    path: `docs/evidence/${testInfo.project.name}-dark.png`,
    fullPage: true,
  });
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});
test("Escape cierra el formulario y devuelve el foco", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Nueva tarea", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Nueva tarea", exact: true }),
  ).toBeFocused();
});
test("almacenamiento manipulado se conserva y muestra un error controlado", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem("claro.tasks.v1", "{corrupto"),
  );
  await page.goto("/");
  await expect(page.getByRole("alert")).toContainText("No pudimos leer");
  await page.getByRole("button", { name: "Nueva tarea", exact: true }).click();
  await page.getByLabel("Título de la tarea").fill("Temporal");
  await page.getByRole("button", { name: "Crear tarea", exact: true }).click();
  expect(
    await page.evaluate(() => localStorage.getItem("claro.tasks.v1")),
  ).toBe("{corrupto");
  await expect(
    page.getByRole("button", { name: "Temporal", exact: true }),
  ).toBeVisible();
});
test("un fallo al guardar se comunica sin perder el estado de la sesión", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("QuotaExceededError", "QuotaExceededError");
    };
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Nueva tarea", exact: true }).click();
  await page.getByLabel("Título de la tarea").fill("Sin cuota");
  await page.getByRole("button", { name: "Crear tarea", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("No se pudieron guardar");
  await expect(
    page.getByRole("button", { name: "Sin cuota", exact: true }),
  ).toBeVisible();
});
