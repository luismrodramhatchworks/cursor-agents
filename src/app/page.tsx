"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

import styles from "./page.module.css";

type Todo = {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

type Filter = "all" | "open" | "done";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "open", label: "Open" },
  { id: "done", label: "Done" },
];

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [mutatingId, setMutatingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  useEffect(() => {
    void refreshTodos();
  }, []);

  const filteredTodos = useMemo(() => {
    switch (filter) {
      case "open":
        return todos.filter((todo) => !todo.completed);
      case "done":
        return todos.filter((todo) => todo.completed);
      default:
        return todos;
    }
  }, [todos, filter]);

  const stats = useMemo(
    () => ({
      total: todos.length,
      open: todos.filter((t) => !t.completed).length,
      done: todos.filter((t) => t.completed).length,
    }),
    [todos],
  );

  async function refreshTodos() {
    setRefreshing(true);
    setError(null);
    try {
      const response = await fetch("/api/todos", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Unable to load todos");
      }
      const data = await response.json();
      setTodos(data.todos ?? []);
    } catch (error) {
      console.error("Unable to load todos", error);
      setError("Unable to load todos. Make sure the API is running.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setError("Give your todo a title first.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: cleanTitle }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.message ?? "Could not create todo");
      }
      setTodos((prev) => [...prev, payload.todo]);
      setTitle("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create todo");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleTodo(todo: Todo) {
    setMutatingId(todo.id);
    setError(null);
    try {
      const response = await fetch(`/api/todos/${todo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !todo.completed }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.message ?? "Unable to update todo");
      }
      setTodos((prev) => prev.map((item) => (item.id === todo.id ? payload.todo : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update todo");
    } finally {
      setMutatingId(null);
    }
  }

  function startEdit(todo: Todo) {
    setEditingId(todo.id);
    setEditingTitle(todo.title);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingTitle("");
  }

  async function saveEdit(todoId: number) {
    const cleanTitle = editingTitle.trim();
    if (!cleanTitle) {
      setError("Title cannot be empty.");
      return;
    }

    setMutatingId(todoId);
    setError(null);
    try {
      const response = await fetch(`/api/todos/${todoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: cleanTitle }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.message ?? "Unable to update todo");
      }

      setTodos((prev) => prev.map((item) => (item.id === todoId ? payload.todo : item)));
      cancelEdit();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update todo");
    } finally {
      setMutatingId(null);
    }
  }

  async function removeTodo(todoId: number) {
    setMutatingId(todoId);
    setError(null);
    try {
      const response = await fetch(`/api/todos/${todoId}`, { method: "DELETE" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.message ?? "Unable to delete todo");
      }

      setTodos((prev) => prev.filter((item) => item.id !== todoId));
      if (editingId === todoId) {
        cancelEdit();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete todo");
    } finally {
      setMutatingId(null);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.hero}>
          <div>
            <div className={styles.titleRow}>
              <span className={styles.badge}>Docker ready</span>
              <span className={styles.badge}>Postgres</span>
            </div>
            <h1 className={styles.title}>Taskfolio</h1>
            <p className={styles.subtitle}>
              A full-stack Next.js todo list wired to Postgres, ready to ship in Docker. Create, update, and track tasks with a
              clean interface and API-first backend.
            </p>
          </div>
          <div className={styles.stats}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Open</span>
              <span className={styles.statValue}>{stats.open}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Done</span>
              <span className={styles.statValue}>{stats.done}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Total</span>
              <span className={styles.statValue}>{stats.total}</span>
            </div>
          </div>
        </div>

        <div className={styles.surface}>
          <div className={styles.surfaceHeader}>
            <div className={styles.pillRow}>
              <span className={styles.pill}>Live CRUD</span>
              <span className={`${styles.pill} ${styles.pillMuted}`}>
                {refreshing ? "Refreshing…" : "Realtime fetch"}
              </span>
            </div>
            {refreshing && (
              <div className={styles.loader}>
                <span className={styles.dot} />
                <span className={styles.dot} />
                <span className={styles.dot} />
              </div>
            )}
          </div>
          <div className={styles.composer}>
            {error && <div className={styles.error}>{error}</div>}
            <form className={styles.formRow} onSubmit={handleCreate}>
              <input
                className={styles.input}
                type="text"
                placeholder="Add a new task with intent"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                disabled={submitting}
              />
              <button className={styles.primaryButton} type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Add task"}
              </button>
            </form>
            <div className={styles.filters}>
              {FILTERS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`${styles.filterButton} ${filter === item.id ? styles.filterActive : ""}`}
                  onClick={() => setFilter(item.id)}
                >
                  {item.label}
                </button>
              ))}
              <button type="button" className={styles.filterButton} onClick={() => refreshTodos()} disabled={refreshing}>
                {refreshing ? "Refreshing" : "Reload"}
              </button>
            </div>
          </div>

          <ul className={styles.list}>
            {loading ? (
              <li className={styles.empty}>Loading your tasks...</li>
            ) : filteredTodos.length === 0 ? (
              <li className={styles.empty}>No tasks match this filter yet.</li>
            ) : (
              filteredTodos.map((todo) => (
                <li key={todo.id} className={styles.item}>
                  <input
                    className={styles.checkbox}
                    type="checkbox"
                    checked={todo.completed}
                    disabled={mutatingId === todo.id}
                    onChange={() => toggleTodo(todo)}
                    aria-label={todo.completed ? "Mark todo as open" : "Mark todo as done"}
                  />
                  <div className={styles.textColumn}>
                    {editingId === todo.id ? (
                      <input
                        className={styles.editInput}
                        value={editingTitle}
                        onChange={(event) => setEditingTitle(event.target.value)}
                        autoFocus
                      />
                    ) : (
                      <span className={`${styles.titleText} ${todo.completed ? styles.done : ""}`}>{todo.title}</span>
                    )}
                    <span className={styles.meta}>
                      Updated {new Date(todo.updatedAt ?? todo.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className={styles.actions}>
                    {editingId === todo.id ? (
                      <>
                        <button
                          type="button"
                          className={styles.iconButton}
                          onClick={() => saveEdit(todo.id)}
                          disabled={mutatingId === todo.id}
                        >
                          Save
                        </button>
                        <button type="button" className={`${styles.iconButton} ${styles.mutedButton}`} onClick={cancelEdit}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button type="button" className={styles.iconButton} onClick={() => startEdit(todo)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className={`${styles.iconButton} ${styles.danger}`}
                          onClick={() => removeTodo(todo.id)}
                          disabled={mutatingId === todo.id}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
