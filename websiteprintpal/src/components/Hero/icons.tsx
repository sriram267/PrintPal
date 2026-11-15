/* Stroke icons drawn like lucide-react (the product's icon set), so the rebuilt screen matches it. */

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

export const IconUsers = ({ size = 18, className, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
export const IconReceipt = ({ size = 18, className, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
    <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8M12 17.5v-11" />
  </svg>
);
export const IconChart = ({ size = 18, className, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <path d="M3 3v18h18" />
    <path d="M18 17V9M13 17V5M8 17v-3" />
  </svg>
);
export const IconSettings = ({ size = 18, className, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
export const IconSearch = ({ size = 16, className, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);
export const IconX = ({ size = 16, className, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);
export const IconUser = ({ size = 16, className, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
export const IconPhone = ({ size = 16, className, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);
export const IconEdit = ({ size = 16, className, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);
export const IconTrash = ({ size = 16, className, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);
export const IconChevronDown = ({ size = 16, className, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);
export const IconChevronUp = ({ size = 16, className, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <path d="m18 15-6-6-6 6" />
  </svg>
);
export const IconChevronRight = ({ size = 14, className, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <path d="m9 18 6-6-6-6" />
  </svg>
);
export const IconPlus = ({ size = 14, className, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
export const IconInfo = ({ size = 14, className, strokeWidth }: P) => (
  <svg {...base(size, strokeWidth)} className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4M12 8h.01" />
  </svg>
);
