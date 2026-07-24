import type { Metadata } from "next";
import { Varela_Round } from "next/font/google";
import "./globals.css";

const varela = Varela_Round({
  variable: "--font-varela",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TaskKitty",
  description: "A cute todo app with a kawaii cat mascot.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${varela.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
