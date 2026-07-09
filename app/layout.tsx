// ─── LOCKED SPINE FILE ── app shell. No stream edits this.
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mission Control",
  description: "Every agent supervised. The review layer for the software factory.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0f14",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-ctrl-bg text-ctrl-fg antialiased">
        <header className="sticky top-0 z-40 border-b border-ctrl-line bg-ctrl-bg/90 backdrop-blur">
          <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
            <a href="/" className="font-semibold tracking-tight">
              <span className="text-risk-low">●</span> Mission Control
            </a>
            <nav className="flex gap-4 text-sm text-ctrl-dim">
              <a href="/#queue" className="hover:text-ctrl-fg">Queue</a>
              <a href="/audit" className="hover:text-ctrl-fg">Audit</a>
            </nav>
          </div>
        </header>
        <div className="mx-auto max-w-2xl px-4 pb-24">{children}</div>
      </body>
    </html>
  );
}
