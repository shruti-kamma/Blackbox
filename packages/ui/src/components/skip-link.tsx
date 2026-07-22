import * as React from "react";
import { cn } from "../lib/cn";

/**
 * "Skip to main content" link. Hidden until focused, so keyboard/screen-reader
 * users can bypass repeated nav and jump straight to page content.
 * Usage: place as the first element in <body>/layout, pointing at the id of
 * the page's main landmark, e.g. <SkipLink href="#main-content" />.
 */
export const SkipLink = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement>
>(({ className, children = "Skip to main content", ...props }, ref) => (
  <a
    ref={ref}
    className={cn(
      "sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50",
      "focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground",
      className,
    )}
    {...props}
  >
    {children}
  </a>
));
SkipLink.displayName = "SkipLink";
