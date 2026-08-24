"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import {
  ChevronRight,
  Zap,
  Check,
  Copy,
  ArrowRight,
  ShieldCheck,
  Code2,
  Globe,
  Terminal,
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

export default function QuickstartPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [sendMethod, setSendMethod] = useState<"sdk" | "curl">("sdk");

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const installCode = `pnpm add berry-sweet`;

  const sdkUsageCode = `import { BerrySweet } from 'berry-sweet';

    // 1. Inisialisasi konfigurasi dengan prefixKey dan apiKey
    const client = new BerrySweet({
    prefixKey: 'bs_live', // Prefix environment Key Anda
    apiKey: process.env.BERRY_SWEET_API_KEY || 'bs_live_1234567890abcdef',
    });

    async function main() {
      try {
          // 2. Kirim pesan via SDK Berry Sweet
          const response = await client.sendMessage({
              sessionId: "1213131",
              message: "Hallo. Selamat siang",
              user: {
                  externalId: "berry1233",
                  name: "bilqis",
                  email: "bilqis@gmail.com",
              }
          });

          console.log('Pesan berhasil terkirim:', response);
      } catch (error) {
          console.error('Gagal mengirim pesan:', error);
      }
    }

    main();`;

  const curlUsageCode = `curl -X POST "http://localhost:10001/api/chatbot/sendMessage" \\
  -H "Authorization: Bearer YOUR_BERRY_SWEET_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prefixKey": "bs_live",
    "phone": "6281234567890",
    "message": "Halo, ini pesan otomatis via cURL API Berry Sweet!"
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
        <span className="text-foreground font-medium">Quickstart</span>
      </motion.div>

      {/* Header Section */}
      <motion.div variants={itemVariants} className="space-y-3 border-b border-border/40 pb-6 sm:pb-8">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <Zap className="w-3 h-3" /> Quickstart Guide
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Mulai Integrasi SDK & API Berry Sweet
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
          Panduan langkah demi langkah untuk menginstal SDK, mengonfigurasi <code className="text-xs font-mono font-semibold">prefixKey</code> dan <code className="text-xs font-mono font-semibold">apiKey</code>, hingga mengirim pesan via SDK atau endpoint API cURL.
        </p>
      </motion.div>

      {/* Step 1: Install Module */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/20">
            1
          </div>
          <h2 className="text-base sm:text-lg font-bold text-foreground">
            Instalasi Module (Opsional untuk Node.js)
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Jika menggunakan Node.js/TypeScript, tambahkan paket SDK <code className="text-xs font-mono font-semibold">berry-sweet</code> ke dalam project Anda:
        </p>

        {/* Terminal Dark Block */}
        <div className="relative bg-slate-950 text-slate-50 border border-slate-800 rounded-xl overflow-hidden font-mono text-xs shadow-xl">
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/80 text-slate-400 text-[11px]">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-sans font-medium text-slate-300">Terminal</span>
            </div>
            <button
              onClick={() => handleCopy(installCode, "step1")}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-all active:scale-95"
            >
              {copiedCode === "step1" ? (
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
          <pre className="p-4 overflow-x-auto text-slate-200 bg-slate-950 font-mono">
            <code>
              <span className="text-violet-400 font-semibold">pnpm add</span>{" "}
              <span className="text-emerald-400">berry-sweet</span>
            </code>
          </pre>
        </div>
      </motion.div>

      {/* Step 2: Kirim Pesan (SDK vs cURL) */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/20">
            2
          </div>
          <h2 className="text-base sm:text-lg font-bold text-foreground">
            Kirim Pesan Pertama
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Pilih metode pengiriman pesan: menggunakan SDK Node.js atau memanggil HTTP Endpoint API langsung dengan cURL:
        </p>

        {/* Tab Selection Code Block */}
        <div className="relative bg-slate-950 text-slate-50 border border-slate-800 rounded-xl overflow-hidden font-mono text-xs shadow-xl">
          {/* Top Control Bar with Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 border-b border-slate-800 bg-slate-900/80 text-slate-400 text-[11px]">
            <div className="flex items-center gap-2 font-sans">
              <button
                onClick={() => setSendMethod("sdk")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${sendMethod === "sdk"
                  ? "bg-slate-200 text-slate-900 font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Node.js SDK</span>
              </button>

              <button
                onClick={() => setSendMethod("curl")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${sendMethod === "curl"
                  ? "bg-emerald-600 text-white shadow-sm font-semibold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>cURL API</span>
              </button>
            </div>

            <button
              onClick={() =>
                handleCopy(
                  sendMethod === "sdk" ? sdkUsageCode : curlUsageCode,
                  "step2"
                )
              }
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-all active:scale-95 ml-auto"
            >
              {copiedCode === "step2" ? (
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

          {/* Code Content */}
          <pre className="p-4 sm:p-5 overflow-x-auto leading-relaxed font-mono text-slate-200 bg-slate-950">
            <code>
              {sendMethod === "sdk" ? (
                <>
                  <span className="text-violet-400 font-semibold">import</span>{" "}
                  <span className="text-slate-100">{`{ BerrySweet }`}</span>{" "}
                  <span className="text-violet-400 font-semibold">from</span>{" "}
                  <span className="text-emerald-400">'berry-sweet'</span>;{"\n\n"}

                  <span className="text-slate-500">// 1. Inisialisasi konfigurasi</span>{"\n"}
                  <span className="text-violet-400 font-semibold">const</span>{" "}
                  <span className="text-sky-300">client</span> ={" "}
                  <span className="text-amber-400 font-semibold">new</span>{" "}
                  <span className="text-sky-300">BerrySweet</span>({`{\n`}
                  {'  '}<span className="text-violet-400">prefixKey</span>: <span className="text-emerald-400">'bs_live'</span>,{"\n"}
                  {'  '}<span className="text-violet-400">apiKey</span>: <span className="text-sky-300">process</span>.<span className="text-sky-300">env</span>.<span className="text-amber-300">BERRY_SWEET_API_KEY</span> || <span className="text-emerald-400">'bs_live_1234567890'</span>,{"\n"}
                  {`}`});{"\n\n"}

                  <span className="text-violet-400 font-semibold">async function</span>{" "}
                  <span className="text-sky-300">main</span>() {`{\n`}
                  {'  '}<span className="text-violet-400 font-semibold">try</span> {`{\n`}
                  {'    '}<span className="text-slate-500">// 2. Kirim pesan via SDK</span>{"\n"}
                  {'    '}<span className="text-violet-400 font-semibold">const</span> <span className="text-sky-300">response</span> = <span className="text-violet-400 font-semibold">await</span> <span className="text-sky-300">client</span>.<span className="text-amber-400 font-semibold">sendMessage</span>({`{\n`}
                  {'      '}<span className="text-violet-400">sessionId</span>: <span className="text-emerald-400">'6281234567890'</span>,{"\n"}
                  {'      '}<span className="text-violet-400">message</span>: <span className="text-emerald-400">'Hallo. Selamat siang'</span>,{"\n"}
                  {'      '}<span className="text-violet-400">user</span>: {`{`} <span className="text-slate-500">// Optional</span>{"\n"}
                  {'       '}<span className="text-violet-400">name</span>: <span className="text-emerald-400">'Bilqis'</span>,{"\n"}
                  {'       '}<span className="text-violet-400">externalId</span>: <span className="text-emerald-400">'berry_1234'</span>,{"\n"}
                  {'       '}<span className="text-violet-400">email</span>: <span className="text-emerald-400">'example@gmail.com'</span>,{"\n"}
                  {`}`},{"\n"}
                  {'    '}{`}`});{"\n\n"}
                  {'    '}<span className="text-sky-300">console</span>.<span className="text-amber-400">log</span>(<span className="text-emerald-400">'Berhasil:'</span>, <span className="text-sky-300">response</span>);{"\n"}
                  {'  '}{`}`} <span className="text-violet-400 font-semibold">catch</span> (<span className="text-sky-300">error</span>) {`{\n`}
                  {'    '}<span className="text-sky-300">console</span>.<span className="text-amber-400">error</span>(<span className="text-emerald-400">'Gagal:'</span>, <span className="text-sky-300">error</span>);{"\n"}
                  {'  '}{`}\n`}
                  {`}\n\n`}
                  <span className="text-sky-300">main</span>();
                </>
              ) : (
                <>
                  <span className="text-amber-400 font-semibold">curl</span>{" "}
                  <span className="text-violet-400">-X POST</span>{" "}
                  <span className="text-emerald-400">"{baseUrlMessageGateway}/YOUR_BERRY_SWEET_KEY_PREFIX/sendMessage"</span> \{'\n'}
                  {'  '}<span className="text-violet-400">-H</span> <span className="text-sky-300">"apikey: YOUR_BERRY_SWEET_API_KEY"</span> \{'\n'}
                  {'  '}<span className="text-violet-400">-H</span> <span className="text-sky-300">"Content-Type: application/json"</span> \{'\n'}
                  {'  '}<span className="text-violet-400">-d</span> <span className="text-slate-300">'&#123;'</span>{'\n'}
                  {'    '}<span className="text-sky-300">"message"</span>: <span className="text-emerald-300">"Halo, tes koneksi chatbot!"</span>,{'\n'}
                  {'    '}<span className="text-sky-300">"sessionId"</span>: <span className="text-emerald-300">"6281234567890"</span>,{'\n'}
                  {'    '}<span className="text-sky-300">"user"</span>: &#123;{'\n'}
                  {'      '}<span className="text-sky-300">"externalId"</span>: <span className="text-emerald-300">"123131"</span>,{'\n'}
                  {'      '}<span className="text-sky-300">"name"</span>: <span className="text-emerald-300">"Bilqis"</span>,{'\n'}
                  {'      '}<span className="text-sky-300">"email"</span>: <span className="text-emerald-300">"example@gmail.com"</span>{'\n'}
                  {'    '}&#125;{'\n'}
                  {'  '}<span className="text-slate-300">'&#125;'</span>
                </>
              )}
            </code>
          </pre>
        </div>
      </motion.div>

      {/* Footer Navigation */}
      <motion.div variants={itemVariants} className="pt-6 border-t border-border/40 flex items-center justify-between">
        <Link
          href="/docs"
          className="group flex items-center gap-3 p-3 px-4 rounded-xl border border-border/60 bg-card/40 hover:bg-card hover:border-emerald-500/40 transition-all duration-200"
        >
          <div className="text-left">
            <span className="block text-[10px] uppercase font-bold tracking-wider text-muted-foreground/70">Previous</span>
            <span className="text-xs font-semibold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Overview</span>
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