"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export type ToastItem = {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
};

type ToastContextValue = {
  showToast: (toast: Omit<ToastItem, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}

const iconMap: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="w-4 h-4 text-success shrink-0" strokeWidth={1.5} />,
  error: <AlertCircle className="w-4 h-4 text-danger shrink-0" strokeWidth={1.5} />,
  warning: <AlertTriangle className="w-4 h-4 text-warning shrink-0" strokeWidth={1.5} />,
  info: <Info className="w-4 h-4 text-ink-700 shrink-0" strokeWidth={1.5} />,
};

const styleMap: Record<ToastType, string> = {
  success: "bg-success-soft border-success/25 text-ink-900",
  error: "bg-danger-soft border-danger/25 text-ink-900",
  warning: "bg-warning-soft border-warning/25 text-ink-900",
  info: "bg-surface-raised border-line text-ink-900",
};

export type ToastBannerProps = {
  type?: ToastType;
  title?: string;
  message: string;
  onClose?: () => void;
  autoDismissMs?: number;
  className?: string;
};

export const ToastBanner: React.FC<ToastBannerProps> = ({
  type = "info",
  title,
  message,
  onClose,
  autoDismissMs,
  className = "",
}) => {
  useEffect(() => {
    const ms = autoDismissMs ?? (type === "success" ? 4500 : 0);
    if (!ms || !onClose) return;
    const timer = setTimeout(onClose, ms);
    return () => clearTimeout(timer);
  }, [type, autoDismissMs, onClose]);

  const role = type === "error" || type === "warning" ? "alert" : "status";

  return (
    <div
      role={role}
      aria-live={type === "error" ? "assertive" : "polite"}
      className={`flex items-start justify-between gap-3 px-4 py-3 rounded-card border animate-fade-up ${styleMap[type]} ${className}`}
    >
      <div className="flex items-start gap-2.5 min-w-0">
        <span className="mt-0.5" aria-hidden="true">
          {iconMap[type]}
        </span>
        <div className="space-y-0.5 min-w-0">
          {title && (
            <p className="text-small font-medium text-ink-900">{title}</p>
          )}
          <p className="text-small text-ink-700 leading-relaxed">{message}</p>
        </div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup notifikasi"
          className="inline-flex items-center justify-center min-h-[36px] min-w-[36px] -my-1.5 -mr-1.5 rounded-control text-ink-500 hover:text-ink-900 hover:bg-ink-900/5 transition-colors duration-micro focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <X className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
        </button>
      )}
    </div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<ToastItem, "id">) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev.slice(-2), { ...toast, id }]);
      if (toast.type === "success" || toast.type === "info") {
        setTimeout(() => removeToast(id), 4500);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-20 lg:bottom-6 right-4 left-4 sm:left-auto sm:w-96 z-50 flex flex-col gap-2 pointer-events-none"
      >
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto shadow-float rounded-card">
            <ToastBanner
              type={t.type}
              title={t.title}
              message={t.message}
              onClose={() => removeToast(t.id)}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

