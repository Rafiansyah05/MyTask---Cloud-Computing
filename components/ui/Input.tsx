"use client";

import React, { forwardRef } from "react";
import { useFieldContext } from "./Field";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  hasError?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ id, hasError, className = "", ...props }, ref) => {
    const field = useFieldContext();
    const resolvedId = id || field?.inputId;
    const isError = hasError ?? field?.hasError ?? false;

    return (
      <input
        ref={ref}
        id={resolvedId}
        aria-invalid={isError || undefined}
        aria-describedby={props["aria-describedby"] || field?.describedBy}
        className={`w-full min-w-0 px-3.5 py-2.5 sm:py-2 min-h-[44px] sm:min-h-[38px] rounded-control border bg-surface text-body sm:text-small text-ink-900 placeholder:text-ink-500/70 transition-[border-color,box-shadow] duration-micro ease-editorial focus:outline-none focus:ring-2 focus:ring-accent/25 ${
          isError
            ? "border-danger focus:border-danger"
            : "border-line hover:border-ink-300 focus:border-accent"
        } disabled:opacity-50 disabled:bg-paper ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

