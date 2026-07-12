import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import { SessaoProvider } from "@/contexts/SessaoContext";
import "./globals.css";

// next/font faz o download da fonte em tempo de build e a auto-hospeda
// no bundle final — nenhuma chamada de rede acontece em runtime, então
// isso não quebra o requisito de funcionamento 100% offline do app.
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Gabinete Fácil",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={fraunces.variable}>
      <body>
        <SessaoProvider>{children}</SessaoProvider>
      </body>
    </html>
  );
}