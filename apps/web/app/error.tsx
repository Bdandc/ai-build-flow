'use client';

export const dynamic = "force-dynamic";

export default function Error({ error }: { error: Error }) {
  return (
    <main>
      <h1>Something went wrong</h1>
      <p>{error.message}</p>
    </main>
  );
}
