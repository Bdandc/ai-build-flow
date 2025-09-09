import React from "react";
import ReactFlow, {
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
} from "reactflow";
import "reactflow/dist/style.css";

import FeatureNode, { FeatureNodeData } from "../../src/flow/nodes/FeatureNode";

// ---- Node Types ----
const nodeTypes = { feature: FeatureNode };

// ---- Demo initial graph (you can replace with your real data) ----
const initialNodes: Node<FeatureNodeData>[] = [
  {
    id: "f1",
    type: "feature",
    position: { x: 120, y: 120 },
    data: { title: "Feature A" },
  },
  {
    id: "f2",
    type: "feature",
    position: { x: 420, y: 180 },
    data: { title: "Feature B" },
  },
];

const initialEdges: Edge[] = [{ id: "e1", source: "f1", target: "f2" }];

// ---- Page ----
export default function StudioPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Wire demo event listeners from the node actions
  React.useEffect(() => {
    function addText(e: any) {
      const { id, value } = e.detail || {};
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id
            ? {
                ...n,
                data: {
                  ...n.data,
                  texts: [...(n.data.texts || []), String(value ?? "New text")],
                },
              }
            : n
        )
      );
    }
    function addTodo(e: any) {
      const { id, value } = e.detail || {};
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id
            ? {
                ...n,
                data: {
                  ...n.data,
                  todos: [
                    ...(n.data.todos || []),
                    { id: crypto.randomUUID(), text: String(value ?? "New task"), done: false },
                  ],
                },
              }
            : n
        )
      );
    }
    function getHelp(e: any) {
      // Placeholder: open a side panel or toast
      console.info("Get Help for node:", e.detail?.id);
    }
    function generatePRD(e: any) {
      // Placeholder: call API / n8n workflow to generate PRD
      console.info("Generate PRD for node:", e.detail?.id);
    }

    window.addEventListener("node:addText", addText as any);
    window.addEventListener("node:addTodo", addTodo as any);
    window.addEventListener("node:getHelp", getHelp as any);
    window.addEventListener("node:generatePRD", generatePRD as any);
    return () => {
      window.removeEventListener("node:addText", addText as any);
      window.removeEventListener("node:addTodo", addTodo as any);
      window.removeEventListener("node:getHelp", getHelp as any);
      window.removeEventListener("node:generatePRD", generatePRD as any);
    };
  }, [setNodes]);

  const onConnect = React.useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div style={{ height: "100vh" }}>
      <ReactFlow
        nodeTypes={nodeTypes}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}

/**
 * ---- Build error fix helper ----
 * If you still reference a function that labels blocks like: (b) => b.type,
 * make sure it's safe-typed:
 */
export type Block =
  | { type: "stats"; items: any[] }
  | { type: "table"; columns: any[] }
  | { type: string; [k: string]: any };

export function safeBlockLabel(b: Block | null | undefined): string {
  if (!b || typeof (b as any).type !== "string") return "block";
  if (b.type === "stats") return `stats — ${(b as any).items?.length ?? 0} items`;
  if (b.type === "table") return `table — ${(b as any).columns?.length ?? 0} cols`;
  return String(b.type);
}
