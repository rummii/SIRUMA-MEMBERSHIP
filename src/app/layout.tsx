import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Siruma Highlands Beach Resort & Leisure Club",
    template: "%s · Siruma Highlands",
  },
  description:
    "Membership management for Siruma Highlands Beach Resort & Leisure Club — digital member cards, payments, and front-desk verification.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
