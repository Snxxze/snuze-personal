"use client";

import { useState, useEffect } from "react";
import type { NoteItem } from "@/types";

// Mock Data
export const DEFAULT_NOTES: NoteItem[] = [
  {
    id: crypto.randomUUID(),
    content: "ไอเดียทำแอป Personal AI Dashboard ธีม Neutral Modern",
    createdAt: new Date().toISOString(),
  },
];

// ฟังก์ชันซิงค์ข้อมูลขึ้น Google Sheets
async function syncNotesToSheets(notes: NoteItem[]) {
  try {
    const res = await fetch("/api/sheets", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ notes }),
    });
    if (res.status === 401) {
      window.location.reload();
    }
  } catch (error) {
    console.warn("Background notes sync failed:", error);
  }
}

export function useNotes() {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("snuze_notes");
    const initial = saved ? JSON.parse(saved) : DEFAULT_NOTES;
    setNotes(initial);
    setIsLoading(false);

    // ซิงค์อัปเดตข้อมูล
    const fetchLatest = async () => {
      try {
        const res = await fetch("/api/sheets");
        if (res.status === 401) {
          window.location.reload();
          return;
        }
        if (res.ok) {
          const data = await res.json();

          if (data.status === "success" && data.notes && data.notes.length > 0) {
            setNotes(data.notes);
            localStorage.setItem("snuze_notes", JSON.stringify(data.notes));
          }
        }
      } catch (error) {
        console.warn("Could not sync notes with Google Sheets on load:", error);
      }
    }

    fetchLatest();
  }, [])

  // ฟังก์ชันตัวกลางบันทึกข้อมูลโน้ตและส่งซิงค์
  const saveNotes = (newNotes: NoteItem[]) => {
    setNotes(newNotes);
    localStorage.setItem("snuze_notes", JSON.stringify(newNotes));
    syncNotesToSheets(newNotes);
  };

  // handler Create
  const addNote = (content: string) => {
    const newNote: NoteItem = {
      id: crypto.randomUUID(), 
      content,
      createdAt: new Date().toISOString(),
    };
    saveNotes([newNote, ...notes]);
  };
  
  // handler Delete
  const deleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    saveNotes(updated);
  };
  
  return { notes, isLoading, addNote, deleteNote };
}