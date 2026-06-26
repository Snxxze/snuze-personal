import { NoteItem } from "@/types";
import { useEffect, useState } from "react";
import { Drawer } from "../ui/drawer";

interface NoteDetailDrawerProps {
  note: NoteItem | null
  open: boolean
  onClose: () => void
  onSave: (id: string, content: string) => void
}

export function NoteDetailDrawer({ note, open, onClose, onSave }: NoteDetailDrawerProps) {
  const [content, setContent] = useState("")

  useEffect(() => {
    if (note) {
      setContent(note.content)
    }
  }, [note])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!note || !content.trim()) return

    onSave(note.id, content.trim())
    onClose()
  }

  if (!note) return null

  return (
    <Drawer open={open} onClose={onClose} title="รายละเอียดบันทึกย่อ">
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          required
          rows={6}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="พิมพ์ไอเดียหรือความทรงจำที่นี่..."
          className="
            w-full text-sm 
            bg-zen-sand border border-zen-pebble/20 
            rounded-xl p-3 
            text-zen-charcoal placeholder-zen-slate/40 
            focus:outline-none focus:border-zen-indigo/40 
            resize-none
          "
        />

        <div className="text-[10px] text-zen-slate flex flex-col gap-0.5">
          <span>
            สร้างเมื่อ: {new Date(note.createdAt).toLocaleString("th-TH")}
          </span>

          {note.updatedAt && (
            <span>
              แก้ไขล่าสุด: {new Date(note.updatedAt).toLocaleString("th-TH")}
            </span>
          )}
        </div>

        <button
          type="submit"
          className="
            w-full py-2.5 
            bg-zen-indigo text-zen-white 
            rounded-xl text-sm font-semibold 
            hover:bg-zen-indigo/90 transition-colors 
            shadow-sm cursor-pointer
          "
        >
          บันทึกการแก้ไข
        </button>
      </form>
    </Drawer>
  )
}