"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & { variant?: "pill" | "underline" }
>(({ className, variant = "pill", ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex items-center text-muted",
      variant === "pill" ? "h-9 gap-0.5 rounded-lg border border-border bg-background-subtle p-1" : "h-10 gap-4 border-b border-border w-full justify-start",
      className,
    )}
    data-variant={variant}
    {...props}
  />
));
TabsList.displayName = "TabsList";

const TabsTrigger = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Trigger>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>>(
  ({ className, ...props }, ref) => (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4",
        // pill
        "group-data-[variant=pill]/tabs:rounded-md rounded-md px-3 py-1 data-[state=active]:bg-surface-2 data-[state=active]:text-foreground data-[state=active]:shadow-sm hover:text-foreground",
        // underline (applied via parent data attr)
        "[[data-variant=underline]_&]:rounded-none [[data-variant=underline]_&]:px-1 [[data-variant=underline]_&]:pb-2.5 [[data-variant=underline]_&]:h-10 [[data-variant=underline]_&]:border-b-2 [[data-variant=underline]_&]:border-transparent [[data-variant=underline]_&]:data-[state=active]:border-primary [[data-variant=underline]_&]:data-[state=active]:bg-transparent [[data-variant=underline]_&]:data-[state=active]:shadow-none",
        className,
      )}
      {...props}
    />
  ),
);
TabsTrigger.displayName = "TabsTrigger";

const TabsContent = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Content>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>>(
  ({ className, ...props }, ref) => <TabsPrimitive.Content ref={ref} className={cn("mt-4 focus-visible:outline-none animate-fade-in", className)} {...props} />,
);
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
