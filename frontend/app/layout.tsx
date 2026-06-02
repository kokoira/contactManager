import type { Metadata } from "next";
import "./globals.css";
import { RoleProvider } from "@/contexts/RoleContext";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "お問い合わせ管理",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 min-h-screen">
        <RoleProvider>
          <Header />
          <main className="max-w-4xl mx-auto px-6 py-8">{children}</main>
        </RoleProvider>
      </body>
    </html>
  );
}
