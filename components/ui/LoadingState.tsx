import React from "react";

export const LoadingState: React.FC<{ message?: string }> = ({
  message = "Memuat data...",
}) => {
  return (
    <div className="border border-slate-200/70 bg-white rounded-2xl p-12 text-center space-y-3">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#EEF4FF] text-[#0066FF] text-xs font-semibold">
        <span className="w-2 h-2 rounded-full bg-[#0066FF] animate-ping" />
        <span>Memproses Data</span>
      </div>
      <p className="text-xs sm:text-sm text-slate-500">{message}</p>
    </div>
  );
};
