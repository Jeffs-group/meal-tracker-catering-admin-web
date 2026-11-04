/**
 * Design Tokens for Jeffs Group - Meal Tracker Admin Portal
 */

export const TOKENS = {
  colors: {
    primary: {
      DEFAULT: "#C9A227", // Mustard / Gold
      hover: "#B8901E",
      light: "#FAF4E6",
      border: "#ECD59A",
    },
    sidebar: {
      bg: "#111111",
      hover: "#1C1C1C",
      active: "#242424",
      border: "#282828",
      text: "#9CA3AF",
      textActive: "#FFFFFF",
    },
    background: "#F8F9FA",
    card: "#FFFFFF",
    border: "#E5E7EB",
    status: {
      approved: {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        dot: "bg-emerald-500",
      },
      pending: {
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
        dot: "bg-amber-500",
      },
      rejected: {
        bg: "bg-rose-50",
        text: "text-rose-700",
        border: "border-rose-200",
        dot: "bg-rose-500",
      },
      active: {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        dot: "bg-emerald-500",
      },
      inactive: {
        bg: "bg-slate-100",
        text: "text-slate-600",
        border: "border-slate-200",
        dot: "bg-slate-400",
      },
    },
  },
  typography: {
    fontSans: "font-sans",
    fontMono: "font-mono",
    scale: {
      pageTitle: "text-[clamp(24px,2vw+16px,32px)] font-bold tracking-tight leading-[1.25]",
      sectionTitle: "text-xl sm:text-2xl font-bold tracking-tight leading-[1.3]",
      dialogTitle: "text-base sm:text-lg font-bold leading-tight",
      body: "text-sm leading-[1.5]",
      caption: "text-xs leading-[1.4] text-slate-500",
      labelUpper: "text-xs font-bold uppercase tracking-[0.06em]",
      statNumber: "text-2xl sm:text-3xl font-bold tracking-tight leading-none",
      codeId: "font-mono text-xs font-semibold tracking-wide",
    },
  },
} as const;
