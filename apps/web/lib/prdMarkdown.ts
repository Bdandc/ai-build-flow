import { PRDGraph } from "@/types/prd";

export function toSingleMarkdownDoc(graph: PRDGraph): string {
  const lines: string[] = [];
  lines.push(`# Product Requirements (v${graph.version})`);
  lines.push("");
  for (const b of graph.blocks) {
    lines.push(`## ${b.title} (${b.kind})`);
    lines.push("");
    lines.push(b.description?.trim() || "_No description yet._");
    lines.push("");
  }
  if (graph.edges.length) {
    lines.push("## Flows");
    lines.push("");
    for (const e of graph.edges) lines.push(`- ${e.source} → ${e.target}`);
  }
  lines.push("");
  return lines.join("\n");
}

export function download(
  filename: string,
  text: string,
  mimeType = "text/markdown;charset=utf-8"
) {
  const blob = new Blob([text], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
