import React from "react";
import { motion } from "framer-motion";
import { Trash2, Calendar, Check, AlertCircle } from "lucide-react";
import type { TodoItem as TodoItemType } from "@/types";
import { isOverdue, getPriorityLabel, getPriorityVariant } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

interface TodoItemProps {
  todo: TodoItemType;
  onToggle: (id: string) => void;
  onClick: () => void;
  onDelete: (id: string) => void;
}

export function TodoItem({ todo, onToggle, onClick, onDelete }: TodoItemProps) {
  const overdue = !todo.completed && isOverdue(todo.dueDate); // note: in types we defined it as dueDate, in our sorting it was dueDate too
  
  return (
    <motion.div
      layout
      layoutId={`todo-${todo.id}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -50 }}
      onClick={onClick}
      className={`
        flex items-center justify-between gap-3
        p-4 rounded-xl border
        transition-all duration-150
        bg-zen-white cursor-pointer hover:bg-zen-sand/20
        ${todo.completed ? "border-zen-pebble/10 opacity-60" : "border-zen-pebble/30 shadow-sm"}
      `}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle(todo.id);
        }}
        className={`
          w-6 h-6 flex items-center justify-center 
          rounded border cursor-pointer transition-all duration-150 relative
          before:content-[''] before:absolute before:-inset-2 before:block
          ${todo.completed 
            ? "bg-zen-pine border-zen-pine text-zen-white" 
            : "border-zen-pebble hover:border-zen-indigo"
          }
        `}
      >
        {todo.completed && <Check className="w-4 h-4" />}
      </button>

      <div className="flex-1 min-w-0">
        <span
          className={`
            text-sm block truncate
            ${todo.completed ? "line-through text-zen-slate" : "text-zen-charcoal font-medium"}
          `}
        >
          {todo.text}
        </span>

        <div className="flex items-center gap-2 mt-1.5">
          <Badge variant={getPriorityVariant(todo.priority)}>
            {getPriorityLabel(todo.priority)}
          </Badge>
          
          {todo.dueDate && (
            <Badge variant={overdue ? "destructive" : "outline"} className="gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(todo.dueDate).toLocaleDateString("th-TH", {
                month: "short",
                day: "numeric",
              })}
              {overdue && (
                <AlertCircle className="w-3.5 h-3.5 text-red-500 animate-pulse" />
              )}
            </Badge>
          )}
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(todo.id);
        }}
        className="
          p-1.5 
          text-zen-slate/30 hover:text-zen-error hover:bg-red-50 
          rounded-lg transition-colors duration-150
          cursor-pointer
        "
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
