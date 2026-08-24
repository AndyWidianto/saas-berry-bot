import { Metadata } from "next";
import DocsClientView from "../components/DocsClientView";



export const metadata: Metadata = {
  title: {
    default: 'Documentation | Berry Sweet',
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
    title: 'Berry Sweet Documentation',
    description:
      'Integrasikan Chatbot AI WhatsApp dan kelola pesan, embedding, serta API key dengan mudah di Berry Sweet.',
    type: 'website',
    siteName: 'Berry Sweet Docs',
  },
};


export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <DocsClientView >
        {children}
      </DocsClientView>
    </div>
  )
}