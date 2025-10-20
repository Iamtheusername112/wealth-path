"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action,
  actionLabel,
  className 
}) {
  return (
    <div className={cn("text-center py-12 px-4", className)}>
      <div className="mx-auto max-w-md">
        {Icon && (
          <div className="mb-6">
            <div className="mx-auto h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center">
              <Icon className="h-10 w-10 text-muted-foreground/70" />
            </div>
          </div>
        )}
        
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        
        {description && (
          <p className="text-muted-foreground mb-6">{description}</p>
        )}
        
        {action && actionLabel && (
          <Button onClick={action} size="lg" className="mt-2">
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  )
}

