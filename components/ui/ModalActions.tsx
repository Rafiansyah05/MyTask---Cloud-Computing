"use client";

import React from "react";

type ModalActionsProps = {
  onCancel: () => void;
  confirmLabel: string;
  onConfirm?: () => void;
  cancelLabel?: string;
  loadingLabel?: string;
  isLoading?: boolean;
  disabled?: boolean;
  isDestructive?: boolean;
};

const buttonBase =
  "min-h-[44px] sm:min-h-[40px] px-5 rounded-xl text-xs font-semibold transition-colors duration-micro disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

export const ModalActions: React.FC<ModalActionsProps> = ({
  onCancel,
  confirmLabel,
  onConfirm,
  cancelLabel = "Batal",
  loadingLabel = "Menyimpan...",
  isLoading = false,
  disabled = false,
  isDestructive = false,
}) => {
  return (
    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-2">
      <button
        type="button"
        onClick={onCancel}
        disabled={isLoading}
        className={`${buttonBase} bg-slate-100 text-slate-700 hover:bg-slate-200 focus-visible:ring-slate-400`}
      >
        {cancelLabel}
      </button>
      <button
        type={onConfirm ? "button" : "submit"}
        onClick={onConfirm}
        disabled={isLoading || disabled}
        className={`${buttonBase} text-white ${
          isDestructive
            ? "bg-rose-600 hover:bg-rose-700 focus-visible:ring-rose-500"
            : "bg-[#0066FF] hover:bg-[#0052CC] focus-visible:ring-accent"
        }`}
      >
        {isLoading ? loadingLabel : confirmLabel}
      </button>
    </div>
  );
};
