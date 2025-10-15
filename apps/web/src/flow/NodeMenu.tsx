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
  React.useEffect(() => {
    if (!open) return;
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

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
    </div>
  );
}
