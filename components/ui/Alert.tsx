"use client";

import React from "react";
import { ToastBanner, ToastType } from "./Toast";

type AlertProps = {
  type?: ToastType;
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
  return (
    <ToastBanner
      type={type}
      title={title}
      message={message}
      onClose={onClose}
      autoDismissMs={0}
    />
  );
};
