import dynamic from "next/dynamic";
import Head from "next/head";
import { usePRD, serialize, deserialize } from "@/store/prdStore";
import { toSingleMarkdownDoc, download } from "@/lib/prdMarkdown";

const PRDCanvas = dynamic(() => import("@/components/prd/PRDCanvas"), { ssr: false });
const PRDEditor = dynamic(() => import("@/components/prd/PRDEditor"), { ssr: false });

export default function StudioPage() {
  const { blocks, edges, addBlock, reset } = usePRD();

  const exportJSON = () => {
    const text = serialize({ blocks, edges, version: 1 });
    download("prd-graph.json", text);
  };

  const importJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try { reset(deserialize(String(reader.result))); } catch {}
    };
    reader.readAsText(file);
  };

  const exportPRD = () => {
    const md = toSingleMarkdownDoc({ blocks, edges, version: 1 });
    download("PRD.md", md);
  };

  return (
    <>
      <Head><title>PRD Studio</title></Head>
      <div style={{ padding: 16, display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, height: "calc(100vh - 32px)" }}>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <button onClick={() => addBlock()} className="border rounded px-3 py-1">+ Add Node</button>
            <button onClick={exportJSON} className="border rounded px-3 py-1">Export JSON</button>
            <label className="border rounded px-3 py-1 cursor-pointer">
              Import JSON
              <input type="file" accept="application/json" onChange={e => e.target.files && importJSON(e.target.files[0])} hidden />
            </label>
            <button onClick={exportPRD} className="border rounded px-3 py-1">Export PRD.md</button>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <PRDCanvas />
          </div>
        </div>
        <div className="h-full">
          <PRDEditor />
        </div>
      </div>
    </>
  );
}
