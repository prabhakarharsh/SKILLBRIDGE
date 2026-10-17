import { HTMLAttributes, forwardRef } from "react";
import { classNames } from "@/utils/helpers";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "success" | "warning" | "accent" | "outline";
  size?: "sm" | "md";
  dot?: boolean;
  dotColor?: string;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", size = "md", dot, dotColor, children, ...props }, ref) => {
    const variantClasses = {
      default: "bg-white text-black border-2 border-black",
      primary: "bg-brutal-yellow text-black border-2 border-black",
      success: "bg-brutal-mint text-black border-2 border-black",
      warning: "bg-brutal-orange text-black border-2 border-black",
      accent: "bg-brutal-pink text-black border-2 border-black",
      outline: "bg-white text-black border-2 border-black",
    };

    const sizeClasses = {
      sm: "px-2 py-0.5 text-[11px]",
      md: "px-2.5 py-1 text-xs",
    };

    return (
      <span
        ref={ref}
        className={classNames(
          "inline-flex items-center gap-1.5 rounded-xl font-display font-black uppercase brutal-shadow-sm",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {dot && <span className={classNames("w-2 h-2 rounded-full border border-black", dotColor || "bg-emerald-500")} />}
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

export const SkillTag = ({ 
  children, 
  removable, 
  onRemove, 
  variant = "default",
  size = "md",
  className 
}: { 
  children: React.ReactNode; 
  removable?: boolean; 
  onRemove?: () => void;
  variant?: "default" | "primary" | "success" | "warning" | "accent";
  size?: "sm" | "md";
  className?: string;
}) => {
  const variantClasses = {
    default: "bg-white text-black border-2 border-black",
    primary: "bg-brutal-yellow text-black border-2 border-black",
    success: "bg-brutal-mint text-black border-2 border-black",
    warning: "bg-brutal-purple text-black border-2 border-black",
    accent: "bg-brutal-pink text-black border-2 border-black",
  };

  const sizeClasses = {
    sm: "px-2.5 py-1 text-[11px]",
    md: "px-3 py-1.5 text-xs",
  };

  return (
    <span className={classNames(
      "inline-flex items-center gap-1.5 rounded-xl font-display font-black uppercase brutal-shadow-sm transition-transform hover:scale-105",
      variantClasses[variant],
      sizeClasses[size],
      removable && "pr-1.5",
      className
    )}>
      {children}
      {removable && (
        <button
          onClick={onRemove}
          className="ml-1 p-0.5 rounded hover:text-red-600 transition-colors"
          aria-label="Remove"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
};