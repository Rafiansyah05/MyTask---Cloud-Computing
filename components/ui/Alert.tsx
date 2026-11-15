import React from "react";

type AlertProps = {
  type?: "success" | "error" | "info" | "warning";
  title?: string;
  message: string;
  onClose?: () => void;
};

export const Alert: React.FC<AlertProps> = ({
  type = "info",
  title,
  message,
  onClose,
}) => {
  const styles = {
    success: "bg-emerald-50/70 border-emerald-200 text-emerald-800",
    error: "bg-rose-50/70 border-rose-200 text-rose-800",
    warning: "bg-amber-50/70 border-amber-200 text-amber-800",
    info: "bg-blue-50/70 border-blue-200 text-blue-800",
  };

  const badgeStyles = {
    success: "bg-emerald-100 text-emerald-800",
    error: "bg-rose-100 text-rose-800",
    warning: "bg-amber-100 text-amber-800",
    info: "bg-blue-100 text-blue-800",
  };

  const tagLabels = {
    success: "Sukses",
    error: "Perhatian",
    warning: "Peringatan",
    info: "Informasi",
  };

  return (
    <div className={`p-4 rounded-[8px] border ${styles[type]} flex items-start justify-between gap-4 transition-all`}>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-[8px] text-[11px] font-bold ${badgeStyles[type]}`}>
            {tagLabels[type]}
          </span>
          {title && <span className="font-semibold text-sm">{title}</span>}
        </div>
        <p className="text-xs sm:text-sm leading-relaxed">{message}</p>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-xs font-semibold px-2 py-1 rounded-[8px] hover:bg-black/5 shrink-0 transition-colors"
        >
          Tutup
        </button>
      )}
    </div>
  );
};
