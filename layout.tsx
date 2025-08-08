import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AUC Archive Chatbot",
  description: "Search and explore AUC Digital Collections via CONTENTdm",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
