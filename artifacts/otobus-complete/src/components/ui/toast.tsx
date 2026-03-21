import * as React from "react"

export interface ToastProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  open?: boolean
  onOpenChange?: (open: boolean) => void
  variant?: "default" | "destructive"
}
export type ToastActionElement = React.ReactElement

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, ...props }, ref) => <div ref={ref} className={className} 
    {...(props as any)} />
)
Toast.displayName = "Toast"
