import * as React from "react";
import { cn } from "../lib/cn";

/**
 * Renders content for screen readers only — visually hidden but still in the
 * accessibility tree (unlike display:none / visibility:hidden, which remove it).
 */
export const VisuallyHidden = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "absolute h-px w-px overflow-hidden whitespace-nowrap border-0 p-0",
      "[clip:rect(0,0,0,0)] [clip-path:inset(50%)]",
      className,
    )}
    {...props}
  />
));
VisuallyHidden.displayName = "VisuallyHidden";
