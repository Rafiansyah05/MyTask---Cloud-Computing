"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { MoreVertical } from "lucide-react";

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
        className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] sm:min-h-[34px] sm:min-w-[34px] p-1.5 rounded-control border border-line bg-surface-raised text-ink-700 hover:border-ink-300 hover:text-ink-900 transition-[background-color,border-color,color] duration-micro ease-editorial focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
      >
        <MoreVertical className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          className={`absolute ${
            align === "right" ? "right-0" : "left-0"
          } mt-1.5 w-44 rounded-card border border-line bg-surface shadow-float py-1 z-30 animate-dropdown-in`}
          onClick={(e) => e.stopPropagation()}
        >
          {items.map((item, idx) => (
            <React.Fragment key={item.label}>
              {item.dividerBefore && (
                <div className="my-1 border-t border-line" role="separator" />
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
                  item.onClick();
                }}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 sm:py-2 text-left text-small font-medium transition-colors duration-micro focus-visible:outline-none ${
                  item.variant === "danger"
                    ? "text-danger hover:bg-danger-soft focus-visible:bg-danger-soft"
                    : "text-ink-700 hover:bg-paper hover:text-ink-900 focus-visible:bg-paper focus-visible:text-ink-900"
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

