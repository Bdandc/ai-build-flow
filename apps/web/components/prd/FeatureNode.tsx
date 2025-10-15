"use client";

import { useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import type { NodeProps } from "reactflow";

import { usePRD } from "@/store/prdStore";
import type { FeatureKind, PRDBlock } from "@/types/prd";

type FeatureNodeData = {
  block: PRDBlock;
};

const KIND_LABELS: Record<FeatureKind, string> = {
  feature: "Feature",
  page: "Page",
  flow: "Flow",
  api: "API",
  task: "Task",
};

const KIND_OPTIONS: FeatureKind[] = ["feature", "page", "flow", "api", "task"];

export default function FeatureNode({ data, selected }: NodeProps<FeatureNodeData>) {
  const { block } = data;
  const selectBlock = usePRD((s) => s.select);
  const removeBlock = usePRD((s) => s.removeBlock);
  const updateBlock = usePRD((s) => s.updateBlock);

  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (buttonRef.current?.contains(target) || popoverRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (!selected) setOpen(false);
  }, [selected]);

  const togglePopover = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setOpen((prev) => !prev);
  };

  const handleEdit = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    selectBlock(block.id);
    setOpen(false);
  };

  const handleRemove = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    removeBlock(block.id);
    setOpen(false);
  };

  const handleSetKind = (kind: FeatureKind) => (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (kind !== block.kind) {
      updateBlock(block.id, { kind });
    }
    setOpen(false);
  };

  return (
    <div
      className={`relative w-[220px] rounded-xl border bg-[#101114] p-3 text-left text-white shadow-lg transition-colors ${
        selected ? "border-violet-500 ring-2 ring-violet-500/30" : "border-[#202127]"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="rounded-full border border-[#2b2d33] bg-[#16171c] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#9aa0a6]">
          {KIND_LABELS[block.kind]}
        </span>
        <button
          ref={buttonRef}
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={togglePopover}
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[#2b2d33] bg-[#141519] text-sm text-[#9aa0a6] transition hover:text-white"
        >
          •••
        </button>
      </div>
      <div className="mt-2 text-sm font-semibold leading-snug">
        {block.title || "Untitled"}
      </div>
      <div className="mt-1 text-xs text-[#9aa0a6]">
        {block.description ? block.description : "Click to edit the PRD details."}
      </div>

      {open && (
        <div
          ref={popoverRef}
          role="menu"
          tabIndex={-1}
          onMouseDown={(event) => event.stopPropagation()}
          className="absolute right-0 top-full z-20 mt-2 w-48 rounded-lg border border-[#24262c] bg-[#0c0d0f] p-1 shadow-xl"
        >
          <button
            type="button"
            role="menuitem"
            onClick={handleEdit}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-[#e7e7ea] transition hover:bg-[#1a1c22]"
          >
            Edit PRD
          </button>
          <div className="my-1 border-t border-[#1b1d22]" />
          <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#5a5f68]">
            Change type
          </div>
          {KIND_OPTIONS.map((kind) => (
            <button
              key={kind}
              type="button"
              role="menuitemradio"
              aria-checked={block.kind === kind}
              onClick={handleSetKind(kind)}
              className={`flex w-full items-center justify-between rounded-md px-3 py-1.5 text-sm transition hover:bg-[#1a1c22] ${
                block.kind === kind ? "text-white" : "text-[#c7c8cc]"
              }`}
            >
              <span>{KIND_LABELS[kind]}</span>
              {block.kind === kind && <span className="text-xs">●</span>}
            </button>
          ))}
          <div className="my-1 border-t border-[#1b1d22]" />
          <button
            type="button"
            role="menuitem"
            onClick={handleRemove}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-rose-400 transition hover:bg-rose-500/10"
          >
            Delete node
          </button>
        </div>
      )}
    </div>
  );
}

