"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";

export type DropdownMenuItem = {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "danger";
  dividerBefore?: boolean;
};

export type DropdownMenuProps = {
  items: DropdownMenuItem[];
  "aria-label"?: string;
  align?: "left" | "right";
};

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  items,
  "aria-label": ariaLabel = "Menu aksi",
  align = "right",
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    const handleOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handleOutside);
    window.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      window.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        itemRefs.current[0]?.focus();
      });
    }
  }, [open]);

  const handleMenuKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      itemRefs.current[(idx + 1) % items.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      itemRefs.current[(idx - 1 + items.length) % items.length]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      itemRefs.current[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      itemRefs.current[items.length - 1]?.focus();
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={ariaLabel}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className="inline-flex items-center justify-center w-11 h-11 sm:w-8 sm:h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 aria-expanded:bg-slate-100 aria-expanded:text-slate-700 transition-colors duration-micro focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          className={`absolute ${
            align === "right" ? "right-0 origin-top-right" : "left-0 origin-top-left"
          } mt-1.5 w-52 rounded-2xl border border-slate-200/70 bg-surface p-1.5 shadow-float z-30 animate-dropdown-in`}
          onClick={(e) => e.stopPropagation()}
        >
          {items.map((item, idx) => (
            <React.Fragment key={item.label}>
              {item.dividerBefore && (
                <div className="my-1.5 mx-1.5 border-t border-slate-100" role="separator" />
              )}
              <button
                ref={(el) => {
                  itemRefs.current[idx] = el;
                }}
                type="button"
                role="menuitem"
                onKeyDown={(e) => handleMenuKeyDown(e, idx)}
                onClick={() => {
                  setOpen(false);
                  triggerRef.current?.focus();
                  item.onClick();
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 sm:py-2 rounded-lg text-left text-xs font-medium transition-colors duration-micro focus-visible:outline-none ${
                  item.variant === "danger"
                    ? "text-rose-600 hover:bg-rose-50 focus-visible:bg-rose-50"
                    : "text-slate-700 hover:bg-[#EEF4FF] hover:text-[#0066FF] focus-visible:bg-[#EEF4FF] focus-visible:text-[#0066FF]"
                }`}
              >
                {item.icon && (
                  <span className="shrink-0 inline-flex" aria-hidden="true">
                    {item.icon}
                  </span>
                )}
                <span>{item.label}</span>
              </button>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

