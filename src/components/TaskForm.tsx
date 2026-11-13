import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { priorities, statuses, today, validateTask } from "../lib/tasks";
import type { Task, TaskInput } from "../lib/tasks";
import Icon from "./Icon";
export default function TaskForm({
  task,
  onSave,
  onClose,
}: {
  task: Task | null;
  onSave: (input: TaskInput) => void;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [input, setInput] = useState<TaskInput>(
    task ?? {
      title: "",
      description: "",
      priority: "Media",
      status: "Pendiente",
      due: today(),
      project: "Personal",
    },
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  useEffect(() => {
    const el = dialog.current;
    el?.showModal();
    return () => el?.close();
  }, []);
  function submit(e: FormEvent) {
    e.preventDefault();
    const next = validateTask(input);
    setErrors(next);
    if (Object.keys(next).length === 0)
      onSave({
        ...input,
        title: input.title.trim(),
        project: input.project.trim(),
        description: input.description.trim(),
      });
  }
  const field = (name: keyof TaskInput) => ({
    id: name,
    name,
    value: input[name],
    onChange: (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => setInput({ ...input, [name]: e.target.value }),
    "aria-invalid": !!errors[name],
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
  });
  return (
    <dialog ref={dialog} onCancel={onClose} aria-labelledby="form-title">
      <form onSubmit={submit} noValidate>
        <div className="dialog-header">
          <div>
            <span className="eyebrow">UN PASO MÁS CERCA</span>
            <h2 id="form-title">{task ? "Editar tarea" : "Una nueva tarea"}</h2>
          </div>
          <button
            className="icon-button"
            type="button"
            onClick={onClose}
            aria-label="Cerrar formulario"
          >
            <Icon name="close" />
          </button>
        </div>
        <label htmlFor="title">
          Título de la tarea <span>*</span>
        </label>
        <input
          {...field("title")}
          autoFocus
          maxLength={100}
          placeholder="¿Qué quieres lograr?"
        />
        {errors.title && (
          <p id="title-error" className="field-error">
            {errors.title}
          </p>
        )}
        <label htmlFor="description">
          Descripción <small>Opcional</small>
        </label>
        <textarea
          {...field("description")}
          maxLength={1000}
          rows={3}
          placeholder="Añade los detalles que necesitas recordar…"
        />
        {errors.description && (
          <p id="description-error" className="field-error">
            {errors.description}
          </p>
        )}
        <div className="form-grid">
          <div>
            <label htmlFor="priority">Prioridad</label>
            <select {...field("priority")}>
              {priorities.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="status">Estado</label>
            <select {...field("status")}>
              {statuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="due">
              Fecha límite <small>Opcional</small>
            </label>
            <input type="date" {...field("due")} />
            {errors.due && (
              <p id="due-error" className="field-error">
                {errors.due}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="project">
              Proyecto <span>*</span>
            </label>
            <input {...field("project")} maxLength={40} />
            {errors.project && (
              <p id="project-error" className="field-error">
                {errors.project}
              </p>
            )}
          </div>
        </div>
        <div className="dialog-footer">
          <button type="button" className="secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="primary" type="submit">
            {task ? "Guardar cambios" : "Crear tarea"}
            <Icon name="arrow" size={17} />
          </button>
        </div>
      </form>
    </dialog>
  );
}
