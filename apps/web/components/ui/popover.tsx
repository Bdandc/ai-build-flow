import * as React from "react";
import { cn } from "@/lib/utils";

interface PopoverContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}
const PopoverContext = React.createContext<PopoverContextValue | undefined>(undefined);

export interface PopoverProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function Popover({ open, onOpenChange, children }: PopoverProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = open !== undefined;
  const actualOpen = isControlled ? open! : internalOpen;
  const setOpen = (o: boolean) => {
    if (!isControlled) setInternalOpen(o);
    onOpenChange?.(o);
  };
  return (
    <PopoverContext.Provider value={{ open: actualOpen, setOpen }}>
      {children}
    </PopoverContext.Provider>
  );
}

export function PopoverTrigger({ asChild, children }: { asChild?: boolean; children: React.ReactElement; }) {
  const ctx = React.useContext(PopoverContext);
  if (!ctx) throw new Error("Popover components must be used inside <Popover>");
  const child = React.Children.only(children);
  return React.cloneElement(child, {
    onClick: (e: any) => {
      child.props.onClick?.(e);
      ctx.setOpen(!ctx.open);
    },
  });
}

export function PopoverContent({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  const ctx = React.useContext(PopoverContext);
  if (!ctx || !ctx.open) return null;
  return (
    <div className={cn("z-50 mt-2 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none", className)}>
      {children}
    </div>
  );
}
