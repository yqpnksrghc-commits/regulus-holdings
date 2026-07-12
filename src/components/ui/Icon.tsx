import type { IconKey } from "@/lib/platform";

/**
 * Domain icon library — minimal, single-weight line illustrations drawn on a
 * 24×24 grid with `currentColor`, so they inherit text color and theme. No
 * external icon dependency; every mark is authored for Regulus.
 */
const paths: Record<IconKey, React.ReactNode> = {
  corporate: (
    <>
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="9" y="14" width="6" height="6" rx="1" />
      <path d="M7 10v2a2 2 0 0 0 2 2h0m8-4v2a2 2 0 0 1-2 2h0" />
    </>
  ),
  financial: (
    <>
      <path d="M4 19V5" />
      <path d="M4 15l5-4 4 3 7-7" />
      <path d="M15 7h5v5" />
    </>
  ),
  knowledge: (
    <>
      <circle cx="6" cy="6" r="2" />
      <circle cx="18" cy="7" r="2" />
      <circle cx="12" cy="17" r="2" />
      <path d="M7.6 7.4 10.5 15m3-.2L16.6 8.7M8 6.5h8" />
    </>
  ),
  psychological: (
    <>
      <path d="M12 4a5 5 0 0 0-5 5c0 1.6.7 2.6 1.5 3.5.7.8 1 1.4 1 2.5v1h5v-1c0-1.1.3-1.7 1-2.5C16.3 11.6 17 10.6 17 9a5 5 0 0 0-5-5Z" />
      <path d="M10 18h4m-3.5 2h3" />
    </>
  ),
  decision: (
    <>
      <path d="M12 3v4" />
      <path d="M12 7 6 12v3m6-8 6 5v3" />
      <circle cx="6" cy="17" r="2" />
      <circle cx="18" cy="17" r="2" />
      <circle cx="12" cy="4" r="1.4" />
    </>
  ),
  automation: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1m0-12.8-2.1 2.1M7.7 16.3l-2.1 2.1" />
    </>
  ),
  infrastructure: (
    <>
      <path d="M4 20V9l8-5 8 5v11" />
      <path d="M4 20h16M9 20v-5h6v5M9 11h.01M15 11h.01" />
    </>
  ),
  energy: (
    <>
      <path d="M13 3 5 13h5l-1 8 8-11h-5l1-7Z" />
    </>
  ),
  material: (
    <>
      <path d="M12 3 4 7.5v9L12 21l8-4.5v-9L12 3Z" />
      <path d="M4 7.5 12 12l8-4.5M12 12v9" />
    </>
  ),
  discovery: (
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-4.3-4.3" />
      <path d="M11 8v6M8 11h6" />
    </>
  ),
};

export function Icon({
  name,
  className,
  size = 24,
}: {
  name: IconKey;
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {paths[name]}
    </svg>
  );
}
