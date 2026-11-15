"use client";

import React from "react";
import { Modal } from "./Modal";

type ConfirmModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
};

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Konfirmasi Hapus",
  cancelLabel = "Batal",
  isDestructive = true,
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="space-y-6">
        <p className="text-sm text-slate-600 leading-relaxed">{message}</p>

        <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold rounded-[8px] border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-xs font-semibold rounded-[8px] text-white transition-colors disabled:opacity-50 ${
              isDestructive
                ? "bg-rose-600 hover:bg-rose-700 shadow-sm"
                : "bg-blue-600 hover:bg-blue-700 shadow-sm"
            }`}
          >
            {isLoading ? "Memproses..." : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};
