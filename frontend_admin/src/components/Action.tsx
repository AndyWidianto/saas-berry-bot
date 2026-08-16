

export function ActionBtn({ children, onClick, variant = "ghost", size = "sm", className, disabled = false, title }: {
  children: React.ReactNode; onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void; variant?: "ghost" | "primary" | "danger"; size?: "sm" | "xs",
  className?: string,
  disabled?: boolean,
  title?: string
}) {
  const base = "inline-flex items-center gap-1.5 font-medium rounded-lg transition-colors cursor-pointer border-0 outline-none"
  const sizes: Record<string, string> = { sm: "px-3 py-1.5 text-xs", xs: "px-2 py-1 text-[11px]" }
  const variants: Record<string, string> = {
    ghost: "bg-white/0 hover:bg-white/5 text-white/60 hover:text-white/90",
    primary: "bg-violet-600 hover:bg-violet-500 text-white",
    danger: "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400",
  }
  return (
    <button onClick={onClick} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} disabled={disabled}>
      {title}{children}
    </button>
  )
}