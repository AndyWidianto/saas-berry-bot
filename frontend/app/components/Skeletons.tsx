"use client";
import { Card } from './Cards';
import cn from './ClassName';



export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted/60", className)}
      {...props}
    />
  )
}



export function IntegrationCardSkeleton() {
  return (
    <Card className="p-5 border-border/80 rounded-2xl flex flex-col justify-between h-[156px]">
      <div className="flex items-start gap-3.5">
        {/* Placeholder Icon */}
        <Skeleton className="w-11 h-11 rounded-xl flex-shrink-0" />
        
        <div className="flex-1 min-w-0 space-y-2">
          {/* Placeholder Title & Badge */}
          <div className="flex items-center justify-between gap-2">
            <Skeleton className="h-4 w-32 rounded-md" />
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>
          {/* Placeholder Subtext / Description */}
          <Skeleton className="h-3 w-24 rounded-md" />
        </div>
      </div>

      {/* Placeholder Footer / Action Button */}
      <div className="pt-3 border-t border-border/40 flex items-center gap-2">
        <Skeleton className="h-8 w-full rounded-xl" />
      </div>
    </Card>
  );
}
