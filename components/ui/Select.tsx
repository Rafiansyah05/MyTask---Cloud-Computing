"use client";

import React, { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { useFieldContext } from "./Field";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  hasError?: boolean;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ id, hasError, children, className = "", ...props }, ref) => {
    const field = useFieldContext();
    const resolvedId = id || field?.inputId;
    const isError = hasError ?? field?.hasError ?? false;

    return (
      <div className="relative">
        <select
          ref={ref}
          id={resolvedId}
          aria-invalid={isError || undefined}
          aria-describedby={props["aria-describedby"] || field?.describedBy}
          className={`w-full min-w-0 appearance-none pl-3.5 pr-9 py-2.5 sm:py-2 min-h-[44px] sm:min-h-[38px] rounded-control border bg-surface text-body sm:text-small text-ink-900 transition-[border-color,box-shadow] duration-micro ease-editorial focus:outline-none focus:ring-2 focus:ring-accent/25 ${
            isError
              ? "border-danger focus:border-danger"
              : "border-line hover:border-ink-300 focus:border-accent"
          } disabled:opacity-50 disabled:bg-paper ${className}`}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="w-4 h-4 text-ink-500 pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </div>
    );
  }
);

Select.displayName = "Select";

