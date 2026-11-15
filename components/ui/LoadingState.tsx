import React from "react";

export const LoadingState: React.FC<{ message?: string }> = ({
  message = "Memuat data...",
}) => {
  return (
    <div className="border border-slate-200/80 bg-white rounded-[8px] p-12 text-center space-y-3">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[8px] bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
        <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
        <span>Memproses Data</span>
      </div>
      <p className="text-xs sm:text-sm text-slate-500">{message}</p>
    </div>
  );
};
