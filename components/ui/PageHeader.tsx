import React from "react";

export type PageHeaderProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  action,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-line ${className}`}
    >
      <div className="space-y-1 min-w-0">
        <h1 className="font-serif text-display-lg text-ink-900">{title}</h1>
        {description && (
          <p className="text-body text-ink-500">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

