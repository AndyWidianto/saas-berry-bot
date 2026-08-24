"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import {
    ArrowRight,
    Bot,
    Terminal,
    Zap,
    ShieldCheck,
    Copy,
    Check,
    ChevronRight,
    Sparkles,
    BookOpen,
    Globe,
    MessageSquare,
    Database,
    Key
} from 'lucide-react';
import { Card } from '../components/Cards';
import { baseUrlMessageGateway } from '@/lib/shared/shared';

// Variants untuk animasi Framer Motion
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: "easeOut" }
    },
} as Variants;

export default function DocsOverviewPage() {
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<'pnpm' | 'npm' | 'yarn' | 'bun' | 'curl'>('pnpm');

    // Multi-package manager & cURL commands mapping
    const commands = {
        pnpm: 'pnpm add berry-sweet',
        npm: 'npm install berry-sweet',
        yarn: 'yarn add berry-sweet',
        bun: 'bun add berry-sweet',
        curl: `curl -X POST "http://localhost:10001/api/chatbot" \\
            -H "Content-Type: application/json" \\
            -d '{
                "message": "Halo, tes koneksi chatbot!",
                "sender": "6281234567890",
                "workspaceId": "ws-dummy-123"
            }'`
    };

    const currentCode = commands[activeTab];
    const codeSnippet = `git clone https://github.com/evolve-wa/platform.git\ncd platform\ndocker compose up -d`;

    const handleCopy = () => {
        navigator.clipboard.writeText(codeSnippet);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

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
                <span className="text-foreground font-medium">Overview</span>
            </motion.div>

            {/* Header Section */}
            <motion.div variants={itemVariants} className="space-y-3 border-b border-border/40 pb-6 sm:pb-8">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    Berry Sweet
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text">
                    Berry Sweet Documentation
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
                    Solusi Chatbot AI WhatsApp terintegrasi. Olah pesan otomatis, jalankan vector embedding data pengetahuan, dan manfaatkan API Key untuk mengirim serta mengambil pesan secara fleksibel.
                </p>
            </motion.div>

            {/* Quick Cards Grid */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link href="/docs/whatsapp-connect">
                    <Card className="p-5 bg-card/60 backdrop-blur-sm border border-border/60 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 group cursor-pointer h-full relative overflow-hidden">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-all">
                            <MessageSquare className="w-4 h-4 text-emerald-500" />
                        </div>
                        <h3 className="text-sm font-bold text-foreground mb-1 group-hover:text-emerald-500 transition-colors">
                            WhatsApp Integration
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Hubungkan nomor WhatsApp untuk merespons pesan pelanggan secara otomatis.
                        </p>
                    </Card>
                </Link>

                <Link href="/docs/embeddings">
                    <Card className="p-5 bg-card/60 backdrop-blur-sm border border-border/60 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-300 group cursor-pointer h-full relative overflow-hidden">
                        <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-all">
                            <Database className="w-4 h-4 text-violet-500" />
                        </div>
                        <h3 className="text-sm font-bold text-foreground mb-1 group-hover:text-violet-500 transition-colors">
                            Vector Embedding
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Simpan dan indeks dokumen basis pengetahuan untuk melatih Chatbot AI.
                        </p>
                    </Card>
                </Link>

                <Link href="/docs/api-keys">
                    <Card className="p-5 bg-card/60 backdrop-blur-sm border border-border/60 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group cursor-pointer h-full relative overflow-hidden">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-all">
                            <Key className="w-4 h-4 text-primary" />
                        </div>
                        <h3 className="text-sm font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                            API Key Access
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Akses endpoint API untuk kirim pesan, fetch history, dan manajemen workspace.
                        </p>
                    </Card>
                </Link>
            </motion.div>

            {/* Section: Installation / Quick Commands */}
            <motion.div variants={itemVariants} className="space-y-4">
                {/* Header Title */}
                <div className="flex items-center gap-2">
                    <div className="p-1 rounded-md bg-primary/10 text-primary">
                        <Terminal className="w-4 h-4" />
                    </div>
                    <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                        Quick Installation & API Usage
                    </h2>
                </div>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Pilih package manager favorit Anda untuk menginstal SDK Berry Sweet, atau gunakan cURL endpoint dengan API Key Anda:
                </p>

                {/* Terminal / Code Block Component */}
                <div className="relative bg-slate-950 text-slate-50 border border-slate-800 rounded-xl overflow-hidden font-mono text-xs shadow-xl">
                    {/* Top Control Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 border-b border-slate-800 bg-slate-900/80 text-slate-400 text-[11px]">
                        {/* Left Window Controls & Package Tabs */}
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 hidden sm:flex">
                                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                            </div>

                            {/* Tab Buttons */}
                            <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 font-sans">
                                <button
                                    onClick={() => setActiveTab("curl")}
                                    className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium transition-all ${activeTab === "curl"
                                        ? "bg-emerald-600 text-white shadow-sm"
                                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                                        }`}
                                >
                                    <Globe className="w-3 h-3" />
                                    <span>cURL API</span>
                                </button>

                                <span className="w-px h-3 bg-slate-800 mx-0.5" />

                                {(["pnpm", "npm", "yarn", "bun"] as const).map((pkg) => (
                                    <button
                                        key={pkg}
                                        onClick={() => setActiveTab(pkg)}
                                        className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-all ${activeTab === pkg
                                            ? "bg-slate-200 text-slate-900 shadow-sm font-semibold"
                                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                                            }`}
                                    >
                                        {pkg}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Copy Button */}
                        <button
                            onClick={handleCopy}
                            aria-label="Copy code to clipboard"
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-all active:scale-95 ml-auto"
                        >
                            {copied ? (
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
                            {activeTab === "curl" ? (
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
                            ) : (
                                <>
                                    <span className="text-violet-400 font-semibold">
                                        {activeTab === "npm" ? "npm install" : activeTab === "yarn" ? "yarn add" : activeTab === "pnpm" ? "pnpm add" : "bun add"}
                                    </span>{" "}
                                    <span className="text-emerald-400">berry-sweet</span>
                                </>
                            )}
                        </code>
                    </pre>
                </div>
            </motion.div>

            {/* Section: Callout Box */}
            <motion.div
                variants={itemVariants}
                className="p-4 sm:p-5 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 dark:border-emerald-800/50 flex items-start gap-3.5 relative overflow-hidden"
            >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 dark:bg-emerald-900/50 border border-emerald-500/40 dark:border-emerald-700/50 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="space-y-1 text-xs sm:text-sm">
                    <h4 className="font-bold text-emerald-950 dark:text-emerald-100">
                        API Key & Authentication Security
                    </h4>
                    <p className="text-emerald-900/80 dark:text-emerald-200/80 leading-relaxed">
                        Setiap request API wajib menyertakan header{" "}
                        <code className="px-1.5 py-0.5 rounded bg-emerald-500/20 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-mono text-[11px] font-semibold border border-emerald-500/30 dark:border-emerald-700/50">
                            apikey: YOUR_API_KEY
                        </code>
                        . Jangan mengekspos API Key Berry Sweet Anda pada kode <em>client-side</em>.
                    </p>
                </div>
            </motion.div>

            {/* Footer Navigation Next Page */}
            <motion.div variants={itemVariants} className="pt-6 border-t border-border/40 flex items-center justify-end">
                <Link
                    href="/docs/quickstart"
                    className="group flex items-center gap-3 p-3 px-4 rounded-xl border border-border/60 bg-card/40 hover:bg-card hover:border-emerald-500/40 transition-all duration-200"
                >
                    <div className="text-right">
                        <span className="block text-[10px] uppercase font-bold tracking-wider text-muted-foreground/70">Next Page</span>
                        <span className="text-xs font-semibold text-foreground group-hover:text-emerald-500 transition-colors">Quickstart Guide</span>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
                        <ArrowRight className="w-4 h-4 text-emerald-500 group-hover:text-white transition-colors" />
                    </div>
                </Link>
            </motion.div>
        </motion.div>
    );
}