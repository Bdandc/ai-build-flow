import React from "react";

type MenuAction = "text" | "todo" | "help" | "prd";

export function NodeMenu({
  open,
  onClose,
  onAction,
}: {
  open: boolean;
  onClose: () => void;
  onAction: (a: MenuAction) => void;
}) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-label="Add Content"
      className="node-menu"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="node-menu-title">Add Content:</div>
      <div className="node-menu-grid">
        <button className="node-menu-item" onClick={() => onAction("text")}>
          <span className="node-menu-emoji">⌨️</span>
          <span>Text</span>
        </button>
        <button className="node-menu-item" onClick={() => onAction("todo")}>
          <span className="node-menu-emoji">☑️</span>
          <span>To-Do</span>
        </button>
        <button className="node-menu-item" onClick={() => onAction("help")}>
          <span className="node-menu-emoji">❓</span>
          <span>Get Help</span>
        </button>
        <button className="node-menu-item" onClick={() => onAction("prd")}>
          <span className="node-menu-emoji">📄</span>
          <span className="node-menu-link">Generate PRD</span>
        </button>
      </div>
      <style jsx>{`
        .node-menu {
          position: absolute;
          top: 36px;
          right: 0;
          min-width: 220px;
          background: #fff;
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 12px;
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
          padding: 12px;
          z-index: 50;
        }
        .node-menu-title {
          font-size: 12px;
          font-weight: 600;
          color: #5f6368;
          margin-bottom: 8px;
        }
        .node-menu-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
        .node-menu-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px;
          border-radius: 10px;
          border: 1px solid rgba(0, 0, 0, 0.06);
          background: #fafafa;
          cursor: pointer;
          transition: transform 0.06s ease, background 0.06s ease;
        }
        .node-menu-item:hover {
          background: #f2f2f2;
          transform: translateY(-1px);
        }
        .node-menu-emoji {
          font-size: 16px;
        }
        .node-menu-link {
          color: #6a28ff;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
