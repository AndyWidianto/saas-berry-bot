import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./styles/globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: 'Otomatiskan WhatsApp & AI Chatbot Tanpa Ribet dengan API Tangguh | Berry Sweet',
    template: '%s | Berry Sweet Docs',
  },
  description:
    'Dokumentasi resmi Berry Sweet: SaaS Chatbot AI WhatsApp dengan akses API Key untuk Vector Embedding, Fetch Messages, dan Automated Messaging.',
  keywords: [
    'Berry Sweet',
    'WhatsApp Chatbot',
    'WhatsApp API',
    'AI Embedding',
    'Chatbot SaaS',
    'Messaging API',
  ],
  openGraph: {
    title: 'Berry Sweet',
    description:
      'Integrasikan Chatbot AI WhatsApp dan kelola pesan, embedding, serta API key dengan mudah di Berry Sweet.',
    type: 'website',
    siteName: 'Berry Sweet Docs',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Toaster richColors position="top-right" />
        {children}
      </body>
    </html>
  );
}
