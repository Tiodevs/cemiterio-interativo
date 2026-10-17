import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cemitério interativo",
  description:
    "Um cemitério digital em cima da sobremesa. Entre com a câmera para posicionar as lápides.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#05070a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
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
        <footer className="shell flex flex-col gap-4 pb-8 font-mono text-[0.68rem] leading-4 text-bone-dim">
          <p className="tracking-[0.14em] text-bone uppercase">
            Saiba mais em{" "}
            <a
              href="https://mefelipe.com.br"
              className="text-cyan transition-colors hover:text-bone"
            >
              mefelipe.com.br
            </a>
          </p>
          <p>
            This product includes the XR Engine software developed by Niantic
            Spatial, Inc. Copyright © 2026 Niantic Spatial, Inc. All rights
            reserved. License:{" "}
            <a href="https://github.com/8thwall/engine/blob/main/LICENSE">
              github.com/8thwall/engine/blob/main/LICENSE
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}
