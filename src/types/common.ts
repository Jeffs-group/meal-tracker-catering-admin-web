import type { ReactNode } from "react";

export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
}

export type StatusVariant =
  "primary" | "secondary" | "success" | "warning" | "danger" | "info";

export type SizeVariant = "xs" | "sm" | "md" | "lg" | "xl";
