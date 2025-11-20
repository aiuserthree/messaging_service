import { ReactNode } from "react";
import { cn } from "@/utils/cn";
import { AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";

export interface AlertProps {
  variant?: "info" | "success" | "warning" | "error";
  children: ReactNode;
  className?: string;
}

export function Alert({ variant = "info", children, className }: AlertProps) {
  const variants = {
    info: "bg-blue-50 border-blue-200 text-blue-800",
    success: "bg-green-50 border-green-200 text-green-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    error: "bg-red-50 border-red-200 text-red-800",
  };

  const icons = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    error: AlertCircle,
  };

  const Icon = icons[variant];

  return (
    <div
      className={cn(
        "border rounded-lg p-4 flex items-start gap-3",
        variants[variant],
        className
      )}
    >
      <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
      <div className="flex-1">{children}</div>
    </div>
  );
}

