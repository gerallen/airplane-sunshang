import { cn } from "@/lib/utils"

function Spinner({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="spinner"
      className={cn(
        "border-4 border-current border-t-transparent rounded-full animate-spin",
        className
      )}
      {...props}
    />
  )
}

export { Spinner }
