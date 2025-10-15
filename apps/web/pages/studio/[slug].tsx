import { useRouter } from "next/router";
import React, { useEffect, useMemo } from "react";
import {
  StudioBlock,
  StudioProjectMeta,
  defaultBlocks,
  parseCommand,
  renderBlocksToHtml,
} from "@/lib/studioModel";
import {
  getProjectMeta,
  loadProject,
  saveProject,
} from "@/store/studioStore";

export default function StudioPage() {
  const router = useRouter();
  const { slug } = router.query;

  const [meta, setMeta] = React.useState<StudioProjectMeta | null>(null);
  const [prompt, setPrompt] = React.useState<string>("");
  const [blocks, setBlocks] = React.useState<StudioBlock[]>([]);
  const [feedback, setFeedback] = React.useState<string>("");
  const [isBusy, setIsBusy] = React.useState(false);
  const promptParam =
    typeof router.query.prompt === "string" ? router.query.prompt : undefined;

  // initial load
  useEffect(() => {
    if (!slug || typeof slug !== "string") return;
    const metaProj = getProjectMeta(slug);
    setMeta(metaProj);

    const stored = loadProject(slug);
    if (stored) {
      setPrompt(stored.prompt || "My first project");
      setBlocks(stored.blocks);
      return;
    }

    const initialPrompt = promptParam || metaProj?.prompt || "My first project";
    setPrompt(initialPrompt);
    const initBlocks = defaultBlocks(initialPrompt);
    setBlocks(initBlocks);
    saveProject(slug, { prompt: initialPrompt, blocks: initBlocks });
  }, [slug, promptParam]);

  // persist on change
  useEffect(() => {
    if (!slug || typeof slug !== "string") return;
    if (!prompt) return;
    saveProject(slug, { prompt, blocks });
  }, [slug, prompt, blocks]);

  const doc = useMemo(() => renderBlocksToHtml(blocks), [blocks]);

  function handleCommand(text: string) {
    if (isBusy) return;
    setIsBusy(true);
    const result = parseCommand(text);
    if (result.type === "ok" && result.apply) {
      setBlocks((prev: StudioBlock[]) => {
        const next = result.apply!(prev);
        return next;
      });
    }
    setFeedback(result.message);
    setTimeout(() => setFeedback(""), 2000);
    setIsBusy(false);
  }

  const summarizeBlock = (b: StudioBlock): string => {
    switch (b.type) {
      case "hero":
        return b.title ? `hero — ${b.title}` : "hero";
      case "stats":
        return `stats — ${b.items?.length ?? 0} items`;
      case "table":
        return `table — ${b.columns?.length ?? 0} cols`;
      default: {
        const _exhaustive: never = b;
        return "block";
      }
    }
  };

  if (!slug || (meta === null && !prompt)) {
    return (
      <main className="p-6">
        <p className="opacity-70">Project not found.</p>
      </main>
    );
  }

  return (
    <main className="grid min-h-screen grid-cols-[minmax(260px,380px)_1fr]">
      <section className="flex flex-col border-r border-[#1f2024] bg-[#0e0f10] p-3">
        <header className="mb-[10px] flex items-center justify-between rounded-[10px] border border-[#1f2024] p-[10px]">
          <div>
            <div className="font-extrabold">{meta?.name || "Project"}</div>
            <div className="text-xs opacity-60">Studio</div>
          </div>
          <button
            onClick={() => setBlocks(defaultBlocks(prompt))}
            className="cursor-pointer border-0 bg-transparent text-xs text-rose-400"
          >
            Reset
          </button>
        </header>

        <ul className="grid m-0 flex-1 list-none gap-1.5 overflow-y-auto p-0">
          {blocks.map((b: StudioBlock, i: number) => (
            <li
              key={i}
              className="flex items-center justify-between rounded-lg border border-[#1f2024] bg-[#121316] px-[10px] py-2 text-sm"
            >
              <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                {i + 1}. {summarizeBlock(b)}
              </span>
              <button
                onClick={() =>
                  setBlocks((prev: StudioBlock[]) =>
                    prev.filter((_, idx) => idx !== i)
                  )
                }
                className="ml-2 cursor-pointer border-0 bg-transparent text-[#9aa0a6]"
                aria-label={`remove ${i + 1}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>

        {feedback && (
          <div className="mt-2 text-xs opacity-70">
            {feedback}
          </div>
        )}

        <Composer
          onSend={handleCommand}
          disabled={isBusy}
          placeholder='Tell me what to add (e.g. "add stats Revenue: $1.2M; Users: 42k")'
        />
      </section>
      <section className="bg-[#0b0c0e] p-3">
        <div className="h-[calc(100vh-24px)] overflow-hidden rounded-xl border border-[#1f2024] bg-black">
          <iframe
            title="preview"
            className="h-full w-full border-0"
            srcDoc={doc}
          />
        </div>
      </section>
    </main>
  );
}

function Composer({
  onSend,
  disabled,
  placeholder,
}: {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder: string;
}) {
  const [val, setVal] = React.useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const t = val.trim();
    if (!t || disabled) return;
    onSend(t);
    setVal("");
  }

  return (
    <form onSubmit={submit} className="mt-2 flex gap-2">
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className="flex-1 rounded-lg border border-[#1f2024] bg-[#0f1013] px-3 py-[10px] text-white outline-none"
      />
      <button
        type="submit"
        disabled={disabled || !val.trim()}
        className={`rounded-lg border-0 bg-violet-600 px-3 py-[10px] font-bold text-white ${
          disabled || !val.trim() ? "cursor-not-allowed opacity-60" : "cursor-pointer"
        }`}
        >
          Send
      </button>
    </form>
  );
}

