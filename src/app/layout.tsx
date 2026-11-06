import type { Metadata } from "next";
import { Bodoni_Moda, Inter } from "next/font/google";
import "@/styles/globals.scss";

const editorial = Bodoni_Moda({
  variable: "--font-editorial",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const ui = Inter({
  variable: "--font-ui",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dear Paper · Un lugar para tus próximas ideas",
  description:
    "Un pequeño taller digital para hacer tuya una libreta. Elige un motivo, encuentra tu color y ponle palabras.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${editorial.variable} ${ui.variable}`}>
      <body>{children}</body>
    </html>
  );
}
