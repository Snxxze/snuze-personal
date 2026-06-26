"use client";

import { useState, useEffect } from "react";
import type { TodoItem } from "@/types";
import { safeParse } from "@/lib/sheets-sanitize";
import { apiFetch } from "@/lib/api";

// Mock Data
export const DEFAULT_TODOS: TodoItem[] = [
  {
    id: "1",
    text: "อ่านทฤษฎี Network Layer และ Routing Protocols",
    priority: "high",
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    text: "เขียนโครงร่าง Auth Flow ด้วย Next.js และ JWT",
    priority: "medium",
    dueDate: new Date().toISOString().split("T")[0],
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    text: "ส่งเอกสารโปรเจกต์กลุ่ม",
    priority: "low",
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split("T")[0],
    completed: false,
    createdAt: new Date().toISOString(),
  },
];

async function syncTodosToSheets(todos: TodoItem[], signal?: AbortSignal) {
  try {
    await apiFetch("/api/sheets/todos", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ todos }),
      signal,
    });
  } catch (error) {
    console.warn("Background todos sync failed:", error)
  }
}

export function useTodos() {
  const [todos, setTodos] = useState<TodoItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("snuze_todos");
      return safeParse<TodoItem[]>(saved, DEFAULT_TODOS);
    }
    return DEFAULT_TODOS;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLatest = async (signal?: AbortSignal) => {
    try {
      const res = await apiFetch("/api/sheets/todos", { signal });
      if (res.ok) {
        const data = await res.json();
        if (data.status === "success" && data.todos) {
          setError(null);
          setTodos(data.todos);
          
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          const cachedTodos = data.todos.filter((t: TodoItem) => {
            if (!t.completed) return true;
            if (!t.completedAt) return true;
            return new Date(t.completedAt) >= sevenDaysAgo;
          });
          localStorage.setItem("snuze_todos", JSON.stringify(cachedTodos));
        }
      } else {
        setError("ไม่สามารถซิงค์ข้อมูลกับ Google Sheets ได้");
      }
    } catch (err) {
      const errorName = err instanceof Error ? err.name : "";
      if (errorName !== "AbortError") {
        setError("เครือข่ายขัดข้อง — ไม่สามารถติดต่อเซิร์ฟเวอร์ได้");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    Promise.resolve().then(() => fetchLatest(controller.signal));

    return () => {
      controller.abort();
    };
  }, []);

  const saveTodos = (newTodos: TodoItem[]) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const cachedTodos = newTodos.filter((t) => {
      if (!t.completed) return true;
      if (!t.completedAt) return true;
      return new Date(t.completedAt) >= sevenDaysAgo;
    });

    setTodos(newTodos);
    localStorage.setItem("snuze_todos", JSON.stringify(cachedTodos));
    syncTodosToSheets(cachedTodos);
  };

  const addTodo = (task: { title: string; priority: "high" | "medium" | "low"; deadline?: string }) => {
    const newTodo: TodoItem = {
      id: crypto.randomUUID(),
      text: task.title,
      priority: task.priority,
      dueDate: task.deadline,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    saveTodos([newTodo, ...todos]);
  };

  const toggleTodo = (id: string) => {
    const updated = todos.map((t) => {
      if (t.id === id) {
        const completed = !t.completed;
        return {
          ...t,
          completed,
          completedAt: completed ? new Date().toISOString() : undefined,
        };
      }
      return t;
    });
    saveTodos(updated);
  };

  const updateTodo = (id: string, updates: Partial<Omit<TodoItem, "id" | "createdAt">>) => {
    const updated = todos.map((t) =>
      t.id === id
        ? { ...t, ...updates }
        : t
    );
    saveTodos(updated);
  };

  const deleteTodo = (id: string) => {
    const updated = todos.filter((t) => t.id !== id);
    saveTodos(updated);
  };

  return { todos, isLoading, error, addTodo, toggleTodo, updateTodo, deleteTodo, refetch: () => fetchLatest() };
}