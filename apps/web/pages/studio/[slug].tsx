import React from "react";
import dynamic from "next/dynamic";
import {
  Background as BackgroundComponent,
  Controls as ControlsComponent,
  addEdge,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type ReactFlowProps,
} from "reactflow";
import "reactflow/dist/style.css";

import FeatureNode, { FeatureNodeData } from "../../src/flow/nodes/FeatureNode";

const ReactFlow = dynamic(
  () => import("reactflow").then((mod) => mod.default),
  { ssr: false }
) as unknown as React.ComponentType<ReactFlowProps>;
const Background = BackgroundComponent as unknown as React.ComponentType;
const Controls = ControlsComponent as unknown as React.ComponentType;

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
    function addText(event: Event) {
      const { id, value } = (event as CustomEvent<{ id: string; value?: string }>).detail || {};
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
    function addTodo(event: Event) {
      const { id, value } = (event as CustomEvent<{ id: string; value?: string }>).detail || {};
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
    function getHelp(event: Event) {
      const detail = (event as CustomEvent<{ id: string }>).detail;
      // Placeholder: open a side panel or toast
      console.info("Get Help for node:", detail?.id);
    }
    function generatePRD(event: Event) {
      const detail = (event as CustomEvent<{ id: string }>).detail;
      // Placeholder: call API / n8n workflow to generate PRD
      console.info("Generate PRD for node:", detail?.id);
    }

    window.addEventListener("node:addText", addText);
    window.addEventListener("node:addTodo", addTodo);
    window.addEventListener("node:getHelp", getHelp);
    window.addEventListener("node:generatePRD", generatePRD);
    return () => {
      window.removeEventListener("node:addText", addText);
      window.removeEventListener("node:addTodo", addTodo);
      window.removeEventListener("node:getHelp", getHelp);
      window.removeEventListener("node:generatePRD", generatePRD);
    };
  }, [setNodes]);

  const onConnect = React.useCallback(
    (params: Parameters<typeof addEdge>[0]) => setEdges((eds) => addEdge(params, eds)),
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
