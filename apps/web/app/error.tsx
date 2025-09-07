'use client';

export const dynamic = "force-dynamic";

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <main style={{ padding: 24 }}>
      <h1>500 — Something went wrong</h1>
      <p>{error?.message}</p>
    </main>
  );
}
