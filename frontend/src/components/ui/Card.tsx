import { HTMLAttributes, forwardRef } from "react";
import { classNames } from "@/utils/helpers";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "hover" | "interactive";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const variantClasses = {
      default: "bg-white rounded-3xl border-4 border-black brutal-shadow",
      hover: "bg-white rounded-3xl border-4 border-black brutal-shadow transition-transform hover:-translate-y-1 hover:brutal-shadow-lg",
      interactive: "bg-white rounded-3xl border-4 border-black brutal-shadow transition-transform hover:-translate-y-1 hover:brutal-shadow-lg cursor-pointer",
    };

    return (
      <div
        ref={ref}
        className={classNames(variantClasses[variant], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={classNames("px-6 py-4 border-b-3 border-black", className)} {...props}>
      {children}
    </div>
  )
);

CardHeader.displayName = "CardHeader";

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={classNames("p-6", className)} {...props}>
      {children}
    </div>
  )
);

CardContent.displayName = "CardContent";

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={classNames("px-6 py-4 border-t-3 border-black bg-[#fffdf0] rounded-b-3xl", className)} {...props}>
      {children}
    </div>
  )
);

CardFooter.displayName = "CardFooter";