'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  KeyRound,
  ShieldCheck,
  ChevronRight,
  Terminal,
  Copy,
  Check,
  Code2,
  Globe,
  ArrowRight,
  Info,
  AlertTriangle,
} from 'lucide-react';
import { baseUrlMessageGateway } from '@/lib/shared/shared';

const containerVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export default function ApiKeysDocPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [authMethod, setAuthMethod] = useState<'curl' | 'node'>('curl');

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const curlExample = `curl -X GET "${baseUrlMessageGateway}/workspaces" \\
  -H "apikey: evw_live_98a7sdf687asd6" \\
  -H "Content-Type: application/json"`;

  const nodeExample = `import axios from 'axios';

const response = await axios.get('${baseUrlMessageGateway}/workspaces', {
  headers: {
    'apikey': process.env.BERRY_SWEET_API_KEY || 'evw_live_98a7sdf687asd6',
    'Content-Type': 'application/json'
  }
});

console.log(response.data);`;

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
        <span className="text-foreground font-medium">API Keys & Auth</span>
      </motion.div>

      {/* Header Section */}
      <motion.div variants={itemVariants} className="space-y-3 border-b border-border/40 pb-6 sm:pb-8">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <KeyRound className="w-3 h-3" /> Authentication Standard
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          API Key Access & Authentication
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
          Akses seluruh endpoint API Berry Sweet untuk mengirim pesan, mengambil riwayat chat, hingga manajemen workspace secara aman menggunakan <code className="text-xs font-mono font-semibold">apikey</code> header.
        </p>
      </motion.div>

      {/* Step 1: Membuat API Key */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/20">
            1
          </div>
          <h2 className="text-base sm:text-lg font-bold text-foreground">
            Cara Membuat API Key Baru
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Sebelum melakukan integrasi, Anda perlu membuat kredensial API Key melalui Dashboard pengguna:
        </p>

        {/* Steps List Card */}
        <div className="bg-card/50 border border-border/60 rounded-xl p-4 sm:p-5 space-y-3 text-xs sm:text-sm">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-md bg-muted flex items-center justify-center font-semibold text-xs text-foreground shrink-0 mt-0.5">a</div>
            <span className="text-muted-foreground">Buka menu <strong className="text-foreground">Integration</strong> &rarr; <strong className="text-foreground">API Keys</strong> pada Dashboard Berry Sweet.</span>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-md bg-muted flex items-center justify-center font-semibold text-xs text-foreground shrink-0 mt-0.5">b</div>
            <span className="text-muted-foreground">Klik tombol <strong className="text-foreground">Create New Key</strong> dan tentukan nama identitas key (misal: <code className="text-xs font-mono">Production-Bot</code>).</span>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-md bg-muted flex items-center justify-center font-semibold text-xs text-foreground shrink-0 mt-0.5">c</div>
            <span className="text-muted-foreground">Salin token API Key yang tertera dan simpan di environment variable (<code className="text-xs font-mono">.env</code>) Anda.</span>
          </div>
        </div>

        {/* Warning Box */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs sm:text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Simpan API Key di Tempat Safe/Server-side</p>
            <p className="text-muted-foreground text-[11px] sm:text-xs leading-relaxed">
              API Key memiliki wewenang penuh pada Workspace Anda. Jangan pernah mengekspos API Key ke kode client-side/frontend publik (seperti React JS tanpa backend proxy).
            </p>
          </div>
        </div>
      </motion.div>

      {/* Step 2: Otentikasi Header */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/20">
            2
          </div>
          <h2 className="text-base sm:text-lg font-bold text-foreground">
            Penggunaan pada HTTP Request Header
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Sertakan API Key pada setiap HTTP Request menggunakan custom header <code className="text-xs font-mono font-semibold">apikey</code>:
        </p>

        {/* Code Snippet Box */}
        <div className="relative bg-slate-950 text-slate-50 border border-slate-800 rounded-xl overflow-hidden font-mono text-xs shadow-xl">
          {/* Header Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 border-b border-slate-800 bg-slate-900/80 text-slate-400 text-[11px]">
            <div className="flex items-center gap-2 font-sans">
              <button
                onClick={() => setAuthMethod('curl')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  authMethod === 'curl'
                    ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>cURL</span>
              </button>

              <button
                onClick={() => setAuthMethod('node')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  authMethod === 'node'
                    ? 'bg-slate-200 text-slate-900 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Node.js / Axios</span>
              </button>
            </div>

            <button
              onClick={() => handleCopy(authMethod === 'curl' ? curlExample : nodeExample, 'step2')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-all active:scale-95 ml-auto"
            >
              {copiedCode === 'step2' ? (
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

          {/* Code View */}
          <pre className="p-4 sm:p-5 overflow-x-auto leading-relaxed font-mono text-slate-200 bg-slate-950">
            <code>
              {authMethod === 'curl' ? (
                <>
                  <span className="text-amber-400 font-semibold">curl</span> <span className="text-violet-400">-X GET</span> <span className="text-emerald-400">"{baseUrlMessageGateway}/YOUR_BERRY_SWEET_KEY_PREFIX/messages"</span> \{'\n'}
                  {'  '}<span className="text-violet-400">-H</span> <span className="text-sky-300">"apikey: YOUR_BERRY_SWEET_API_KEY"</span> \{'\n'}
                  {'  '}<span className="text-violet-400">-H</span> <span className="text-sky-300">"Content-Type: application/json"</span>
                </>
              ) : (
                <>
                  <span className="text-violet-400 font-semibold">import</span> <span className="text-slate-100">axios</span> <span className="text-violet-400 font-semibold">from</span> <span className="text-emerald-400">'axios'</span>;{'\n\n'}
                  <span className="text-violet-400 font-semibold">const</span> <span className="text-sky-300">response</span> = <span className="text-violet-400 font-semibold">await</span> <span className="text-sky-300">axios</span>.<span className="text-amber-400">get</span>(<span className="text-emerald-400">'{baseUrlMessageGateway}/YOUR_BERRY_SWEET_KEY_PREFIX/messages'</span>, &#123;{'\n'}
                  {'  '}<span className="text-violet-400">headers</span>: &#123;{'\n'}
                  {'    '}<span className="text-emerald-400">'apikey'</span>: <span className="text-sky-300">process</span>.<span className="text-sky-300">env</span>.<span className="text-amber-300">BERRY_SWEET_API_KEY</span>,{'\n'}
                  {'    '}<span className="text-emerald-400">'Content-Type'</span>: <span className="text-emerald-400">'application/json'</span>{'\n'}
                  {'  '}&#125;{'\n'}
                  &#125;);{'\n\n'}
                  <span className="text-sky-300">console</span>.<span className="text-amber-400">log</span>(<span className="text-sky-300">response</span>.<span className="text-sky-300">data</span>);
                </>
              )}
            </code>
          </pre>
        </div>
      </motion.div>

      {/* Footer Navigation */}
      <motion.div variants={itemVariants} className="pt-6 border-t border-border/40 flex items-center justify-between">
        <Link
          href="/docs/quickstart"
          className="group flex items-center gap-3 p-3 px-4 rounded-xl border border-border/60 bg-card/40 hover:bg-card hover:border-emerald-500/40 transition-all duration-200"
        >
          <div className="text-left">
            <span className="block text-[10px] uppercase font-bold tracking-wider text-muted-foreground/70">Previous</span>
            <span className="text-xs font-semibold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Quickstart Guide</span>
          </div>
        </Link>

        <Link
          href="/docs/send-message"
          className="group flex items-center gap-3 p-3 px-4 rounded-xl border border-border/60 bg-card/40 hover:bg-card hover:border-emerald-500/40 transition-all duration-200"
        >
          <div className="text-right">
            <span className="block text-[10px] uppercase font-bold tracking-wider text-muted-foreground/70">Next Page</span>
            <span className="text-xs font-semibold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Send Message Endpoint</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
            <ArrowRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:text-white transition-colors" />
          </div>
        </Link>
      </motion.div>
    </motion.div>
  );
}