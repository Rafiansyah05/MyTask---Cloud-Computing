"use client";

import React from "react";
import { Info, Trash2 } from "lucide-react";
import { Modal } from "./Modal";
import { ModalActions } from "./ModalActions";

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
  cancelLabel,
  isDestructive = true,
  isLoading = false,
}) => {
  const Icon = isDestructive ? Trash2 : Info;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="space-y-5">
        <div className="flex items-start gap-4">
          <span
            className={`flex items-center justify-center w-11 h-11 shrink-0 rounded-full ${
              isDestructive
                ? "bg-rose-50 text-rose-600"
                : "bg-[#EEF4FF] text-[#0066FF]"
            }`}
          >
            <Icon className="w-5 h-5" aria-hidden="true" />
          </span>
          <p className="min-w-0 text-sm text-slate-600 leading-relaxed break-words">
            {message}
          </p>
        </div>

        <ModalActions
          onCancel={onClose}
          onConfirm={onConfirm}
          confirmLabel={confirmLabel}
          cancelLabel={cancelLabel}
          loadingLabel="Memproses..."
          isLoading={isLoading}
          isDestructive={isDestructive}
        />
      </div>
    </Modal>
  );
};
