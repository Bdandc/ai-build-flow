import * as React from "react";
import { cn } from "@/lib/utils";

export function Command({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex h-full w-full flex-col overflow-hidden", className)} {...props} />;
}

export function CommandList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("max-h-60 overflow-y-auto", className)} {...props} />;
}

export function CommandGroup({ heading, className, ...props }: React.HTMLAttributes<HTMLDivElement> & { heading?: React.ReactNode; }) {
  return (
    <div className={cn("p-1", className)} {...props}>
      {heading && (
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          {heading}
        </div>
      )}
      {props.children}
    </div>
  );
}

export function CommandItem({ className, onSelect, ...props }: React.HTMLAttributes<HTMLDivElement> & { onSelect?: () => void }) {
  return (
    <div
      className={cn(
        "cursor-pointer select-none rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
        className
      )}
      onClick={onSelect}
      {...props}
    />
  );
}
