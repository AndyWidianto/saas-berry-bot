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
  Terminal,
} from "lucide-react";
import CodeBlock from "@/app/components/CodeBlock";

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

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const installCode = `pnpm add berry-sweet`;

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
        <CodeBlock />
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