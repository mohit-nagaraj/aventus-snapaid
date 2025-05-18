import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "neutral" | "info" | "primary" | "secondary" | "tertiary";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        variant === "default" && "bg-purple-100 text-purple-800",
        variant === "success" && "bg-green-100 text-green-800",
        variant === "warning" && "bg-yellow-100 text-yellow-800",
        variant === "danger" && "bg-red-100 text-red-800",
        variant === "info" && "bg-blue-100 text-blue-800",
        variant === "primary" && "bg-blue-100 text-blue-800",
        variant === "secondary" && "bg-indigo-100 text-indigo-800",
        variant === "tertiary" && "bg-gray-100 text-gray-800",
        variant === "neutral" && "bg-gray-100 text-gray-800",
        className
      )}
    >
      {children}
    </span>
  );
}