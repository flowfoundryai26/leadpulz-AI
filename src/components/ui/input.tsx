import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  invalid?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, leftIcon, rightIcon, invalid, ...props }, ref) => {
  const base = (
    <input
      type={type}
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        "flex h-9 w-full rounded-lg border border-border bg-background-subtle px-3 py-1 text-sm text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] transition-colors placeholder:text-faint",
        "focus-visible:outline-none focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/25",
        "disabled:cursor-not-allowed disabled:opacity-50 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        invalid && "border-danger/60 focus-visible:border-danger focus-visible:ring-danger/25",
        leftIcon && "pl-9",
        rightIcon && "pr-9",
        className,
      )}
      {...props}
    />
  );
  if (!leftIcon && !rightIcon) return base;
  return (
    <div className="relative w-full">
      {leftIcon ? <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted [&_svg]:size-4">{leftIcon}</span> : null}
      {base}
      {rightIcon ? <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted [&_svg]:size-4">{rightIcon}</span> : null}
    </div>
  );
});
Input.displayName = "Input";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }>(
  ({ className, invalid, ...props }, ref) => (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        "flex min-h-[90px] w-full rounded-lg border border-border bg-background-subtle px-3 py-2 text-sm text-foreground transition-colors placeholder:text-faint",
        "focus-visible:outline-none focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-50",
        invalid && "border-danger/60",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

export { Input, Textarea };
