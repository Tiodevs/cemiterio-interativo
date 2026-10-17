import type { Metadata, Viewport } from "next";
import { Fraunces, Outfit } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cemitério interativo",
  description:
    "Aponte a câmera para o brasão no centro da sobremesa e visite as lápides.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#140e0c",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${fraunces.variable} ${outfit.variable} h-full antialiased`}
    >
      <head>
        <script
          type="importmap"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              imports: {
                three: "/vendor/three.module.min.js",
              },
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <footer className="mx-auto w-full max-w-3xl px-5 pb-6 font-sans text-[0.68rem] leading-4 text-bone/40 sm:px-8">
          This product includes the XR Engine software developed by Niantic
          Spatial, Inc. Copyright © 2026 Niantic Spatial, Inc. All rights
          reserved. License:{" "}
          <a href="https://github.com/8thwall/engine/blob/main/LICENSE">
            github.com/8thwall/engine/blob/main/LICENSE
          </a>
        </footer>
      </body>
    </html>
  );
}
