"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ToastProps {
  message: string | null;
  onDismiss?: () => void;
}

export function Toast({ message, onDismiss }: ToastProps) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => onDismiss?.(), 4000);
    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="toast-success fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] left-1/2 z-[60] w-[calc(100%-2rem)] max-w-[398px] -translate-x-1/2 rounded-2xl border border-[#D4AF37]/28 bg-[rgba(5,10,8,0.88)] px-4 py-3 backdrop-blur-xl"
          role="status"
        >
          <p className="text-center text-[13px] leading-relaxed text-white/85">
            {message}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
