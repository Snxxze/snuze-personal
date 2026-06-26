"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useStocks } from "@/hooks/useStocks";
import { useTodos } from "@/hooks/useTodos";
import { useNotes } from "@/hooks/useNotes";
import { DEFAULT_USD_TO_THB } from "@/lib/constants";

type DataContextType = {
  // Exchange Rate
  usdToThb: number;

  // Stocks
  stocks: ReturnType<typeof useStocks>["stocks"];
  isStocksLoading: boolean;
  stocksError: string | null;
  addStock: ReturnType<typeof useStocks>["addStock"];
  deleteStock: ReturnType<typeof useStocks>["deleteStock"];
  refetchStocks: () => void;

  // Todos
  todos: ReturnType<typeof useTodos>["todos"];
  isTodosLoading: boolean;
  todosError: string | null;
  addTodo: ReturnType<typeof useTodos>["addTodo"];
  toggleTodo: ReturnType<typeof useTodos>["toggleTodo"];
  updateTodo: ReturnType<typeof useTodos>["updateTodo"];
  deleteTodo: ReturnType<typeof useTodos>["deleteTodo"];
  refetchTodos: () => void;

  // Notes
  notes: ReturnType<typeof useNotes>["notes"];
  isNotesLoading: boolean;
  notesError: string | null;
  addNote: ReturnType<typeof useNotes>["addNote"];
  updateNote: ReturnType<typeof useNotes>["updateNote"];
  deleteNote: ReturnType<typeof useNotes>["deleteNote"];
  refetchNotes: () => void;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { stocks, isLoading: isStocksLoading, error: stocksError, addStock, deleteStock, refetch: refetchStocks } = useStocks();
  const { todos, isLoading: isTodosLoading, error: todosError, addTodo, toggleTodo, updateTodo, deleteTodo, refetch: refetchTodos } = useTodos();
  const { notes, isLoading: isNotesLoading, error: notesError, addNote, updateNote, deleteNote, refetch: refetchNotes } = useNotes();
  const [usdToThb, setUsdToThb] = useState(DEFAULT_USD_TO_THB);

  useEffect(() => {
    let active = true;
    async function fetchExchangeRate() {
      try {
        const res = await fetch("https://open.er-api.com/v6/latest/USD");
        if (res.ok && active) {
          const data = await res.json();
          if (data && data.rates && typeof data.rates.THB === "number") {
            setUsdToThb(data.rates.THB);
            console.log("Updated USD to THB rate dynamically:", data.rates.THB);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch dynamic exchange rate, using fallback:", err);
      }
    }
    fetchExchangeRate();
    return () => {
      active = false;
    };
  }, []);

  return (
    <DataContext.Provider
      value={{
        usdToThb,
        stocks,
        isStocksLoading,
        stocksError,
        addStock,
        deleteStock,
        refetchStocks,

        todos,
        isTodosLoading,
        todosError,
        addTodo,
        toggleTodo,
        updateTodo,
        deleteTodo,
        refetchTodos,

        notes,
        isNotesLoading,
        notesError,
        addNote,
        updateNote,
        deleteNote,
        refetchNotes,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
