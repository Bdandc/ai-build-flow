export type FeatureKind = "feature" | "page" | "flow" | "api" | "task";

export interface PRDBlock {
  id: string;
  title: string;
  kind: FeatureKind;
  description: string;   // Markdown
  x: number;
  y: number;
}

export interface PRDEdge {
  id: string;
  source: string;
  target: string;
}

export interface PRDGraph {
  blocks: PRDBlock[];
  edges: PRDEdge[];
  version: number;
}
