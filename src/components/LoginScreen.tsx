"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff, ShieldAlert, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LoginScreenProps {
  onLogin: (password: string) => Promise<boolean>;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const success = await onLogin(password);
      if (!success) {
        setError("รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง");
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-6 bg-zen-sand min-h-0 overflow-y-auto">
      <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-zen-indigo/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-zen-indigo/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-sm z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex p-3 bg-zen-white border border-zen-pebble/40 rounded-2xl shadow-sm text-zen-indigo mb-4"
          >
            <Lock className="w-6 h-6 animate-pulse" />
          </motion.div>
          
          <h1 className="text-2xl font-bold tracking-tight text-zen-charcoal font-sans">
            Snuze
          </h1>
          <p className="text-xs text-zen-slate mt-1.5 max-w-[240px] mx-auto leading-relaxed">
            กรุณาป้อนรหัสผ่านส่วนตัวเพื่อเข้าสู่แดชบอร์ด
          </p>
        </div>

        <div className="bg-zen-white/70 backdrop-blur-md border border-zen-pebble/30 rounded-3xl p-6 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label 
                htmlFor="password" 
                className="text-[10px] font-semibold text-zen-slate uppercase tracking-wider block"
              >
                Password
              </label>
              
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoFocus
                  placeholder="ป้อนรหัสผ่าน..."
                  className="
                    w-full text-sm bg-zen-sand/60 border border-zen-pebble/20 rounded-xl
                    pl-4 pr-11 py-3 text-zen-charcoal placeholder-zen-slate/40
                    focus:outline-none focus:border-zen-indigo/40 focus:bg-zen-white
                    transition-all duration-200
                  "
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zen-slate/50 hover:text-zen-indigo transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -5 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -5 }}
                  className="flex items-start gap-2 text-xs text-zen-error font-medium bg-zen-error/10 p-3 rounded-xl border border-zen-error/25"
                >
                  <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isLoading || !password.trim()}
              className="
                w-full bg-zen-indigo text-zen-white font-medium text-sm
                rounded-xl py-3 flex items-center justify-center gap-2
                hover:bg-zen-indigo/90 active:scale-[0.98]
                disabled:opacity-45 disabled:pointer-events-none
                transition-all duration-200 shadow-sm cursor-pointer
              "
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-zen-white/30 border-t-zen-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>เข้าสู่ระบบ</span>
                  <Sparkles className="w-3.5 h-3.5 text-zen-white/80" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <p className="text-[10px] text-zen-slate/60">
            Snuze Personal AI Dashboard • v1.0
          </p>
        </div>
      </motion.div>
    </div>
  );
}
