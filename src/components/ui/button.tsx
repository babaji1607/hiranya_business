import * as React from "react"
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 bg-zinc-900 text-zinc-50 shadow hover:bg-zinc-900/90 h-9 px-4 py-2 ${className}`}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"
export { Button }
