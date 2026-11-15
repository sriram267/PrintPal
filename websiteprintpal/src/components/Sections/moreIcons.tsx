/* A few more stroke icons in the same lucide-style as Hero/icons.tsx. */

type P = { size?: number; className?: string; strokeWidth?: number };

const base = (size: number, strokeWidth = 1.8) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

export const IconPin = ({ size = 14, className, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
export const IconGlobe = ({ size = 14, className, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);
export const IconDownload = ({ size = 14, className, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
  </svg>
);
export const IconCheck = ({ size = 14, className, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
export const IconCalendar = ({ size = 14, className, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);
