import { useEffect, useRef, useState } from "react";
import Icon from "./components/Icon";
import TaskForm from "./components/TaskForm";
import {
  decodeTasks,
  filterTasks,
  priorities,
  seedTasks,
  statuses,
  STORAGE_KEY,
  today,
} from "./lib/tasks";
import type { Task, TaskInput } from "./lib/tasks";
function initialData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return { tasks: raw === null ? seedTasks() : decodeTasks(raw), error: "" };
  } catch {
    return {
      tasks: [] as Task[],
      error:
        "No pudimos leer tus tareas. El contenido original se conserva; los cambios de esta sesión no se guardarán.",
    };
  }
}
function initialTheme() {
  try {
    const value = localStorage.getItem("claro.theme");
    if (value === "dark" || value === "light") return value;
  } catch {
    /* La preferencia del sistema sigue disponible. */
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}
export default function App() {
  const [initial] = useState(initialData);
  const [tasks, setTasks] = useState<Task[]>(initial.tasks);
  const [storageError, setStorageError] = useState(initial.error);
  const [theme, setTheme] = useState(initialTheme);
  const [view, setView] = useState("all");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Todos");
  const [priority, setPriority] = useState("Todas");
  const [form, setForm] = useState<{ task: Task | null } | null>(null);
  const [deleted, setDeleted] = useState<{ task: Task; index: number } | null>(
    null,
  );
  const [notice, setNotice] = useState("");
  const newButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("claro.theme", theme);
    } catch {
      /* El tema funciona durante esta sesión. */
    }
  }, [theme]);
  function update(next: Task[]) {
    setTasks(next);
    if (initial.error) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setStorageError("");
    } catch {
      setStorageError(
        "No se pudieron guardar los cambios. Tus tareas siguen disponibles en esta sesión; revisa el espacio o los permisos del navegador.",
      );
    }
  }
  function closeForm() {
    setForm(null);
    requestAnimationFrame(() => newButton.current?.focus());
  }
  function save(input: TaskInput) {
    if (!form) return;
    if (!form.task && tasks.length >= 5000) {
      setNotice("Llegaste al límite de 5000 tareas.");
      return;
    }
    update(
      form.task
        ? tasks.map((t) => (t.id === form.task?.id ? { ...t, ...input } : t))
        : [
            ...tasks,
            {
              ...input,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
            },
          ],
    );
    setNotice(
      form.task ? "Cambios guardados." : "Tarea creada. ¡Un paso más cerca!",
    );
    closeForm();
  }
  const completed = tasks.filter((t) => t.status === "Completada").length;
  const pending = tasks.filter((t) => t.status === "Pendiente").length;
  const progress = tasks.filter((t) => t.status === "En progreso").length;
  const visible = filterTasks(tasks, query, status, priority, view);
  const percent = tasks.length
    ? Math.round((completed / tasks.length) * 100)
    : 0;
  const date = new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Ir a mis tareas
      </a>
      <aside className="sidebar">
        <a href="#main" className="brand">
          <span className="brand-symbol">
            <Icon name="check" size={23} />
          </span>
          claro<span className="brand-dot">.</span>
        </a>
        <div className="workspace">
          <span className="workspace-avatar">M</span>
          <div>
            <strong>Mi espacio personal</strong>
            <small>Un poco de orden, cada día</small>
          </div>
        </div>
        <span className="nav-label">MI ESPACIO</span>
        <nav aria-label="Navegación principal">
          {(
            [
              {
                id: "all",
                label: "Mis tareas",
                icon: "grid",
                count: tasks.length,
              },
              {
                id: "today",
                label: "Para hoy",
                icon: "calendar",
                count: tasks.filter((t) => t.due === today()).length,
              },
              {
                id: "completed",
                label: "Completadas",
                icon: "check",
                count: completed,
              },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              className={`nav-item ${view === item.id ? "active" : ""}`}
              aria-current={view === item.id ? "page" : undefined}
              onClick={() => {
                setView(item.id);
                setStatus("Todos");
                setPriority("Todas");
                setQuery("");
              }}
            >
              <Icon name={item.icon} />
              {item.label}
              <span>{item.count}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-note">
          <span className="note-icon">
            <Icon name="leaf" size={25} />
          </span>
          <strong>
            Pequeños pasos.
            <br />
            Grandes avances.
          </strong>
          <p>
            No tienes que hacerlo todo hoy.
            <br />
            Empieza por lo que importa.
          </p>
          <div className="note-decoration" aria-hidden="true">
            ✳
          </div>
        </div>
        <div className="local-note">
          <span className="online-dot" /> Guardado en este navegador
        </div>
        <div className="profile">
          <span className="profile-avatar">TÚ</span>
          <div>
            <strong>Tu espacio, tu ritmo</strong>
            <small>Cuenta local · Sin conexión externa</small>
          </div>
        </div>
      </aside>
      <div className="content">
        <header className="topbar">
          <div className="breadcrumb">
            Mi espacio <span>/</span>{" "}
            <strong>
              {view === "today"
                ? "Para hoy"
                : view === "completed"
                  ? "Completadas"
                  : "Mis tareas"}
            </strong>
          </div>
          <div className="topbar-right">
            <span className="date">
              <Icon name="calendar" size={16} />
              {date}
            </span>
            <span className="divider" />
            <button
              className="icon-button theme-toggle"
              aria-label={
                theme === "dark" ? "Activar modo claro" : "Activar modo oscuro"
              }
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Icon name={theme === "dark" ? "sun" : "moon"} />
            </button>
            <span className="top-avatar">TÚ</span>
          </div>
        </header>
        <main id="main">
          <section className="page-heading">
            <div>
              <div className="eyebrow">MENOS RUIDO, MÁS ENFOQUE</div>
              <h1>
                {view === "today"
                  ? "Tu día, con intención."
                  : view === "completed"
                    ? "Cada avance cuenta."
                    : "Haz espacio para lo importante."}
              </h1>
              <p>Organiza tus pendientes y avanza a tu propio ritmo.</p>
            </div>
            <button
              ref={newButton}
              className="primary"
              onClick={() => setForm({ task: null })}
            >
              <Icon name="plus" size={19} /> Nueva tarea
            </button>
          </section>
          <section className="stats" aria-label="Resumen de tareas">
            {(
              [
                {
                  label: "Total de tareas",
                  value: tasks.length,
                  icon: "grid",
                  color: "purple",
                  hint: "Todo en un solo lugar",
                },
                {
                  label: "Pendientes",
                  value: pending,
                  icon: "circle",
                  color: "orange",
                  hint: "Listas para empezar",
                },
                {
                  label: "En progreso",
                  value: progress,
                  icon: "clock",
                  color: "blue",
                  hint: "Un paso a la vez",
                },
                {
                  label: "Completadas",
                  value: completed,
                  icon: "check",
                  color: "green",
                  hint: "¡Bien hecho!",
                },
              ] as const
            ).map((s) => (
              <article className="stat-card" key={s.label}>
                <div className="stat-top">
                  <span>{s.label}</span>
                  <span className={`stat-icon ${s.color}`}>
                    <Icon name={s.icon} size={19} />
                  </span>
                </div>
                <strong>{String(s.value).padStart(2, "0")}</strong>
                <small>{s.hint}</small>
              </article>
            ))}
          </section>
          <section className="progress-banner">
            <span className="progress-icon">
              <Icon name="leaf" size={26} />
            </span>
            <div className="progress-copy">
              <strong>Cada tarea completada es un pequeño logro.</strong>
              <span>
                Ya completaste {completed} de {tasks.length} tareas. Sigue a tu
                ritmo.
              </span>
            </div>
            <div className="progress-detail">
              <div>
                <span>Tu progreso</span>
                <strong>{percent}%</strong>
              </div>
              <progress
                value={completed}
                max={tasks.length || 1}
                aria-label="Tareas completadas"
              />
            </div>
          </section>
          {storageError && (
            <p className="error-banner" role="alert">
              {storageError}
            </p>
          )}
          <section className="task-section" aria-labelledby="tasks-title">
            <div className="section-heading">
              <div>
                <h2 id="tasks-title">
                  {view === "today"
                    ? "Para hoy"
                    : view === "completed"
                      ? "Tareas completadas"
                      : "Mis tareas"}
                  <span>{visible.length}</span>
                </h2>
                <p>Un plan claro para lo que viene.</p>
              </div>
              <span className="list-label">
                <Icon name="grid" size={16} /> Vista de lista
              </span>
            </div>
            <div className="toolbar">
              <div className="tabs" aria-label="Filtrar por estado">
                {["Todos", ...statuses].map((s) => (
                  <button
                    key={s}
                    aria-pressed={status === s}
                    className={status === s ? "selected" : ""}
                    onClick={() => setStatus(s)}
                  >
                    {s === "Todos" ? "Todas" : s}
                  </button>
                ))}
              </div>
              <div className="search-filters">
                <label className="search">
                  <Icon name="search" size={17} />
                  <input
                    aria-label="Buscar tareas"
                    value={query}
                    maxLength={100}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar una tarea…"
                  />
                </label>
                <select
                  aria-label="Filtrar por prioridad"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="Todas">Prioridad: todas</option>
                  {priorities.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="table-head" aria-hidden="true">
              <span>TAREA</span>
              <span>PRIORIDAD</span>
              <span>FECHA LÍMITE</span>
              <span>ESTADO</span>
              <span />
            </div>
            <ul className="task-list">
              {visible.map((task) => (
                <li
                  key={task.id}
                  className={`task-row ${task.status === "Completada" ? "is-complete" : ""}`}
                >
                  <div className="task-info">
                    <button
                      className="complete-button"
                      aria-label={
                        task.status === "Completada"
                          ? `Reabrir ${task.title}`
                          : `Completar ${task.title}`
                      }
                      aria-pressed={task.status === "Completada"}
                      onClick={() => {
                        update(
                          tasks.map((t) =>
                            t.id === task.id
                              ? {
                                  ...t,
                                  status:
                                    t.status === "Completada"
                                      ? "Pendiente"
                                      : "Completada",
                                }
                              : t,
                          ),
                        );
                        setNotice("Estado actualizado.");
                      }}
                    >
                      {task.status === "Completada" && (
                        <Icon name="check" size={14} />
                      )}
                    </button>
                    <div className="task-text">
                      <button
                        className="task-title"
                        onClick={() => setForm({ task })}
                      >
                        {task.title}
                      </button>
                      <span>
                        <Icon name="folder" size={12} />
                        {task.project}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span
                      className={`priority priority-${task.priority.toLowerCase()}`}
                    >
                      <i />
                      {task.priority}
                    </span>
                  </div>
                  <span
                    className={`task-date ${task.due && task.due < today() && task.status !== "Completada" ? "overdue" : ""}`}
                  >
                    <Icon name="calendar" size={14} />
                    {task.due
                      ? task.due === today()
                        ? "Hoy"
                        : new Intl.DateTimeFormat("es-MX", {
                            day: "numeric",
                            month: "short",
                          }).format(new Date(`${task.due}T12:00:00`))
                      : "Sin fecha"}
                  </span>
                  <span
                    className={`status status-${statuses.indexOf(task.status)}`}
                  >
                    <i />
                    {task.status}
                  </span>
                  <div className="row-actions">
                    <button
                      className="icon-button"
                      aria-label={`Editar ${task.title}`}
                      onClick={() => setForm({ task })}
                    >
                      <Icon name="edit" size={16} />
                    </button>
                    <button
                      className="icon-button delete-button"
                      aria-label={`Eliminar ${task.title}`}
                      onClick={() => {
                        setDeleted({
                          task,
                          index: tasks.findIndex((t) => t.id === task.id),
                        });
                        update(tasks.filter((t) => t.id !== task.id));
                        setNotice(
                          "Tarea eliminada. Puedes deshacer esta acción.",
                        );
                      }}
                    >
                      <Icon name="trash" size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            {visible.length === 0 && (
              <div className="empty">
                <Icon name="leaf" size={38} />
                <h3>
                  {tasks.length
                    ? "Un poco de calma por aquí"
                    : "Tu próximo logro empieza aquí"}
                </h3>
                <p>
                  {tasks.length
                    ? "No hay tareas que coincidan con estos filtros."
                    : "Crea tu primera tarea y dale espacio a lo importante."}
                </p>
                <button
                  className="secondary"
                  onClick={() => {
                    if (tasks.length) {
                      setStatus("Todos");
                      setPriority("Todas");
                      setQuery("");
                      setView("all");
                    } else setForm({ task: null });
                  }}
                >
                  {tasks.length ? "Limpiar filtros" : "Crear mi primera tarea"}
                </button>
              </div>
            )}
            <footer className="table-footer">
              <span>
                {visible.length} de {tasks.length} tareas
              </span>
              <span>
                <span className="online-dot" />{" "}
                {storageError
                  ? "Solo en esta sesión"
                  : "Tus cambios se guardan automáticamente"}
              </span>
            </footer>
          </section>
          <div className="bottom-note">
            <Icon name="leaf" size={15} /> Menos pendientes en la cabeza. Más
            espacio para ti.
          </div>
        </main>
      </div>
      {form && <TaskForm task={form.task} onSave={save} onClose={closeForm} />}
      <div className="toast-region" role="status" aria-live="polite">
        {notice && (
          <div className="toast">
            <span>{notice}</span>
            {deleted && (
              <button
                onClick={() => {
                  const next = [...tasks];
                  next.splice(deleted.index, 0, deleted.task);
                  update(next);
                  setDeleted(null);
                  setNotice("Tarea restaurada.");
                }}
              >
                Deshacer
              </button>
            )}
            <button
              aria-label="Cerrar aviso"
              className="icon-button"
              onClick={() => {
                setNotice("");
                setDeleted(null);
              }}
            >
              <Icon name="close" size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
