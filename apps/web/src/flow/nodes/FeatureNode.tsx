import React from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { NodeMenu } from "../NodeMenu";

export type FeatureNodeData = {
  title: string;
  // Placeholder arrays we can store in state/db later
  texts?: string[];
  todos?: { id: string; text: string; done: boolean }[];
};

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

      <style jsx>{`
        .feature-node {
          position: relative;
          width: 240px;
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 14px;
          padding: 12px 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }
        .is-selected {
          outline: 2px solid #6a28ff;
          outline-offset: 2px;
        }
        .title-row {
          display: grid;
          grid-template-columns: 12px 1fr 24px;
          align-items: center;
          gap: 8px;
        }
        .dot {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: #6a28ff;
          opacity: 0.9;
        }
        .title {
          font-size: 14px;
          font-weight: 700;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .plus {
          width: 24px;
          height: 24px;
          border-radius: 8px;
          border: 1px solid rgba(0, 0, 0, 0.12);
          background: #fafafa;
          cursor: pointer;
          line-height: 22px;
          font-size: 16px;
          font-weight: 700;
        }
        .plus:hover {
          background: #f1f1f1;
        }
      `}</style>
    </div>
  );
}
