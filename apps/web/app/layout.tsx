export const metadata = { title: "AI Build Flow – Web" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body style={{ fontFamily:"ui-sans-serif, system-ui" }}>{children}</body></html>;
}
