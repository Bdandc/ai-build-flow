"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Separator } from "@/components/ui/separator";

type MenuAction = "text" | "todo" | "help" | "prd";

export function AddMenu({ onSelect }: { onSelect: (action: MenuAction) => void }) {
  const [open, setOpen] = React.useState(false);
  const choose = (a: MenuAction) => { onSelect(a); setOpen(false); };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button size="sm" variant="secondary" aria-label="Add">+</Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-0" align="start">
        <Command>
          <CommandList>
            <CommandGroup heading="Add Content">
              <CommandItem onSelect={() => choose("text")}>Text</CommandItem>
              <CommandItem onSelect={() => choose("todo")}>To-Do</CommandItem>
            </CommandGroup>
            <Separator className="my-1" />
            <CommandGroup>
              <CommandItem onSelect={() => choose("help")}>Get Help</CommandItem>
              <CommandItem onSelect={() => choose("prd")}>Generate PRD</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
