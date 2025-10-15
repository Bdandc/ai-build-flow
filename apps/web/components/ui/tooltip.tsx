import * as React from "react";
import { cn } from "@/lib/utils";

interface TooltipContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}
const TooltipContext = React.createContext<TooltipContextValue | undefined>(undefined);

export function Tooltip({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return <TooltipContext.Provider value={{ open, setOpen }}>{children}</TooltipContext.Provider>;
}

export function TooltipTrigger({ children }: { children: React.ReactElement }) {
  const ctx = React.useContext(TooltipContext);
  if (!ctx) throw new Error("Tooltip components must be used inside <Tooltip>");
  const child = React.Children.only(children);
  return React.cloneElement(child, {
    onMouseEnter: (e: any) => {
      child.props.onMouseEnter?.(e);
      ctx.setOpen(true);
    },
    onMouseLeave: (e: any) => {
      child.props.onMouseLeave?.(e);
      ctx.setOpen(false);
    },
  });
}

export function TooltipContent({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  const ctx = React.useContext(TooltipContext);
  if (!ctx || !ctx.open) return null;
  return (
    <div className={cn("z-50 rounded-md border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md", className)}>
      {children}
    </div>
  );
}
