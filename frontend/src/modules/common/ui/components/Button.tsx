import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/utils/cn";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

    const variants = {
      primary:
        "bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-600",
      secondary:
        "bg-secondary-200 text-secondary-900 hover:bg-secondary-300 focus-visible:ring-secondary-600",
      danger:
        "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600",
      outline:
        "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus-visible:ring-gray-600",
      ghost: "hover:bg-gray-100 text-gray-700 focus-visible:ring-gray-600",
    };

    const sizes = {
      sm: "h-8 px-3 text-sm",
      md: "h-10 px-4 text-base",
      lg: "h-12 px-6 text-lg",
    };

    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };

