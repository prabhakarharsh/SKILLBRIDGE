import { forwardRef, ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { classNames } from "@/utils/helpers";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "yellow" | "mint" | "purple";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, fullWidth, disabled, children, leftIcon, rightIcon, ...props }, ref) => {
    const baseClasses = "brutal-btn inline-flex items-center justify-center font-display font-black uppercase tracking-wider rounded-2xl border-3 border-black transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variantClasses = {
      primary: "bg-black text-brutal-yellow hover:bg-brutal-electric hover:text-white",
      secondary: "bg-white text-black hover:bg-brutal-yellow",
      ghost: "bg-transparent text-black hover:bg-black/10 border-transparent shadow-none",
      danger: "bg-red-500 text-white hover:bg-red-600",
      yellow: "bg-brutal-yellow text-black hover:bg-brutal-yellow-dark",
      mint: "bg-brutal-mint text-black hover:bg-emerald-300",
      purple: "bg-brutal-purple text-black hover:bg-purple-300",
    };
    
    const sizeClasses = {
      sm: "px-3 py-1.5 text-xs gap-1.5",
      md: "px-5 py-2.5 text-xs sm:text-sm gap-2",
      lg: "px-8 py-3.5 text-sm sm:text-base gap-2.5",
    };

    return (
      <button
        ref={ref}
        className={classNames(baseClasses, variantClasses[variant], sizeClasses[size], fullWidth && "w-full", className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : leftIcon}
        {children}
        {!loading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";