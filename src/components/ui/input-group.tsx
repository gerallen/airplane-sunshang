import * as React from "react"

import { cn } from "@/lib/utils"

function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group"
      className={cn(
        "flex items-center rounded-md border border-input bg-background focus-within:ring-1 focus-within:ring-ring",
        className
      )}
      {...props}
    />
  )
}

function InputGroupText({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group-text"
      className={cn(
        "flex items-center px-3 text-sm text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

export { InputGroup, InputGroupText }
