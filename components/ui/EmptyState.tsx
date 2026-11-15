import React from "react";

type EmptyStateProps = {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="border border-slate-200/80 bg-white rounded-[8px] p-10 text-center space-y-3">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-[8px] bg-blue-50 text-blue-600 font-mono text-sm font-bold mx-auto border border-blue-100">
        NIL
      </div>
      <h4 className="text-base font-semibold text-slate-800">{title}</h4>
      <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <div className="pt-3">
          <button
            type="button"
            onClick={onAction}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-[8px] shadow-sm transition-all"
          >
            {actionText}
          </button>
        </div>
      )}
    </div>
  );
};
