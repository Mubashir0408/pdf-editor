"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
        gradient:
          "bg-gradient-to-r from-primary to-secondary text-white shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/25",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-border bg-transparent hover:bg-muted text-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/90",
        ghost: "hover:bg-muted text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-lg px-6 text-base",
        icon: "h-9 w-9 shrink-0",
        "icon-sm": "h-7 w-7 shrink-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  ripple?: boolean;
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  ripple = true,
  onClick,
  children,
  ...props
}: ButtonProps) {
  const [ripples, setRipples] = React.useState<
    { id: number; x: number; y: number; size: number }[]
  >([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (ripple && !asChild) {
      const rect = e.currentTarget.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 1.6;
      const id = Date.now();
      setRipples((prev) => [
        ...prev,
        { id, x: e.clientX - rect.left - size / 2, y: e.clientY - rect.top - size / 2, size },
      ]);
      setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 600);
    }
    onClick?.(e);
  };

  if (asChild) {
    return (
      <Slot
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        onClick={onClick}
        {...props}
      >
        {children}
      </Slot>
    );
  }

  return (
    <button
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      onClick={handleClick}
      {...props}
    >
      {children}
      {ripple && (
        <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
          {ripples.map((r) => (
            <motion.span
              key={r.id}
              initial={{ opacity: 0.35, scale: 0 }}
              animate={{ opacity: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute rounded-full bg-white/60"
              style={{ left: r.x, top: r.y, width: r.size, height: r.size }}
            />
          ))}
        </span>
      )}
    </button>
  );
}

export { Button, buttonVariants };
