import type { Metadata, Viewport } from "next";
import "./globals.css";

import {
    Bebas_Neue,
    Oswald,
} from "next/font/google";

import ServiceWorkerRegister from "./components/ServiceWorkerRegister";
import Providers from "./components/Providers";

const bebas = Bebas_Neue({
    subsets: ["latin"],
    weight: "400",
});

const oswald = Oswald({
    subsets: ["latin"],
    weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  applicationName: "FlashWash",
  title: {
    default: "FlashWash",
    template: "%s · FlashWash",
  },
  description: "Un auto limpio, en un destello.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FlashWash",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bebas.className} ${oswald.className} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
