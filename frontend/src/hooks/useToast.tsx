"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface Toast {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

export interface ToastContextType {
  toasts: Toast[];
  showToast: (param1: string, param2?: string) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((param1: string, param2?: string) => {
    let type: "success" | "error" | "info" = "info";
    let message = String(param1);

    if (param1 === "success" || param1 === "error" || param1 === "info") {
      type = param1;
      message = param2 ? String(param2) : "";
    } else if (param2 === "success" || param2 === "error" || param2 === "info") {
      type = param2;
      message = String(param1);
    }

    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);
    
    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`pointer-events-auto animate-slide-in-top px-4 py-3 rounded-lg shadow-lg max-w-sm flex items-center gap-3 ${
            toast.type === "success" ? "bg-green-600 text-white" :
            toast.type === "error" ? "bg-red-600 text-white" :
            "bg-primary-600 text-white"
          }`}
        >
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-white/80 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}