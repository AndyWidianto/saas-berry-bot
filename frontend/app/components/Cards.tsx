
import { Ref } from "react";
import cn from "./ClassName";
import { TrendingUp, TrendingDown } from "lucide-react";



interface CardProps { 
  children: React.ReactNode; 
  className?: string;
  onClick?: () => void;
  ref?: Ref<HTMLDivElement> | undefined
}
export const Card = ({ children, className, onClick, ref }: CardProps) => (
  <div ref={ref} className={cn("bg-card border border-border rounded-xl shadow-sm", className)} onClick={onClick}>
    {children}
  </div>
);
export const StatCard = ({ title, value, change, positive, icon: Icon, color, subtitle }: {
  title: string; value: string; change: string; positive: boolean;
  icon: React.ElementType; color: string; subtitle?: string;
}) => (
  <Card className="p-5 hover:shadow-md transition-shadow duration-200">
    <div className="flex items-start justify-between mb-4">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <span className={cn("flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full", positive ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400")}>
        {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {change}
      </span>
    </div>
    <div className="text-2xl font-bold text-foreground mb-1">{value}</div>
    <div className="text-sm text-muted-foreground">{title}</div>
    {subtitle && <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>}
  </Card>
);