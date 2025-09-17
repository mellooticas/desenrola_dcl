import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils/cn"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Status variants for DCL
        registrado: "border-transparent bg-slate-400 text-white",
        aguardando: "border-transparent bg-amber-500 text-white",
        pago: "border-transparent bg-emerald-500 text-white",
        producao: "border-transparent bg-blue-500 text-white",
        pronto: "border-transparent bg-violet-500 text-white",
        enviado: "border-transparent bg-red-500 text-white",
        chegou: "border-transparent bg-cyan-500 text-white",
        entregue: "border-transparent bg-emerald-500 text-white",
        cancelado: "border-transparent bg-gray-500 text-white",
        // Priority variants
        baixa: "border-transparent bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        normal: "border-transparent bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
        alta: "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
        urgente: "border-transparent bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        // Alert variants
        warning: "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
        success: "border-transparent bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        error: "border-transparent bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }