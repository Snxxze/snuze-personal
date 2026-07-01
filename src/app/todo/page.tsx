"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ClipboardList, CheckCheck, History } from "lucide-react";
import Link from "next/link";
import { useData } from "@/providers/DataProvider";
import { sortTodos } from "@/lib/todo-sort";

import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { FAB } from "@/components/ui/fab";
import { Button } from "@/components/ui/button";

import { TodoItem } from "@/components/todo/todo-item";
import type { TodoItem as TodoItemType } from "@/types";
import { CreateTodoDrawer } from "@/components/todo/create-todo-drawer";
import { TodoDetailDrawer } from "@/components/todo/todo-detail-drawer";
import SyncStatusBanner from "@/components/ui/SyncStatusBanner";

export default function TodoPage() {
  const { todos, addTodo, toggleTodo, updateTodo, deleteTodo, todosError, refetchTodos } = useData();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<TodoItemType | null>(null);

  const completedTodos = todos.filter((t) => t.completed);
  const sortedTodos = sortTodos(todos);
  const pendingTodos = sortedTodos.filter((t) => !t.completed);
  const pendingCount = pendingTodos.length;

  return (
    <motion.div
      key="todo"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col h-full relative"
    >
      <div className="flex justify-between items-center mb-1">
        <PageHeader
          title="Tasks"
          subtitle={
            <span className="flex items-center gap-1.5">
              <CheckCheck className="w-3.5 h-3.5 text-zen-pine" />
              เสร็จแล้ว {completedTodos.length} / {todos.length} งาน
            </span>
          }
        />
        <Link
          href="/todo/history"
          className="flex items-center gap-1 bg-zen-indigo/10 border border-zen-indigo/10 text-zen-indigo text-[10px] font-semibold tracking-wide uppercase px-3 py-2 rounded-xl active:scale-95 hover:bg-zen-indigo/15 hover:border-zen-indigo/20 transition-all shadow-sm cursor-pointer"
        >
          <History className="w-3.5 h-3.5" />
          <span>ประวัติงาน</span>
        </Link>
      </div>

      {todos.length > 0 && (
        <div className="mb-5 h-1 bg-zen-pebble/30 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-zen-pine rounded-full"
            initial={{ width: 0 }}
            animate={{
              width: `${todos.length === 0 ? 0 : (completedTodos.length / todos.length) * 100}%`,
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-2.5">
        <SyncStatusBanner error={todosError} onRetry={refetchTodos} />
        {pendingTodos.length === 0 ? (
          <EmptyState
            icon={<ClipboardList className="w-6 h-6" />}
            title="ไม่มีงานค้างในขณะนี้"
            description="เพิ่มงานใหม่โดยการกดปุ่มบวกด้านล่าง เพื่อเริ่มต้นจัดการตารางชีวิตของคุณ"
            action={
              <Button variant="link" size="sm" onClick={() => setIsDrawerOpen(true)}>
                สร้างงานแรกของคุณ
              </Button>
            }
          />
        ) : (
          <AnimatePresence initial={false}>
            {pendingTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={toggleTodo}
                onClick={() => setSelectedTodo(todo)}
                onDelete={deleteTodo}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      <FAB
        icon={<Plus className="w-6 h-6" />}
        ariaLabel="เพิ่มงานใหม่"
        onClick={() => setIsDrawerOpen(true)}
      />

      <CreateTodoDrawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSubmit={addTodo}
      />

      <TodoDetailDrawer
        open={selectedTodo !== null}
        todo={selectedTodo}
        onClose={() => setSelectedTodo(null)}
        onSave={updateTodo}
      />
    </motion.div>
  );
}
