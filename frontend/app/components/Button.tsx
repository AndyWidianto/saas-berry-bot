
import cn from "./ClassName";

export const Btn = ({ children, variant = "primary", size = "md", onClick, className, icon: Icon, disabled, type }: {
  children?: React.ReactNode; variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md"; onClick?: () => void; className?: string; icon?: React.ElementType;
  type?: "button" | "submit" | "reset",
  disabled?: boolean;
}) => {
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border",
    ghost: "hover:bg-muted text-foreground",
    danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline: "border border-border bg-transparent hover:bg-muted text-foreground",
  };
  const sizes = { sm: "h-8 px-3 text-xs gap-1.5", md: "h-9 px-4 text-sm gap-2" };
  return (
    <button onClick={onClick} type={type} disabled={disabled} className={cn("inline-flex items-center font-medium rounded-lg transition-colors duration-150", variants[variant], sizes[size], className)}>
      {Icon && <Icon className={size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"} />}
      {children}
    </button>
  );
};

export const LinkHref = ({ children, variant = "primary", size = "md", href, className, icon: Icon, disabled }: {
  children?: React.ReactNode; variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md"; href: string; className?: string; icon?: React.ElementType;
  disabled?: boolean;
}) => {
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border",
    ghost: "hover:bg-muted text-foreground",
    danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline: "border border-border bg-transparent hover:bg-muted text-foreground",
  };
  const sizes = { sm: "h-8 px-3 text-xs gap-1.5", md: "h-9 px-4 text-sm gap-2" };
  return (
    <a href={href} className={cn("inline-flex items-center font-medium rounded-lg transition-colors duration-150", variants[variant], sizes[size], className)}>
      {Icon && <Icon className={size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"} />}
      {children}
    </a>
  );
};