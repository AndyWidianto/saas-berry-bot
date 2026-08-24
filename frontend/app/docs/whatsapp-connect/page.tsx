"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import {
  ChevronRight,
  MessageSquare,
  QrCode,
  Layers,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Copy,
  Check,
  RefreshCw,
  Smartphone,
  Server,
  Zap,
} from "lucide-react";

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

export default function WhatsAppConnectPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const createWorkspaceApi = `curl -X POST "http://localhost:10001/api/workspaces/create" \\
  -H "Authorization: Bearer YOUR_BERRY_SWEET_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Toko Online Utama",
    "prefixKey": "bs_live"
  }'`;

  const getQrApi = `curl -X GET "http://localhost:10001/api/whatsapp/qr?workspaceId=ws_123456" \\
  -H "Authorization: Bearer YOUR_BERRY_SWEET_API_KEY"`;

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
        <span className="text-foreground font-medium">Connect WhatsApp</span>
      </motion.div>

      {/* Header Section */}
      <motion.div variants={itemVariants} className="space-y-3 border-b border-border/40 pb-6 sm:pb-8">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <MessageSquare className="w-3 h-3" /> WhatsApp Integration
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Menghubungkan Akun WhatsApp
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
          Panduan integrasi lengkap mulai dari pembuatan Workspace, inisialisasi instance WhatsApp, hingga proses scan QR Code.
        </p>
      </motion.div>

      {/* Step 1: Create Workspace */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/20">
            1
          </div>
          <h2 className="text-base sm:text-lg font-bold text-foreground">
            Buat Workspace Baru
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Setiap koneksi WhatsApp membutuhkan <strong className="text-foreground">Workspace</strong> sebagai kontainer isolasi bot dan pesan. Anda dapat membuatnya via Dashboard atau API:
        </p>

        {/* Dashboard Step Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
          <div className="p-3.5 rounded-xl border border-border/60 bg-card/50 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <Layers className="w-4 h-4 text-emerald-500" />
              <span>Opsi A: Via Dashboard</span>
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Buka menu <strong>Workspaces</strong> &rarr; Klik tombol <strong>+ Workspace Baru</strong> &rarr; Masukkan Nama Workspace.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-border/60 bg-card/50 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <Server className="w-4 h-4 text-emerald-500" />
              <span>Opsi B: Via API</span>
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Kirim request HTTP POST ke endpoint <code className="font-mono text-[11px]">/api/workspaces/create</code>.
            </p>
          </div>
        </div>

        {/* cURL Block for Workspace Creation */}
        <div className="relative bg-slate-950 text-slate-50 border border-slate-800 rounded-xl overflow-hidden font-mono text-xs shadow-xl">
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/80 text-slate-400 text-[11px]">
            <span className="font-sans font-medium text-slate-300">Create Workspace cURL</span>
            <button
              onClick={() => handleCopy(createWorkspaceApi, "ws_curl")}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-all active:scale-95"
            >
              {copiedCode === "ws_curl" ? (
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
          <pre className="p-4 overflow-x-auto text-slate-200 bg-slate-950 font-mono leading-relaxed">
            <code>
              <span className="text-amber-400 font-semibold">curl</span> <span className="text-violet-400">-X POST</span> <span className="text-emerald-400">"http://localhost:10001/api/workspaces/create"</span> \{'\n'}
              {'  '}<span className="text-violet-400">-H</span> <span className="text-sky-300">"Authorization: Bearer YOUR_BERRY_SWEET_API_KEY"</span> \{'\n'}
              {'  '}<span className="text-violet-400">-H</span> <span className="text-sky-300">"Content-Type: application/json"</span> \{'\n'}
              {'  '}<span className="text-violet-400">-d</span> <span className="text-slate-300">{`'{`}</span>{'\n'}
              {'    '}<span className="text-sky-300">"name"</span>: <span className="text-emerald-300">"Toko Online Utama"</span>,{'\n'}
              {'    '}<span className="text-sky-300">"prefixKey"</span>: <span className="text-emerald-300">"bs_live"</span>{'\n'}
              {'  '}<span className="text-slate-300">{`}'`}</span>
            </code>
          </pre>
        </div>
      </motion.div>

      {/* Step 2: Generate & Scan QR Code */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/20">
            2
          </div>
          <h2 className="text-base sm:text-lg font-bold text-foreground">
            Generate & Scan QR Code
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Setelah Workspace aktif, sistem akan menginisialisasi instance WhatsApp dan menampilkan QR Code untuk pemindaian.
        </p>

        {/* Scan Instruction Box */}
        <div className="p-4 sm:p-5 rounded-xl border border-border/60 bg-card/40 space-y-3">
          <h3 className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-500" />
            Langkah Pemindaian di Aplikasi WhatsApp Handphone:
          </h3>
          <ol className="list-decimal list-inside space-y-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <li>Buka aplikasi <strong>WhatsApp</strong> di HP Anda.</li>
            <li>Buka menu <strong>Pengaturan / Settings</strong> (iOS) atau titik tiga di kanan atas (Android).</li>
            <li>Pilih <strong>Perangkat Tertaut (Linked Devices)</strong> &rarr; klik <strong>Tautkan Perangkat</strong>.</li>
            <li>Arahkan kamera ke QR Code yang tampil di Dashboard Berry Sweet.</li>
          </ol>
        </div>

        {/* cURL Block for QR Code */}
        <div className="relative bg-slate-950 text-slate-50 border border-slate-800 rounded-xl overflow-hidden font-mono text-xs shadow-xl">
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/80 text-slate-400 text-[11px]">
            <span className="font-sans font-medium text-slate-300">Get QR Code Endpoint</span>
            <button
              onClick={() => handleCopy(getQrApi, "qr_curl")}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-all active:scale-95"
            >
              {copiedCode === "qr_curl" ? (
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
          <pre className="p-4 overflow-x-auto text-slate-200 bg-slate-950 font-mono leading-relaxed">
            <code>
              <span className="text-amber-400 font-semibold">curl</span> <span className="text-violet-400">-X GET</span> <span className="text-emerald-400">"http://localhost:10001/api/whatsapp/qr?workspaceId=ws_123456"</span> \{'\n'}
              {'  '}<span className="text-violet-400">-H</span> <span className="text-sky-300">"Authorization: Bearer YOUR_BERRY_SWEET_API_KEY"</span>
            </code>
          </pre>
        </div>
      </motion.div>

      {/* Step 3: Verifikasi Status Koneksi */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/20">
            3
          </div>
          <h2 className="text-base sm:text-lg font-bold text-foreground">
            Verifikasi Status Koneksi
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Setelah berhasil dipindai, status sesi akan berubah menjadi <span className="text-emerald-600 dark:text-emerald-400 font-semibold">CONNECTED</span>.
        </p>

        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-950/40 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div className="text-xs sm:text-sm">
            <span className="font-bold text-emerald-950 dark:text-emerald-100">Status: Connected</span>
            <p className="text-emerald-900/80 dark:text-emerald-200/80">
              WhatsApp Anda kini siap menerima pesan masuk dan melakukan pengiriman otomatis via API Berry Sweet.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Troubleshooting Alert */}
      <motion.div
        variants={itemVariants}
        className="p-4 sm:p-5 rounded-xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/30 dark:border-amber-800/50 flex items-start gap-3.5"
      >
        <div className="w-8 h-8 rounded-lg bg-amber-500/20 dark:bg-amber-900/50 border border-amber-500/40 dark:border-amber-700/50 flex items-center justify-center shrink-0 mt-0.5">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="space-y-1 text-xs sm:text-sm">
          <h4 className="font-bold text-amber-950 dark:text-amber-100">
            Kendala Pemindaian QR Code?
          </h4>
          <p className="text-amber-900/80 dark:text-amber-200/80 leading-relaxed">
            QR Code berlaku selama 45 detik. Jika waktu habis sebelum sempat dipindai, klik tombol <span className="font-semibold underline">Refresh QR Code</span> pada Dashboard untuk memperbarui sesi.
          </p>
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
            <span className="text-xs font-semibold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Quickstart</span>
          </div>
        </Link>

        <Link
          href="/docs/embeddings"
          className="group flex items-center gap-3 p-3 px-4 rounded-xl border border-border/60 bg-card/40 hover:bg-card hover:border-emerald-500/40 transition-all duration-200"
        >
          <div className="text-right">
            <span className="block text-[10px] uppercase font-bold tracking-wider text-muted-foreground/70">Next Page</span>
            <span className="text-xs font-semibold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Vector Embeddings</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
            <ArrowRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:text-white transition-colors" />
          </div>
        </Link>
      </motion.div>
    </motion.div>
  );
}