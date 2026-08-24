"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import {
  ChevronRight,
  Database,
  Check,
  Copy,
  ArrowRight,
  ShieldCheck,
  Code2,
  Globe,
  FileText,
  Link as LinkIcon,
  Sparkles,
} from "lucide-react";
import { baseUrlMessageGateway } from "@/lib/shared/shared";

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export default function EmbeddingsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [embedType, setEmbedType] = useState<"file" | "url">("file");

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const sdkFileCode = `import { BerrySweet } from 'berry-sweet';
import fs from 'fs';

const client = new BerrySweet({
  prefixKey: 'bs_live',
  apiKey: process.env.BERRY_SWEET_API_KEY,
});

async function main() {
  // 1. Embedding file dokumen (PDF/TXT/Docx)
  const fileStream = fs.createReadStream('./knowledge-base.pdf');

  const response = await client.embedding({
    file: fileStream,
  });

  console.log('Embedding File Sukses:', response);
}

main();`;

  const sdkUrlCode = `import { BerrySweet } from 'berry-sweet';

const client = new BerrySweet({
  prefixKey: 'bs_live',
  apiKey: process.env.BERRY_SWEET_API_KEY,
});

async function main() {
  // 1. Embedding dari URL Website / Artikel
  const response = await client.embedding({
    url: 'https:// example.com/syarat-dan-ketentuan',
  });

  console.log('Embedding URL Sukses:', response);
}

main();`;

  const curlFileCode = `curl -X POST "http://localhost:10001/api/chatbot/embeddings" \\
  -H "Authorization: Bearer YOUR_BERRY_SWEET_API_KEY" \\
  -F "file=@./knowledge-base.pdf" \\
  -F "prefixKey=bs_live"`;

  const curlUrlCode = `curl -X POST "http://localhost:10001/api/chatbot/embeddings" \\
  -H "Authorization: Bearer YOUR_BERRY_SWEET_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prefixKey": "bs_live",
    "url": "https://example.com/syarat-dan-ketentuan"
  }'`;

  return (
    <motion.div
      className="space-y-8 sm:space-y-10"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Breadcrumbs */}
      <motion.div variants={itemVariants} className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/docs" className="hover:text-foreground transition-colors">
          Docs
        </Link>
        <ChevronRight className="w-3 h-3 text-muted-foreground/60" />
        <span className="text-foreground font-medium">Vector Embeddings</span>
      </motion.div>

      {/* Header Section */}
      <motion.div variants={itemVariants} className="space-y-3 border-b border-border/40 pb-6 sm:pb-8">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <Database className="w-3 h-3" /> Knowledge Base
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Vector Embeddings
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
          Ekstrak dan ubah file dokumen atau link web menjadi vektor basis pengetahuan (RAG) untuk AI Chatbot Anda via method <code className="text-xs font-mono font-semibold">.embedding()</code> atau API.
        </p>
      </motion.div>

      {/* Selector Options File vs URL */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            Pilih Sumber Knowledge Base
          </h2>

          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border/60">
            <button
              onClick={() => setEmbedType("file")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                embedType === "file"
                  ? "bg-background text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>File Document</span>
            </button>
            <button
              onClick={() => setEmbedType("url")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                embedType === "url"
                  ? "bg-background text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Web URL</span>
            </button>
          </div>
        </div>

        {/* Node.js SDK Section */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-emerald-500" />
            1. Menggunakan Node.js SDK
          </h3>

          <div className="relative bg-slate-950 text-slate-50 border border-slate-800 rounded-xl overflow-hidden font-mono text-xs shadow-xl">
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/80 text-slate-400 text-[11px]">
              <span className="font-sans font-medium text-slate-300">
                {embedType === "file" ? "Embedding File Document" : "Embedding Web URL"}
              </span>
              <button
                onClick={() =>
                  handleCopy(
                    embedType === "file" ? sdkFileCode : sdkUrlCode,
                    "sdk_code"
                  )
                }
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-all active:scale-95"
              >
                {copiedCode === "sdk_code" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-sans font-medium">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-sans">Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 sm:p-5 overflow-x-auto leading-relaxed font-mono text-slate-200 bg-slate-950">
              <code>
                {embedType === "file" ? (
                  <>
                    <span className="text-violet-400 font-semibold">import</span>{" "}
                    <span className="text-slate-100">{`{ BerrySweet }`}</span>{" "}
                    <span className="text-violet-400 font-semibold">from</span>{" "}
                    <span className="text-emerald-400">'berry-sweet'</span>;{"\n"}
                    <span className="text-violet-400 font-semibold">import</span>{" "}
                    <span className="text-slate-100">fs</span>{" "}
                    <span className="text-violet-400 font-semibold">from</span>{" "}
                    <span className="text-emerald-400">'fs'</span>;{"\n\n"}

                    <span className="text-violet-400 font-semibold">const</span>{" "}
                    <span className="text-sky-300">client</span> ={" "}
                    <span className="text-amber-400 font-semibold">new</span>{" "}
                    <span className="text-sky-300">BerrySweet</span>({`{\n`}
                    {'  '}<span className="text-violet-400">prefixKey</span>: <span className="text-emerald-400">'bs_live'</span>,{"\n"}
                    {'  '}<span className="text-violet-400">apiKey</span>: <span className="text-sky-300">process</span>.<span className="text-sky-300">env</span>.<span className="text-amber-300">BERRY_SWEET_API_KEY</span>,{"\n"}
                    {`}`});{"\n\n"}

                    <span className="text-violet-400 font-semibold">async function</span>{" "}
                    <span className="text-sky-300">main</span>() {`{\n`}
                    {'  '}<span className="text-slate-500">// 1. Embedding file dokumen</span>{"\n"}
                    {'  '}<span className="text-violet-400 font-semibold">const</span> <span className="text-sky-300">fileStream</span> = <span className="text-sky-300">fs</span>.<span className="text-amber-400">createReadStream</span>(<span className="text-emerald-400">'./knowledge-base.pdf'</span>);{"\n\n"}
                    {'  '}<span className="text-violet-400 font-semibold">const</span> <span className="text-sky-300">response</span> = <span className="text-violet-400 font-semibold">await</span> <span className="text-sky-300">client</span>.<span className="text-amber-400 font-semibold">embedding</span>({`{\n`}
                    {'    '}<span className="text-violet-400">file</span>: <span className="text-sky-300">fileStream</span>,{"\n"}
                    {'  '}{`}`});{"\n\n"}
                    {'  '}<span className="text-sky-300">console</span>.<span className="text-amber-400">log</span>(<span className="text-emerald-400">'Hasil:'</span>, <span className="text-sky-300">response</span>);{"\n"}
                    {`}\n\n`}
                    <span className="text-sky-300">main</span>();
                  </>
                ) : (
                  <>
                    <span className="text-violet-400 font-semibold">import</span>{" "}
                    <span className="text-slate-100">{`{ BerrySweet }`}</span>{" "}
                    <span className="text-violet-400 font-semibold">from</span>{" "}
                    <span className="text-emerald-400">'berry-sweet'</span>;{"\n\n"}

                    <span className="text-violet-400 font-semibold">const</span>{" "}
                    <span className="text-sky-300">client</span> ={" "}
                    <span className="text-amber-400 font-semibold">new</span>{" "}
                    <span className="text-sky-300">BerrySweet</span>({`{\n`}
                    {'  '}<span className="text-violet-400">prefixKey</span>: <span className="text-emerald-400">'bs_live'</span>,{"\n"}
                    {'  '}<span className="text-violet-400">apiKey</span>: <span className="text-sky-300">process</span>.<span className="text-sky-300">env</span>.<span className="text-amber-300">BERRY_SWEET_API_KEY</span>,{"\n"}
                    {`}`});{"\n\n"}

                    <span className="text-violet-400 font-semibold">async function</span>{" "}
                    <span className="text-sky-300">main</span>() {`{\n`}
                    {'  '}<span className="text-slate-500">// 1. Embedding dari Web URL</span>{"\n"}
                    {'  '}<span className="text-violet-400 font-semibold">const</span> <span className="text-sky-300">response</span> = <span className="text-violet-400 font-semibold">await</span> <span className="text-sky-300">client</span>.<span className="text-amber-400 font-semibold">embedding</span>({`{\n`}
                    {'    '}<span className="text-violet-400">url</span>: <span className="text-emerald-400">'https://example.com/syarat-dan-ketentuan'</span>,{"\n"}
                    {'  '}{`}`});{"\n\n"}
                    {'  '}<span className="text-sky-300">console</span>.<span className="text-amber-400">log</span>(<span className="text-emerald-400">'Hasil:'</span>, <span className="text-sky-300">response</span>);{"\n"}
                    {`}\n\n`}
                    <span className="text-sky-300">main</span>();
                  </>
                )}
              </code>
            </pre>
          </div>
        </div>

        {/* cURL API Section */}
        <div className="space-y-2 pt-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-emerald-500" />
            2. Menggunakan cURL HTTP API
          </h3>

          <div className="relative bg-slate-950 text-slate-50 border border-slate-800 rounded-xl overflow-hidden font-mono text-xs shadow-xl">
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/80 text-slate-400 text-[11px]">
              <span className="font-sans font-medium text-slate-300">
                POST /api/chatbot/embeddings
              </span>
              <button
                onClick={() =>
                  handleCopy(
                    embedType === "file" ? curlFileCode : curlUrlCode,
                    "curl_code"
                  )
                }
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-all active:scale-95"
              >
                {copiedCode === "curl_code" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-sans font-medium">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-sans font-medium">Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 sm:p-5 overflow-x-auto leading-relaxed font-mono text-slate-200 bg-slate-950">
              <code>
                {embedType === "file" ? (
                  <>
                    <span className="text-amber-400 font-semibold">curl</span> <span className="text-violet-400">-X POST</span> <span className="text-emerald-400">{baseUrlMessageGateway}/YOUR_BERRY_SWEET_KEY_PREFIX/embeddings"</span> \{'\n'}
                    {'  '}<span className="text-violet-400">-H</span> <span className="text-sky-300">"apikey: YOUR_BERRY_SWEET_API_KEY"</span> \{'\n'}
                    {'  '}<span className="text-violet-400">-F</span> <span className="text-emerald-300">"file=@./knowledge-base.pdf"</span> \{'\n'}
                  </>
                ) : (
                  <>
                    <span className="text-amber-400 font-semibold">curl</span> <span className="text-violet-400">-X POST</span> <span className="text-emerald-400">{baseUrlMessageGateway}/YOUR_BERRY_SWEET_KEY_PREFIX/embeddings"</span> \{'\n'}
                    {'  '}<span className="text-violet-400">-H</span> <span className="text-sky-300">"apikey: YOUR_BERRY_SWEET_API_KEY"</span> \{'\n'}
                    {'  '}<span className="text-violet-400">-H</span> <span className="text-sky-300">"Content-Type: application/json"</span> \{'\n'}
                    {'  '}<span className="text-violet-400">-d</span> <span className="text-slate-300">{`'{`}</span>{'\n'}
                    {'    '}<span className="text-sky-300">"url"</span>: <span className="text-emerald-300 font-semibold">"https://example.com/syarat-dan-ketentuan"</span>{'\n'}
                    {'  '}<span className="text-slate-300">{`}'`}</span>
                  </>
                )}
              </code>
            </pre>
          </div>
        </div>
      </motion.div>

      {/* Format Callout Box */}
      <motion.div
        variants={itemVariants}
        className="p-4 sm:p-5 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 dark:border-emerald-800/50 flex items-start gap-3.5 relative overflow-hidden"
      >
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 dark:bg-emerald-900/50 border border-emerald-500/40 dark:border-emerald-700/50 flex items-center justify-center shrink-0 mt-0.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="space-y-1 text-xs sm:text-sm">
          <h4 className="font-bold text-emerald-950 dark:text-emerald-100">
            Format File & Ukuran yang Didukung
          </h4>
          <p className="text-emerald-900/80 dark:text-emerald-200/80 leading-relaxed">
            Format file yang didukung saat ini meliputi <code className="px-1.5 py-0.5 rounded bg-emerald-500/20 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-mono text-[11px] font-semibold">PDF, TXT, DOCX, CSV</code> dengan ukuran maksimal **10 MB per file**.
          </p>
        </div>
      </motion.div>

      {/* Footer Navigation */}
      <motion.div variants={itemVariants} className="pt-6 border-t border-border/40 flex items-center justify-between">
        <Link
          href="/docs/whatsapp-connect"
          className="group flex items-center gap-3 p-3 px-4 rounded-xl border border-border/60 bg-card/40 hover:bg-card hover:border-emerald-500/40 transition-all duration-200"
        >
          <div className="text-left">
            <span className="block text-[10px] uppercase font-bold tracking-wider text-muted-foreground/70">Previous</span>
            <span className="text-xs font-semibold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Connect WhatsApp</span>
          </div>
        </Link>

        <Link
          href="/docs/api-keys"
          className="group flex items-center gap-3 p-3 px-4 rounded-xl border border-border/60 bg-card/40 hover:bg-card hover:border-emerald-500/40 transition-all duration-200"
        >
          <div className="text-right">
            <span className="block text-[10px] uppercase font-bold tracking-wider text-muted-foreground/70">Next Page</span>
            <span className="text-xs font-semibold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">API Keys Guide</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
            <ArrowRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:text-white transition-colors" />
          </div>
        </Link>
      </motion.div>
    </motion.div>
  );
}