import Link from "next/link";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <header className="border-b">
        <nav className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold">
            AI Build Flow
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/docs" className="text-sm hover:underline">
              Docs
            </Link>
            <Link href="/dashboard" className="text-sm hover:underline">
              Dashboard
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-6 py-10">{children}</div>
      </main>

      <footer className="border-t">
        <div className="mx-auto max-w-5xl px-6 py-6 text-sm text-gray-500">
          © {new Date().getFullYear()} AI Build Flow
        </div>
      </footer>
    </div>
  );
}
