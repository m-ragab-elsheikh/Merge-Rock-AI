import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Merge Solver AI",
  description: "Smart move recommendations for your merge puzzle",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}