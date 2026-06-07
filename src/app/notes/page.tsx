"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, FileText } from "lucide-react";
import { useNotes } from "@/hooks/useNotes";

import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { FAB } from "@/components/ui/fab";
import { Button } from "@/components/ui/button";

import { NoteItem } from "@/components/notes/note-item";
import { CreateNoteDrawer } from "@/components/notes/create-note-drawer";

export default function NotesPage() {
  const { notes, isLoading, addNote, deleteNote } = useNotes();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const filteredNotes = useMemo(() => {
    return notes.filter((note) =>
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [notes, searchQuery]);

  return (
    <motion.div
      key="notes"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col h-full relative"
    >
      <PageHeader 
        title="Notes" 
        subtitle={`${notes.length} บันทึก`} 
      />

      <div className="mb-6">
        <Input
          variant="search"
          placeholder="ค้นหาบันทึก..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-2.5">
        {filteredNotes.length === 0 ? (
          <EmptyState
            icon={<FileText className="w-6 h-6" />}
            title={searchQuery ? "ไม่พบผลลัพธ์" : "ยังไม่มีข้อมูลบันทึกย่อ"}
            description={
              searchQuery
                ? "ลองใช้คำค้นหาอื่นหรือคำที่กว้างขึ้นเพื่อค้นหาบันทึกของคุณ"
                : "บันทึกไอเดีย ความคิด หรือบันทึกด่วนของคุณไว้ที่นี่เพื่อความสะดวกสบาย"
            }
            action={
              !searchQuery ? (
                <Button variant="link" size="sm" onClick={() => setIsDrawerOpen(true)}>
                  เริ่มจดบันทึกย่อแรก
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="divide-y divide-zen-pebble/20 bg-zen-white rounded-2xl border border-zen-pebble/30 overflow-hidden shadow-sm">
            <AnimatePresence initial={false}>
              {filteredNotes.map((note) => (
                <NoteItem
                  key={note.id}
                  note={note}
                  onDelete={deleteNote}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <FAB
        icon={<Plus className="w-6 h-6" />}
        ariaLabel="เขียนบันทึกใหม่"
        onClick={() => setIsDrawerOpen(true)}
      />

      <CreateNoteDrawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSubmit={addNote}
      />
    </motion.div>
  );
}
