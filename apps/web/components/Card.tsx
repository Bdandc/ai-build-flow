export function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border p-5 shadow-sm">
      <h3 className="font-medium mb-2">{title}</h3>
      <div className="text-sm text-gray-600">{children}</div>
    </div>
  );
}
