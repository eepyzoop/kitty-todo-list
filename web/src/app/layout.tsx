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
    <html
      lang="en"
      className={`${varela.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try {
              const t = localStorage.getItem("theme");
              if (t === "dark" || (!t && matchMedia("(prefers-color-scheme: dark)").matches)) {
                document.documentElement.classList.add("dark");
              }
            } catch (e) {}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
