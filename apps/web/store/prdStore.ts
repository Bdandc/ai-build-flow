"use client";
import { create } from "zustand";
import { v4 as uuid } from "uuid";
import { PRDBlock, PRDEdge, PRDGraph } from "@/types/prd";

interface PRDState extends PRDGraph {
  selectedId?: string;
  select: (id?: string) => void;
  addBlock: (partial?: Partial<PRDBlock>) => PRDBlock;
  updateBlock: (id: string, patch: Partial<PRDBlock>) => void;
  removeBlock: (id: string) => void;
  addEdge: (edge: Omit<PRDEdge, "id">) => PRDEdge;
  removeEdge: (id: string) => void;
  reset: (g?: PRDGraph) => void;
}

export const usePRD = create<PRDState>((set, get) => ({
  blocks: [],
  edges: [],
  version: 1,
  selectedId: undefined,
  select: (id) => set({ selectedId: id }),
  addBlock: (partial = {}) => {
    const b: PRDBlock = {
      id: uuid(),
      title: partial.title ?? "New Feature",
      kind: partial.kind ?? "feature",
      description: partial.description ?? "",
      x: partial.x ?? 0,
      y: partial.y ?? 0,
    };
    set(s => ({ blocks: [...s.blocks, b], selectedId: b.id }));
    return b;
  },
  updateBlock: (id, patch) =>
    set(s => ({ blocks: s.blocks.map(b => b.id === id ? { ...b, ...patch } : b) })),
  removeBlock: (id) =>
    set(s => ({
      blocks: s.blocks.filter(b => b.id !== id),
      edges: s.edges.filter(e => e.source !== id && e.target !== id),
      selectedId: s.selectedId === id ? undefined : s.selectedId
    })),
  addEdge: (edge) => {
    const e: PRDEdge = { id: uuid(), ...edge };
    set(s => ({ edges: [...s.edges, e] }));
    return e;
  },
  removeEdge: (id) => set(s => ({ edges: s.edges.filter(e => e.id !== id) })),
  reset: (g) => set(g ?? { blocks: [], edges: [], version: 1 }),
}));

export const serialize = (g: PRDGraph) => JSON.stringify(g, null, 2);
export const deserialize = (s: string): PRDGraph => JSON.parse(s);
