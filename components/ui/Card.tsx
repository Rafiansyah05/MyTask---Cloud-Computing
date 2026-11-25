import React from "react";

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  tone?: "raised" | "paper" | "surface";
  padding?: "none" | "sm" | "md" | "lg";
};

const toneClasses = {
  raised: "bg-surface-raised border border-line",
  paper: "bg-paper border border-line",
  surface: "bg-surface border border-line",
};

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export const Card: React.FC<CardProps> = ({
  tone = "raised",
  padding = "md",
  className = "",
  children,
  ...props
}) => {
  return (
    <div
      className={`rounded-card ${toneClasses[tone]} ${paddingClasses[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

