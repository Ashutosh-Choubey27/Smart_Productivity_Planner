import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-3 w-full overflow-hidden rounded-full bg-secondary/30 backdrop-blur-sm border border-border/50 shadow-inner",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-gradient-to-r from-primary via-primary-hover to-primary rounded-full transition-all duration-1000 ease-out relative overflow-hidden shadow-sm"
      style={{ 
        transform: `translateX(-${100 - (value || 0)}%)`,
        boxShadow: value && value > 0 ? '0 0 8px hsl(var(--primary) / 0.4)' : 'none'
      }}
    >
      {value && value > 0 && (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_3s_infinite]" />
          <div className="absolute inset-0 bg-primary/10 animate-pulse" />
        </>
      )}
    </ProgressPrimitive.Indicator>
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
