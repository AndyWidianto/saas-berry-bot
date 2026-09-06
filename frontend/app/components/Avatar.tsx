
"use client";

import * as React from "react";
import cn from "./ClassName";

// export const Avatar = ({ initials, color, size = "md", online }: { initials: string; color: string; size?: "sm" | "md" | "lg"; online?: boolean }) => {
//   const sizes = { sm: "w-7 h-7 text-xs", md: "w-9 h-9 text-sm", lg: "w-12 h-12 text-base" };
//   return (
//     <div className="relative flex-shrink-0">
//       <div className={cn("rounded-full flex items-center justify-center font-semibold text-white", sizes[size])} style={{ backgroundColor: color }}>
//         {initials}
//       </div>
//       {online !== undefined && (
//         <span className={cn("absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900", online ? "bg-emerald-500" : "bg-slate-300")} />
//       )}
//     </div>
//   );
// };

// Context untuk berbagi state error antara Avatar & AvatarImage
const AvatarContext = React.createContext<{
  hasError: boolean;
  setHasError: (value: boolean) => void;
}>({
  hasError: false,
  setHasError: () => {},
});

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, children, ...props }, ref) => {
    const [hasError, setHasError] = React.useState(false);

    return (
      <AvatarContext.Provider value={{ hasError, setHasError }}>
        <div
          ref={ref}
          className={cn(
            "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </AvatarContext.Provider>
    );
  }
);
Avatar.displayName = "Avatar";

interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, src, alt, onError, ...props }, ref) => {
    const { hasError, setHasError } = React.useContext(AvatarContext);

    // Jangan render gambar jika URL kosong atau terjadi error
    if (!src || hasError) return null;

    return (
      <img
        ref={ref}
        src={src}
        alt={alt || "Avatar"}
        onError={(e) => {
          setHasError(true);
          if (onError) onError(e);
        }}
        className={cn("aspect-square h-full w-full object-cover", className)}
        {...props}
      />
    );
  }
);
AvatarImage.displayName = "AvatarImage";

interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {}

const AvatarFallback = React.forwardRef<HTMLDivElement, AvatarFallbackProps>(
  ({ className, children, ...props }, ref) => {
    const { hasError } = React.useContext(AvatarContext);

    return (
      <div
        ref={ref}
        className={cn(
          "flex h-full w-full items-center justify-center rounded-full bg-muted text-xs font-medium",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback };