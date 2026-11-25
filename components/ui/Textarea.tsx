"use client";

import React, { forwardRef } from "react";
import { useFieldContext } from "./Field";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  hasError?: boolean;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ id, hasError, className = "", rows = 3, ...props }, ref) => {
    const field = useFieldContext();
    const resolvedId = id || field?.inputId;
    const isError = hasError ?? field?.hasError ?? false;

    return (
      <textarea
        ref={ref}
        id={resolvedId}
        rows={rows}
        aria-invalid={isError || undefined}
        aria-describedby={props["aria-describedby"] || field?.describedBy}
        className={`w-full min-w-0 px-3.5 py-2.5 rounded-control border bg-surface text-body sm:text-small text-ink-900 placeholder:text-ink-500/70 transition-[border-color,box-shadow] duration-micro ease-editorial focus:outline-none focus:ring-2 focus:ring-accent/25 ${
          isError
            ? "border-danger focus:border-danger"
            : "border-line hover:border-ink-300 focus:border-accent"
        } disabled:opacity-50 disabled:bg-paper ${className}`}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";

