import React from "react";
import { Handle as HandleComponent, Position, type NodeProps } from "reactflow";
import { NodeMenu } from "../NodeMenu";

export type FeatureNodeData = {
  title: string;
  // Placeholder arrays we can store in state/db later
  texts?: string[];
  todos?: { id: string; text: string; done: boolean }[];
};

const Handle = HandleComponent as unknown as React.ComponentType<any>;

export default function FeatureNode({ id, data, selected }: NodeProps<FeatureNodeData>) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  function onAction(a: "text" | "todo" | "help" | "prd") {
    setOpen(false);

    // Wire these to your real store / backend later:
    if (a === "text") {
      window.dispatchEvent(
        new CustomEvent("node:addText", { detail: { id, value: "New text…" } })
      );
    } else if (a === "todo") {
      window.dispatchEvent(
        new CustomEvent("node:addTodo", { detail: { id, value: "New task…" } })
      );
    } else if (a === "help") {
      window.dispatchEvent(new CustomEvent("node:getHelp", { detail: { id } }));
    } else if (a === "prd") {
      window.dispatchEvent(new CustomEvent("node:generatePRD", { detail: { id } }));
    }
  }

  return (
    <div ref={ref} className={`feature-node ${selected ? "is-selected" : ""}`}>
      <div className="title-row">
        <div className="dot" />
        <div className="title" title={data?.title || "Feature"}>
          {data?.title || "Feature"}
        </div>
        <button
          className="plus"
          aria-label="Add"
          onClick={(e) => {
            e.stopPropagation();
            setOpen((s) => !s);
          }}
        >
          +
        </button>
        <NodeMenu open={open} onClose={() => setOpen(false)} onAction={onAction} />
      </div>

      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
