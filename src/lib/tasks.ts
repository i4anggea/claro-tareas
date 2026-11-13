export const priorities = ["Alta", "Media", "Baja"] as const;
export type Priority = (typeof priorities)[number];
export type Status = "Pendiente" | "En progreso" | "Completada";
export type Task = {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  due: string;
  project: string;
  createdAt: string;
};
export type TaskInput = Omit<Task, "id" | "createdAt">;
export const statuses: Status[] = ["Pendiente", "En progreso", "Completada"];
export function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}
export function validateTask(input: TaskInput): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!input.title.trim() || input.title.trim().length > 100)
    errors.title = "Escribe un título de 1 a 100 caracteres.";
  if (input.description.length > 1000)
    errors.description = "La descripción admite hasta 1000 caracteres.";
  if (!priorities.includes(input.priority))
    errors.priority = "Selecciona una prioridad válida.";
  if (!statuses.includes(input.status))
    errors.status = "Selecciona un estado válido.";
  if (input.due && !validDate(input.due))
    errors.due = "Selecciona una fecha válida.";
  if (!input.project.trim() || input.project.length > 40)
    errors.project = "Escribe un proyecto de 1 a 40 caracteres.";
  return errors;
}
export const STORAGE_KEY = "claro.tasks.v1";
export function decodeTasks(raw: string): Task[] {
  if (raw.length > 5_000_000)
    throw new Error("Almacenamiento demasiado grande");
  const data: unknown = JSON.parse(raw);
  if (!Array.isArray(data) || data.length > 5000)
    throw new Error("Formato inválido");
  const ids = new Set<string>();
  return data.map((value: unknown) => {
    if (!value || typeof value !== "object") throw new Error("Tarea inválida");
    const t = value as Record<string, unknown>;
    if (
      [
        "id",
        "title",
        "description",
        "priority",
        "status",
        "due",
        "project",
        "createdAt",
      ].some((k) => typeof t[k] !== "string")
    )
      throw new Error("Campos inválidos");
    const task: Task = {
      id: t.id as string,
      title: t.title as string,
      description: t.description as string,
      priority: t.priority as Priority,
      status: t.status as Status,
      due: t.due as string,
      project: t.project as string,
      createdAt: t.createdAt as string,
    };
    if (
      !task.id ||
      ids.has(task.id) ||
      Number.isNaN(Date.parse(task.createdAt)) ||
      Object.keys(validateTask(task)).length
    )
      throw new Error("Datos inválidos");
    ids.add(task.id);
    return task;
  });
}
export function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function seedTasks(): Task[] {
  const entries: [string, Priority, Status, string, string][] = [
    [
      "Preparar propuesta de diseño",
      "Alta",
      "En progreso",
      "Estudio creativo",
      "Definir la dirección visual y reunir las referencias para la próxima entrega.",
    ],
    [
      "Revisar pendientes de la semana",
      "Media",
      "Pendiente",
      "Personal",
      "Un momento para ordenar ideas y planear los siguientes pasos.",
    ],
    [
      "Actualizar componentes de la web",
      "Alta",
      "Pendiente",
      "Sitio web",
      "Revisar botones, formularios y estados de interacción.",
    ],
    [
      "Compartir avances del proyecto",
      "Media",
      "En progreso",
      "Estudio creativo",
      "Preparar un resumen con los avances y próximos hitos.",
    ],
    [
      "Leer un capítulo del libro",
      "Baja",
      "Pendiente",
      "Personal",
      "Reservar un espacio para aprender algo nuevo.",
    ],
    [
      "Organizar archivos de referencia",
      "Baja",
      "Completada",
      "Estudio creativo",
      "Todo en su lugar para empezar con claridad.",
    ],
  ];
  return entries.map(([title, priority, status, project, description], i) => ({
    id: `demo-${i}`,
    title,
    priority,
    status,
    project,
    description,
    due: today(),
    createdAt: new Date().toISOString(),
  }));
}
export function filterTasks(
  tasks: Task[],
  query: string,
  status: string,
  priority: string,
  view: string,
): Task[] {
  return tasks
    .filter(
      (t) =>
        (!query ||
          `${t.title} ${t.description} ${t.project}`
            .toLocaleLowerCase("es")
            .includes(query.toLocaleLowerCase("es"))) &&
        (status === "Todos" || t.status === status) &&
        (priority === "Todas" || t.priority === priority) &&
        (view !== "today" || t.due === today()) &&
        (view !== "completed" || t.status === "Completada"),
    )
    .sort(
      (a, b) =>
        Number(a.status === "Completada") - Number(b.status === "Completada") ||
        (a.due || "9999").localeCompare(b.due || "9999"),
    );
}
