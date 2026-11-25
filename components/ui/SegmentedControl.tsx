"use client";

import React, { useRef } from "react";

export type SegmentedOption<T extends string> = {
  value: T;
  label: string;
  count?: number;
};

export type SegmentedControlProps<T extends string> = {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  "aria-label": string;
  className?: string;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  "aria-label": ariaLabel,
  className = "",
}: SegmentedControlProps<T>) {
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const activeIndex = Math.max(
    0,
    options.findIndex((o) => o.value === value)
  );

  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    let nextIdx: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      nextIdx = (idx + 1) % options.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      nextIdx = (idx - 1 + options.length) % options.length;
    } else if (e.key === "Home") {
      nextIdx = 0;
    } else if (e.key === "End") {
      nextIdx = options.length - 1;
    }

    if (nextIdx !== null) {
      e.preventDefault();
      onChange(options[nextIdx].value);
      buttonsRef.current[nextIdx]?.focus();
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={`relative inline-flex flex-wrap sm:flex-nowrap items-center p-1 rounded-control border border-line bg-paper gap-1 ${className}`}
    >
      {options.map((opt, idx) => {
        const isSelected = idx === activeIndex;
        return (
          <button
            key={opt.value}
            ref={(el) => {
              buttonsRef.current[idx] = el;
            }}
            type="button"
            role="radio"
            aria-checked={isSelected}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onChange(opt.value)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={`relative z-10 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 min-h-[40px] sm:min-h-[32px] rounded-[4px] text-small font-medium transition-[background-color,color,transform] duration-micro ease-editorial active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 ${
              isSelected
                ? "bg-surface text-ink-900 border border-line shadow-float"
                : "text-ink-500 border border-transparent hover:text-ink-900"
            }`}
          >
            <span>{opt.label}</span>
            {opt.count !== undefined && (
              <span
                className={`font-mono text-micro ${
                  isSelected ? "text-accent" : "text-ink-500"
                }`}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

