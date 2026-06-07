import type { TodoItem } from "@/types";

const PRIORITY_WEIGHT = {
  high: 3,
  medium: 2,
  low: 1,
} as const;

/**
 * จัดเรียงรายการ Todo โดย:
 * 1. งานที่ยังไม่เสร็จ (done = false) จะอยู่ก่อนงานที่เสร็จแล้ว
 * 2. หากสถานะความสำเร็จเท่ากัน จะเรียงตามความเร่งด่วน (high -> medium -> low)
 */
export function sortTodos(todos: TodoItem[]): TodoItem[] {
  return [...todos].sort((a, b) => {
    // 1. เรียงตามสถานะ Completed
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
    // 2. เรียงตามระดับความสำคัญ (Priority)
    return PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
  });
}

