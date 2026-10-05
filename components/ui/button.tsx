import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-full border border-transparent bg-clip-padding font-medium whitespace-nowrap transition-[background-color,border-color,color,box-shadow,opacity,scale] duration-150 ease-out outline-none select-none focus-visible:ring-4 focus-visible:ring-ring active:not-aria-[haspopup]:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 aria-invalid:border-destructive aria-invalid:ring-4 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline:
          "border-input bg-card hover:bg-[color-mix(in_oklab,var(--card),var(--foreground)_5%)] aria-expanded:bg-[color-mix(in_oklab,var(--card),var(--foreground)_5%)] dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-foreground/10 aria-expanded:bg-foreground/10 dark:hover:bg-foreground/15",
        ghost:
          "hover:bg-muted aria-expanded:bg-muted",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        // 44px tall with 16px edge padding. The label carries its own 4px
        // inset (20px to the edge, 4px to an adjacent icon), so there's no
        // extra gap between text and icon. Icons are assumed to lead; a
        // trailing icon swaps the paddings at the call site.
        default:
          "h-11 gap-1 px-5 text-base has-[>svg]:pl-4 [&_svg:not([class*='size-'])]:size-5",
        xs: "h-7 gap-1 px-3 text-xs has-[>svg]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-9 gap-1 px-4 text-sm has-[>svg]:pl-3 [&_svg:not([class*='size-'])]:size-4",
        lg: "h-12 gap-1 px-6 text-base has-[>svg]:pl-5 [&_svg:not([class*='size-'])]:size-5",
        icon: "size-11 [&_svg:not([class*='size-'])]:size-6",
        "icon-xs": "size-7 [&_svg:not([class*='size-'])]:size-4",
        "icon-sm": "size-9 [&_svg:not([class*='size-'])]:size-5",
        "icon-lg": "size-12 [&_svg:not([class*='size-'])]:size-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
