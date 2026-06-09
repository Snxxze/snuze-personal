"use client";

import { useState, useEffect } from "react";
import type { TodoItem } from "@/types";

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

async function syncTodosToSheets(todos: TodoItem[]) {
  try {
    const res = await fetch("/api/sheets", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ todos }),
    });
    if (res.status === 401) {
      window.location.reload();
    }
  } catch (error) {
    console.warn("Background todos sync failed:", error)
  }
}

export function useTodos() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("snuze_todos");
    const initial = saved ? JSON.parse(saved) : DEFAULT_TODOS;
    setTodos(initial);
    setIsLoading(false);

    const fetchLatest = async () => {
      try {
        const res = await fetch("/api/sheets");
        if (res.status === 401) {
          window.location.reload();
          return;
        }
        if (res.ok) {
          const data = await res.json();
          if (data.status === "success" && data.todos) {
            setTodos(data.todos);
            
            // Limit local cache to active tasks + tasks completed within 7 days
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const cachedTodos = data.todos.filter((t: any) => {
              if (!t.completed) return true;
              if (!t.completedAt) return true;
              return new Date(t.completedAt) >= sevenDaysAgo;
            });
            localStorage.setItem("snuze_todos", JSON.stringify(cachedTodos));
          }
        }
      } catch (error) {
        console.warn("Could not sync with Google Sheets on load:", error);
      }
    }

    fetchLatest();
  }, []);

  const saveTodos = (newTodos: TodoItem[]) => {
    // Limit local storage cache and API sync to active + completed within 7 days
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

  // handler Create
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

  // handler Update
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

  // handler Delete
  const deleteTodo = (id: string) => {
    const updated = todos.filter((t) => t.id !== id);
    saveTodos(updated);
  };

  return { todos, isLoading, addTodo, toggleTodo, deleteTodo };
}