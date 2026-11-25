"use client";

import React, { forwardRef } from "react";

export type IconButtonVariant = "ghost" | "secondary" | "danger";

export type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  "aria-label": string;
  variant?: IconButtonVariant;
  size?: "sm" | "md";
};

const variantClasses: Record<IconButtonVariant, string> = {
  ghost:
    "bg-transparent text-ink-500 border border-transparent hover:bg-ink-900/5 hover:text-ink-900",
  secondary:
    "bg-surface-raised text-ink-700 border border-line hover:border-ink-300 hover:text-ink-900",
  danger:
    "bg-transparent text-danger border border-transparent hover:bg-danger-soft",
};

const sizeClasses = {
  sm: "min-h-[44px] min-w-[44px] sm:min-h-[34px] sm:min-w-[34px] p-1.5",
  md: "min-h-[44px] min-w-[44px] sm:min-h-[38px] sm:min-w-[38px] p-2",
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    { variant = "ghost", size = "md", children, className = "", type = "button", ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={`inline-flex items-center justify-center rounded-control transition-[transform,background-color,border-color,color] duration-micro ease-editorial hover:-translate-y-px active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

IconButton.displayName = "IconButton";

