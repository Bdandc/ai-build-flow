import Layout from "@/components/Layout";

export default function Home() {
  return (
    <Layout>
      <section className="text-center py-20">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          AI Build Flow — Web
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Baseline build is working. Tailwind UI is now wired up.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <a
            href="/dashboard"
            className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Open Dashboard
          </a>
          <a
            href="/docs"
            className="inline-flex items-center rounded-md bg-black text-white px-4 py-2 text-sm font-medium hover:bg-gray-900"
          >
            Read Docs
          </a>
        </div>
      </section>
    </Layout>
  );
}
