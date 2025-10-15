"use client";
import { useMemo } from "react";
import { usePRD } from "@/store/prdStore";
import { marked } from "marked";
import sanitizeHtml from "@ai-build-flow/sanitizer";

export default function PRDEditor() {
  const { blocks, selectedId, updateBlock } = usePRD();
  const block = useMemo(() => blocks.find(b => b.id === selectedId), [blocks, selectedId]);
  const previewHtml = useMemo(
    () => sanitizeHtml(marked.parse(block?.description || "") as string),
    [block?.description],
  );

  if (!block) return <div className="text-sm text-gray-500">Select a node to edit its PRD…</div>;

  return (
    <div className="flex flex-col gap-2 h-full">
      <input
        className="border rounded px-2 py-1"
        value={block.title}
        onChange={e => updateBlock(block.id, { title: e.target.value })}
      />
      <select
        className="border rounded px-2 py-1"
        value={block.kind}
        onChange={e => updateBlock(block.id, { kind: e.target.value as any })}
      >
        <option value="feature">feature</option>
        <option value="page">page</option>
        <option value="flow">flow</option>
        <option value="api">api</option>
        <option value="task">task</option>
      </select>
      <textarea
        className="border rounded p-2 h-48 font-mono"
        placeholder="Markdown description…"
        value={block.description}
        onChange={e => updateBlock(block.id, { description: e.target.value })}
      />
      <div className="border rounded p-2 overflow-auto h-48">
        <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
      </div>
    </div>
  );
}
