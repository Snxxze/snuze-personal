"use client";

import { createContext, useContext, useState, useEffect } from "react";
import LoginScreen from "./LoginScreen";
import Header from "./Header";
import BottomNav from "./BottomNav";

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

import { DataProvider } from "@/providers/DataProvider";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [isPasswordRequired, setIsPasswordRequired] = useState(false);

  useEffect(() => {
    async function checkAuthStatus() {
      try {
        const res = await fetch("/api/auth/status");
        if (res.ok) {
          const data = await res.json();
          setIsPasswordRequired(data.required);

          if (data.required) {
            if (data.authenticated) {
              setToken("session");
              setIsAuthenticated(true);
            } else {
              setToken(null);
              setIsAuthenticated(false);
            }
          } else {
            setIsAuthenticated(true);
            setToken("session");
          }
        }
      } catch (err) {
        console.error("Failed to check auth status:", err);
      } finally {
        setIsChecking(false);
      }
    }

    checkAuthStatus();
  }, []);

  const login = async (password: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setToken("session");
          setIsAuthenticated(true);
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error("Login request failed:", err);
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout request failed:", err);
    }
    setToken(null);
    setIsAuthenticated(false);
  };

  if (isChecking) {
    return (
      <div className="flex-1 flex justify-center items-center bg-zen-sand h-[100dvh]">
        <div className="w-6 h-6 border-2 border-zen-indigo/30 border-t-zen-indigo rounded-full animate-spin" />
      </div>
    );
  }

  if (isPasswordRequired && !isAuthenticated) {
    return <LoginScreen onLogin={login} />;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, login, logout }}>
      <DataProvider>
        <Header />
        <main className="flex-1 px-5 pt-5 relative flex flex-col min-h-0 overflow-hidden">
          {children}
        </main>
        <BottomNav />
      </DataProvider>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
