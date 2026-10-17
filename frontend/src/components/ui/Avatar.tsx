import { HTMLAttributes, forwardRef } from "react";
import { classNames, getInitials } from "@/utils/helpers";

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  verified?: boolean;
  src?: string;
  className?: string;
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ name, size = "md", verified, src, className, ...props }, ref) => {
    const sizeClasses = {
      sm: "w-8 h-8 text-xs",
      md: "w-10 h-10 text-sm",
      lg: "w-14 h-14 text-base",
      xl: "w-20 h-20 text-xl",
    };

    const colors = [
      "bg-brutal-yellow",
      "bg-brutal-mint",
      "bg-brutal-purple",
      "bg-brutal-pink",
      "bg-brutal-blue",
    ];
    const charCode = name ? name.charCodeAt(0) + name.length : 0;
    const brutalBg = colors[charCode % colors.length];

    if (src) {
      return (
        <div
          ref={ref}
          className={classNames(
            "relative inline-flex items-center justify-center rounded-2xl border-3 border-black brutal-shadow-sm overflow-hidden",
            sizeClasses[size],
            className
          )}
          {...props}
        >
          <img src={src} alt={name} className="w-full h-full object-cover" />
          {verified && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-black" />
          )}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={classNames(
          "relative inline-flex items-center justify-center rounded-2xl border-3 border-black brutal-shadow-sm font-display font-black text-black uppercase select-none transition-transform hover:scale-105",
          sizeClasses[size],
          brutalBg,
          className
        )}
        {...props}
      >
        {getInitials(name)}
        {verified && (
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border border-black" />
        )}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";

export const AvatarGroup = ({ 
  avatars, 
  max = 4, 
  size = "md", 
  className 
}: { 
  avatars: Array<{ name: string; verified?: boolean; src?: string }>; 
  max?: number; 
  size?: "sm" | "md" | "lg";
  className?: string;
}) => {
  const visible = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <div className={classNames("flex -space-x-2", className)}>
      {visible.map((avatar, index) => (
        <Avatar key={index} name={avatar.name} size={size} verified={avatar.verified} src={avatar.src} />
      ))}
      {remaining > 0 && (
        <div className={classNames(
          "inline-flex items-center justify-center rounded-2xl font-display font-black border-2 border-black bg-white text-black",
          size === "sm" && "w-8 h-8 text-xs",
          size === "md" && "w-10 h-10 text-sm",
          size === "lg" && "w-14 h-14 text-base",
        )}>
          +{remaining}
        </div>
      )}
    </div>
  );
};