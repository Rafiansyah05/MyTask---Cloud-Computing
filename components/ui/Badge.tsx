import React from "react";

type BadgeProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "success" | "warning" | "danger" | "neutral";
  size?: "sm" | "md";
  dot?: boolean;
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "primary",
  size = "md",
  dot = false,
}) => {
  const variantStyles = {
    primary: "bg-blue-50 text-blue-700 border-blue-200",
    secondary: "bg-indigo-50 text-indigo-700 border-indigo-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-800 border-amber-200",
    danger: "bg-rose-50 text-rose-700 border-rose-200",
    neutral: "bg-slate-100 text-slate-700 border-slate-200",
  };

  const dotColors = {
    primary: "bg-blue-500",
    secondary: "bg-indigo-500",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-rose-500",
    neutral: "bg-slate-400",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[11px] font-medium tracking-wide",
    md: "px-2.5 py-1 text-xs font-medium tracking-wide",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 border rounded-[8px] ${variantStyles[variant]} ${sizeStyles[size]} select-none font-medium`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]} shrink-0`} />}
      {children}
    </span>
  );
};
