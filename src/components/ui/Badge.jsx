import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-black text-white hover:bg-gray-800",
        secondary:
          "border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200",
        destructive:
          "border-transparent bg-red-500 text-white hover:bg-red-600",
        outline: "text-gray-600 border-border-light",
        yellow: "border-transparent bg-accent-yellow text-white hover:bg-yellow-600",
        blue: "border-transparent bg-accent-blue text-white hover:bg-blue-600",
        green: "border-transparent bg-accent-green text-white hover:bg-green-600",
        red: "border-transparent bg-accent-red text-white hover:bg-red-600",
        purple: "border-transparent bg-accent-purple text-white hover:bg-purple-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
