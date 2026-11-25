"use client";

import React, { createContext, useContext, useId } from "react";

type FieldContextValue = {
  inputId: string;
  describedBy?: string;
  hasError: boolean;
};

const FieldContext = createContext<FieldContextValue | null>(null);

export function useFieldContext() {
  return useContext(FieldContext);
}

export type FieldProps = {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string | null;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
};

export const Field: React.FC<FieldProps> = ({
  label,
  required = false,
  hint,
  error,
  htmlFor,
  children,
  className = "",
}) => {
  const generatedId = useId();
  const inputId = htmlFor || `field-${generatedId}`;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy =
    [errorId, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <FieldContext.Provider
      value={{ inputId, describedBy, hasError: Boolean(error) }}
    >
      <div className={`space-y-1.5 ${className}`}>
        <label
          htmlFor={inputId}
          className="block text-small font-medium text-ink-700"
        >
          {label}
          {required && (
            <span className="text-accent ml-1" aria-hidden="true">
              *
            </span>
          )}
        </label>
        {children}
        {error && (
          <p id={errorId} role="alert" className="text-micro text-danger">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={hintId} className="text-micro text-ink-500">
            {hint}
          </p>
        )}
      </div>
    </FieldContext.Provider>
  );
};

