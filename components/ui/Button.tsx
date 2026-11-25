"use client";

import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-surface hover:bg-accent-hover border border-transparent",
  secondary:
    "bg-surface-raised text-ink-900 border border-line hover:border-ink-300 hover:bg-surface",
  ghost:
    "bg-transparent text-ink-700 border border-transparent hover:bg-ink-900/5 hover:text-ink-900",
  danger:
    "bg-danger-soft text-danger border border-danger/25 hover:bg-danger hover:text-surface hover:border-danger",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-small gap-1.5 min-h-[44px] sm:min-h-[34px]",
  md: "px-4 py-2 text-small gap-2 min-h-[44px] sm:min-h-[38px]",
  lg: "px-5 py-2.5 text-body gap-2 min-h-[44px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      leftIcon,
      rightIcon,
      children,
      className = "",
      type = "button",
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={`inline-flex items-center justify-center font-medium rounded-control transition-[transform,background-color,border-color,color,opacity] duration-micro ease-editorial hover:-translate-y-px active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper select-none ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" strokeWidth={1.5} aria-hidden="true" />
        ) : (
          leftIcon && <span className="shrink-0 inline-flex">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!loading && rightIcon && (
          <span className="shrink-0 inline-flex">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

