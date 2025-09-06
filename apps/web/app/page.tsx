import { Button } from "@ai-build-flow/ui";
export default function Page() {
  return (
    <main style={{ padding: 24 }}>
      <h1>AI Build Flow – Web</h1>
      <p>Next.js app inside the monorepo.</p>
      <Button label="Hello from UI pkg" onClick={() => alert("Hi from shared UI")} />
    </main>
  );
}
