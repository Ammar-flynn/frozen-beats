import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Frozen Beats | Music Streaming",
  description: "Stream your favorite music with a frozen theme",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}