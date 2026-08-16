"use client";
import cn from "./ClassName";
import React from "react";


export type BadgeVariant =
  | "default"
  | "secondary"
  | "outline"
  | "ghost"
  | "success"
  | "warning"
  | "danger"
  | "destructive"
  | "info"
  | "purple"
  // Varian Outline Berwarna
  | "success-outline"
  | "warning-outline"
  | "danger-outline"
  | "info-outline"
  | "purple-outline";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export const Badge = ({
  children,
  variant = "default",
  className,
  ...props
}: BadgeProps) => {
  const variants: Record<BadgeVariant, string> = {
    // Varian Netral & Standar
    default:
      "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700",
    secondary:
      "bg-slate-200/60 text-slate-700 dark:bg-slate-700/50 dark:text-slate-200 border border-slate-300/30 dark:border-slate-600/30",
    outline:
      "border border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300 bg-transparent",
    ghost:
      "bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800",

    // Varian Berwarna (Solid / Soft Fill)
    success:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40",
    warning:
      "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40",
    danger:
      "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200/60 dark:border-red-800/40",
    destructive:
      "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200/60 dark:border-red-800/40", // Alias untuk danger
    info:
      "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40",
    purple:
      "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400 border border-violet-200/60 dark:border-violet-800/40",

    // Varian Outline Berwarna (Border saja tanpa Background)
    "success-outline":
      "border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-transparent",
    "warning-outline":
      "border border-amber-500/40 text-amber-600 dark:text-amber-400 bg-transparent",
    "danger-outline":
      "border border-red-500/40 text-red-600 dark:text-red-400 bg-transparent",
    "info-outline":
      "border border-blue-500/40 text-blue-600 dark:text-blue-400 bg-transparent",
    "purple-outline":
      "border border-violet-500/40 text-violet-600 dark:text-violet-400 bg-transparent",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors whitespace-nowrap select-none",
        variants[variant] || variants.default,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};