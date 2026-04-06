import { cn } from "@/lib/utils";

interface CalcButtonProps {
  children: React.ReactNode;
  variant?: "number" | "operator" | "function";
  active?: boolean;
  className?: string;
  onClick?: () => void;
}

export const CalcButton = ({
  children,
  variant = "number",
  active = false,
  className,
  onClick,
}: CalcButtonProps) => {
  const base = "h-16 rounded-2xl text-xl font-medium transition-all duration-150 active:animate-press select-none";

  const variants = {
    number: "bg-btn-number text-btn-number-foreground hover:brightness-125",
    operator: cn(
      "text-btn-operator-foreground hover:brightness-110",
      active ? "bg-btn-operator-foreground text-btn-operator" : "bg-btn-operator"
    ),
    function: "bg-btn-function text-btn-function-foreground hover:brightness-125",
  };

  return (
    <button
      className={cn(base, variants[variant], className)}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
