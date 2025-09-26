import * as React from "react";
import { cn } from "@/lib/utils";

interface MenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}
const MenuContext = React.createContext<MenuContextValue | undefined>(undefined);

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return <MenuContext.Provider value={{ open, setOpen }}>{children}</MenuContext.Provider>;
}

export function DropdownMenuTrigger({ children }: { children: React.ReactElement }) {
  const ctx = React.useContext(MenuContext);
  if (!ctx) throw new Error("DropdownMenu components must be used inside <DropdownMenu>");
  const child = React.Children.only(children);
  return React.cloneElement(child, {
    onClick: (e: any) => {
      child.props.onClick?.(e);
      ctx.setOpen(!ctx.open);
    },
  });
}

export function DropdownMenuContent({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  const ctx = React.useContext(MenuContext);
  if (!ctx || !ctx.open) return null;
  return (
    <div className={cn("z-50 mt-2 min-w-[8rem] rounded-md border bg-popover p-1 text-popover-foreground shadow-md", className)}>
      {children}
    </div>
  );
}

export function DropdownMenuItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "cursor-pointer select-none rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
        className
      )}
      {...props}
    />
  );
}
