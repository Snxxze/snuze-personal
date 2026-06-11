"use client";

import { useState, useEffect } from "react";
import type { NoteItem } from "@/types";
import { safeParse } from "@/lib/sheets-sanitize";
import { apiFetch } from "@/lib/api";

// Mock Data
export const DEFAULT_NOTES: NoteItem[] = [
  {
    id: crypto.randomUUID(),
    content: "ไอเดียทำแอป Personal AI Dashboard ธีม Neutral Modern",
    createdAt: new Date().toISOString(),
  },
];

// Sync notes data to Google Sheets
async function syncNotesToSheets(notes: NoteItem[], signal?: AbortSignal) {
  try {
    await apiFetch("/api/sheets/notes", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ notes }),
      signal,
    });
  } catch (error) {
    console.warn("Background notes sync failed:", error);
  }
}

export function useNotes() {
  const [notes, setNotes] = useState<NoteItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("snuze_notes");
      return safeParse<NoteItem[]>(saved, DEFAULT_NOTES);
    }
    return DEFAULT_NOTES;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLatest = async (signal?: AbortSignal) => {
    try {
      const res = await apiFetch("/api/sheets/notes", { signal });
      if (res.ok) {
        const data = await res.json();
        if (data.status === "success" && data.notes && data.notes.length > 0) {
          setError(null);
          setNotes(data.notes);
          localStorage.setItem("snuze_notes", JSON.stringify(data.notes));
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

  // Save notes to state, localStorage, and trigger sync
  const saveNotes = (newNotes: NoteItem[]) => {
    setNotes(newNotes);
    localStorage.setItem("snuze_notes", JSON.stringify(newNotes));
    syncNotesToSheets(newNotes);
  };

  // Create new note handler
  const addNote = (content: string) => {
    const newNote: NoteItem = {
      id: crypto.randomUUID(), 
      content,
      createdAt: new Date().toISOString(),
    };
    saveNotes([newNote, ...notes]);
  };
  
  // Delete note handler
  const deleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    saveNotes(updated);
  };
  
  return { notes, isLoading, error, addNote, deleteNote, refetch: () => fetchLatest() };
}