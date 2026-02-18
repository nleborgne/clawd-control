import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { Providers } from "@/app/providers";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "OpenClaw Mission Control",
  description: "Premium control center for autonomous OpenClaw agents",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen text-zinc-100 antialiased">
        <Providers>
          <div className="min-h-screen">
            <Nav />
            <main className="mx-auto w-full max-w-[1400px] px-2 py-3 md:px-4 md:py-5">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
