import cn from "./ClassName";

export const Avatar = ({ initials, color, size = "md", online }: { initials: string; color: string; size?: "sm" | "md" | "lg"; online?: boolean }) => {
  const sizes = { sm: "w-7 h-7 text-xs", md: "w-9 h-9 text-sm", lg: "w-12 h-12 text-base" };
  return (
    <div className="relative flex-shrink-0">
      <div className={cn("rounded-full flex items-center justify-center font-semibold text-white", sizes[size])} style={{ backgroundColor: color }}>
        {initials}
      </div>
      {online !== undefined && (
        <span className={cn("absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900", online ? "bg-emerald-500" : "bg-slate-300")} />
      )}
    </div>
  );
};