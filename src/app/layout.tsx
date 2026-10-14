import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Self-hosted via next/font: preloaded, `font-display: swap`, and a size-matched
// fallback font so text shows immediately and doesn't shift when Pally loads.
const pally = localFont({
  src: [
    { path: "../../public/fonts/Pally-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/Pally-Bold.woff2", weight: "700", style: "normal" },
  ],
  display: "swap",
  variable: "--font-pally",
});

export const metadata: Metadata = {
  title: "IzzySpell",
  description: "IzzySpell - Your Spelling Buddy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={pally.variable}>
      <body className={`antialiased`}>{children}</body>
    </html>
  );
}
