import React from "react";
import Link from "next/link";

type StatTone = "blue" | "yellow" | "red";

type StatCardProps = {
  label: string;
  value: number;
  description: string;
  tone: StatTone;
} & (
  | { href: string }
  | { isActive: boolean; onClick: () => void }
);

const toneStyles: Record<
  StatTone,
  { value: string; fill: string; accent: string; hover: string; active: string }
> = {
  blue: {
    value: "text-[#0066FF]",
    fill: "#0066FF",
    accent: "#0052CC",
    hover: "hover:border-blue-200",
    active: "border-[#0066FF] ring-2 ring-[#0066FF]/15",
  },
  yellow: {
    value: "text-[#EAB308]",
    fill: "#FFE600",
    accent: "#FACC15",
    hover: "hover:border-amber-200",
    active: "border-[#EAB308] ring-2 ring-[#FFE600]/40",
  },
  red: {
    value: "text-rose-600",
    fill: "#E11D48",
    accent: "#BE123C",
    hover: "hover:border-rose-200",
    active: "border-rose-500 ring-2 ring-rose-500/15",
  },
};

const cardBase =
  "group relative block overflow-hidden rounded-2xl bg-white p-5 border transition-all";

function PixelCorner({ fill, accent }: { fill: string; accent: string }) {
  return (
    <svg
      width="54"
      height="54"
      viewBox="0 0 54 54"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute bottom-0 right-0 pointer-events-none select-none"
      aria-hidden="true"
    >
      <rect x="36" y="0" width="18" height="36" fill={fill} />
      <rect x="0" y="36" width="36" height="18" fill={fill} />
      <rect x="36" y="36" width="18" height="18" fill={accent} fillOpacity="0.2" />
    </svg>
  );
}

export const StatCard: React.FC<StatCardProps> = (props) => {
  const { label, value, description, tone } = props;
  const styles = toneStyles[tone];

  const content = (
    <>
      <div className="text-xs font-semibold text-slate-600">{label}</div>
      <div
        className={`mt-3 text-4xl font-extrabold tracking-tight ${styles.value}`}
      >
        {value}
      </div>
      <div className="mt-1 pr-10 text-[11px] text-slate-400">{description}</div>
      <PixelCorner fill={styles.fill} accent={styles.accent} />
    </>
  );

  if ("href" in props) {
    return (
      <Link
        href={props.href}
        className={`${cardBase} border-slate-200/70 hover:border-blue-200`}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={props.onClick}
      aria-pressed={props.isActive}
      className={`${cardBase} w-full text-left ${
        props.isActive ? styles.active : `border-slate-200/70 ${styles.hover}`
      }`}
    >
      {content}
    </button>
  );
};
