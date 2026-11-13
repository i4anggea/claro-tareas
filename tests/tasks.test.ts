import { describe, it, expect } from "vitest";
import {
  decodeTasks,
  filterTasks,
  seedTasks,
  today,
  validDate,
  validateTask,
} from "../src/lib/tasks";
describe("validación de tareas", () => {
  it("acepta una tarea completa y una sin fecha", () => {
    const task = seedTasks()[0];
    expect(validateTask(task)).toEqual({});
    expect(validateTask({ ...task, due: "" })).toEqual({});
  });
  it("rechaza títulos vacíos, límites y valores fuera del contrato", () => {
    const task = seedTasks()[0];
    expect(validateTask({ ...task, title: "   " })).toHaveProperty("title");
    expect(
      validateTask({
        ...task,
        title: "a".repeat(101),
        description: "x".repeat(1001),
        project: "",
      }),
    ).toMatchObject({
      title: expect.any(String),
      description: expect.any(String),
      project: expect.any(String),
    });
    expect(validateTask({ ...task, due: "2026-02-30" })).toHaveProperty("due");
  });
  it("valida fechas reales incluidos años bisiestos", () => {
    expect(validDate("2024-02-29")).toBe(true);
    expect(validDate("2025-02-29")).toBe(false);
    expect(validDate("invalid")).toBe(false);
  });
});
describe("frontera de almacenamiento", () => {
  it("recupera las tareas guardadas sin perder campos", () => {
    const tasks = seedTasks();
    expect(decodeTasks(JSON.stringify(tasks))).toEqual(tasks);
    expect(decodeTasks("[]")).toEqual([]);
  });
  it.each(["{", "{}", "[null]", '[{"id":1}]'])(
    "rechaza contenido corrupto: %s",
    (raw) => expect(() => decodeTasks(raw)).toThrow(),
  );
  it("rechaza duplicados, estados manipulados y contenido excesivo", () => {
    const task = seedTasks()[0];
    expect(() => decodeTasks(JSON.stringify([task, task]))).toThrow();
    expect(() =>
      decodeTasks(JSON.stringify([{ ...task, status: "intruso" }])),
    ).toThrow();
    expect(() => decodeTasks(" ".repeat(5_000_001))).toThrow();
  });
});
describe("consulta de tareas", () => {
  it("combina búsqueda, prioridad, estado y fecha", () => {
    const tasks = seedTasks();
    expect(
      filterTasks(tasks, "PROPUESTA", "En progreso", "Alta", "all").map(
        (t) => t.id,
      ),
    ).toEqual(["demo-0"]);
    expect(filterTasks(tasks, "no existe", "Todos", "Todas", "all")).toEqual(
      [],
    );
    expect(filterTasks(tasks, "", "Todos", "Todas", "completed")).toHaveLength(
      1,
    );
    expect(
      filterTasks(tasks, "", "Todos", "Todas", "today").every(
        (t) => t.due === today(),
      ),
    ).toBe(true);
  });
  it("sitúa completadas al final sin mutar la lista", () => {
    const tasks = seedTasks().reverse();
    const ids = tasks.map((t) => t.id);
    expect(filterTasks(tasks, "", "Todos", "Todas", "all").at(-1)?.status).toBe(
      "Completada",
    );
    expect(tasks.map((t) => t.id)).toEqual(ids);
  });
});
