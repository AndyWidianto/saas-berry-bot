"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import {
    ChevronRight,
    Inbox,
    Check,
    Copy,
    ArrowRight,
    ShieldCheck,
    Code2,
    Globe,
    Filter,
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

export default function GetMessagesPage() {
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [fetchMethod, setFetchMethod] = useState<"sdk" | "curl">("sdk");

    const handleCopy = (code: string, id: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(id);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const sdkGetMessagesCode = `import { BerrySweet } from 'berry-sweet';

    const client = new BerrySweet({
    prefixKey: 'bs_live',
    apiKey: process.env.BERRY_SWEET_API_KEY,
    });

    async function main() {
    try {
        // Mengambil riwayat pesan berdasarkan workspace & nomor HP
        const response = await client.getMessages({
        phone: '6281234567890', // Opsional: filter berdasarkan nomor
        options: {
            limit: 20,                                        // Opsional: jumlah pesan (default: 50)
            cursor: "wieowiemeqwfmgrooerpr",                 // Opsional: halaman pagination
        }
    });

        console.log('Daftar Pesan:', response.data);
    } catch (error) {
        console.error('Gagal mengambil pesan:', error);
    }
    }

    main();`;

    const curlGetMessagesCode = `curl -X GET "http://localhost:10001/api/chatbot/getMessages?workspaceId=ws_123456&phone=6281234567890&limit=20&page=1" \\
  -H "Authorization: Bearer YOUR_BERRY_SWEET_API_KEY" \\
  -H "x-prefix-key: bs_live"`;

    const jsonResponseCode = `{
        "success":true,
        "data":[
            {
                "id":"c75cf0c2-a50a-4715-8a5a-26bd5110f7fc",
                "platform":"API",
                "providerMessageId":null,
                "fromMe":true,
                "senderId":"1213131",
                "senderName":"Sarah",
                "content":"Halo, selamat siang! Senang sekalibisa bertemu dengan Anda hari ini. Ada yang bisa saya bantu atau ada pertanyaan yang ingin Anda ajukan terkait pengalaman atau kualifikasi saya? Semuanya akan mudah pada akhirnya.",
                "type":"text",
                "mediaUrl":null,
                "workspaceId":"bfdc1eba-73cc-4a38-9ad0-603420d72fc5",
                "contactId":null,
                "status":"sent",
                "createdAt":"2026-08-24T14:43:27.854Z",
                "updatedAt":"2026-08-24T14:43:27.854Z"
            },
            {
                "id":"8ac97606-3493-493f-9f7b-ec96db835c2e",
                "platform":"API",
                "providerMessageId":null,
                "fromMe":false,
                "senderId":"berry_1213131",
                "senderName":"Sarah",
                "content":"Hallo, selamat siang",
                "type":"text",
                "mediaUrl":null,
                "workspaceId":"bfdc1eba-73cc-4a38-9ad0-603420d72fc5",
                "contactId":"d053a0c9-bd40-451d-a264-0bdc9f5ed645",
                "status":"read",
                "createdAt":"2026-08-24T14:43:23.470Z",
                "updatedAt":"2026-08-24T14:43:23.470Z"
            }
        ],
        "total": 2,
        "totalPage":1,
        "pagination": {
            "nextCursor":null,
            "hasMore":false
        }
    }`;

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
                <span className="text-foreground font-medium">Get Messages</span>
            </motion.div>

            {/* Header Section */}
            <motion.div variants={itemVariants} className="space-y-3 border-b border-border/40 pb-6 sm:pb-8">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <Inbox className="w-3 h-3" /> API & Integration
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                    Fetch Messages History
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
                    Ambil riwayat obrolan dari WhatsApp percakapan pengguna menggunakan method SDK <code className="text-xs font-mono font-semibold">.getMessages()</code> atau endpoint REST API.
                </p>
            </motion.div>

            {/* Code Example Section */}
            <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-base sm:text-lg font-bold text-foreground">
                        Penggunaan Kode
                    </h2>

                    {/* Toggle SDK / cURL */}
                    <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border/60 font-sans">
                        <button
                            onClick={() => setFetchMethod("sdk")}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${fetchMethod === "sdk"
                                    ? "bg-background text-foreground shadow-sm font-semibold"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            <Code2 className="w-3.5 h-3.5" />
                            <span>Node.js SDK</span>
                        </button>
                        <button
                            onClick={() => setFetchMethod("curl")}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${fetchMethod === "curl"
                                    ? "bg-background text-foreground shadow-sm font-semibold"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            <Globe className="w-3.5 h-3.5" />
                            <span>cURL API</span>
                        </button>
                    </div>
                </div>

                {/* Dark Terminal Block */}
                <div className="relative bg-slate-950 text-slate-50 border border-slate-800 rounded-xl overflow-hidden font-mono text-xs shadow-xl">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/80 text-slate-400 text-[11px]">
                        <span className="font-sans font-medium text-slate-300">
                            {fetchMethod === "sdk" ? "getMessages.ts" : "GET /api/chatbot/getMessages"}
                        </span>
                        <button
                            onClick={() =>
                                handleCopy(
                                    fetchMethod === "sdk" ? sdkGetMessagesCode : curlGetMessagesCode,
                                    "code_block"
                                )
                            }
                            className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-all active:scale-95"
                        >
                            {copiedCode === "code_block" ? (
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
                            {fetchMethod === "sdk" ? (
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
                                    {'  '}<span className="text-violet-400 font-semibold">try</span> {`{\n`}
                                    {'    '}<span className="text-slate-500">// Mengambil riwayat pesan</span>{"\n"}
                                    {'    '}<span className="text-violet-400 font-semibold">const</span> <span className="text-sky-300">response</span> = <span className="text-violet-400 font-semibold">await</span> <span className="text-sky-300">client</span>.<span className="text-amber-400 font-semibold">getMessages</span>({`{\n`}
                                    {'      '}<span className="text-violet-400">phone</span>: <span className="text-emerald-400">'6281234567890'</span>,{"\n"}
                                    {'      '}<span className="text-violet-400">options</span>: {`{\n`}
                                    {'       '}<span className="text-violet-400">limit</span>: <span className="text-amber-300">20</span>,{"\n"}
                                    {'       '}<span className="text-violet-400">cursor</span>: <span className="text-amber-300">'exswerwecfkoew'</span>,{"\n"}
                                    {'    '}{`}`}{`}`});{"\n\n"}
                                    {'    '}<span className="text-sky-300">console</span>.<span className="text-amber-400">log</span>(<span className="text-emerald-400">'Daftar Pesan:'</span>, <span className="text-sky-300">response</span>.<span className="text-sky-300">data</span>);{"\n"}
                                    {'  '}{`}`} <span className="text-violet-400 font-semibold">catch</span> (<span className="text-sky-300">error</span>) {`{\n`}
                                    {'    '}<span className="text-sky-300">console</span>.<span className="text-amber-400">error</span>(<span className="text-emerald-400">'Gagal:'</span>, <span className="text-sky-300">error</span>);{"\n"}
                                    {'  '}{`}\n`}
                                    {`}\n\n`}
                                    <span className="text-sky-300">main</span>();
                                </>
                            ) : (
                                <>
                                    <span className="text-amber-400 font-semibold">curl</span> <span className="text-violet-400">-X GET</span> <span className="text-emerald-400">"{baseUrlMessageGateway}/YOUR_BERRY_SWEET_KEY_PREFIX/getMessages?phone=6281234567890&limit=20&page=1"</span> \{'\n'}
                                    {'  '}<span className="text-violet-400">-H</span> <span className="text-sky-300">"apikey: YOUR_BERRY_SWEET_API_KEY"</span> {'\n'}
                                </>
                            )}
                        </code>
                    </pre>
                </div>
            </motion.div>

            {/* Query Parameters Table */}
            <motion.div variants={itemVariants} className="space-y-3">
                <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                    <Filter className="w-4 h-4 text-emerald-500" />
                    Query Parameters
                </h2>

                <div className="overflow-x-auto rounded-xl border border-border/60">
                    <table className="w-full text-left text-xs sm:text-sm border-collapse">
                        <thead>
                            <tr className="border-b border-border/60 bg-muted/40 text-muted-foreground font-semibold">
                                <th className="p-3 sm:p-3.5">Parameter</th>
                                <th className="p-3 sm:p-3.5">Tipe</th>
                                <th className="p-3 sm:p-3.5">Wajib</th>
                                <th className="p-3 sm:p-3.5">Deskripsi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40 text-foreground/90">
                            <tr>
                                <td className="p-3 sm:p-3.5 font-mono text-emerald-600 dark:text-emerald-400 font-medium">phone</td>
                                <td className="p-3 sm:p-3.5 font-mono text-muted-foreground text-xs">string</td>
                                <td className="p-3 sm:p-3.5 text-xs font-semibold text-amber-600 dark:text-amber-400">Ya</td>
                                <td className="p-3 sm:p-3.5 text-xs text-muted-foreground">Filter pesan berdasarkan nomor pengirim (format: 628xxx).</td>
                            </tr>
                            <tr>
                                <td className="p-3 sm:p-3.5 font-mono text-emerald-600 dark:text-emerald-400 font-medium">limit</td>
                                <td className="p-3 sm:p-3.5 font-mono text-muted-foreground text-xs">number</td>
                                <td className="p-3 sm:p-3.5 text-xs text-muted-foreground">Opsional</td>
                                <td className="p-3 sm:p-3.5 text-xs text-muted-foreground">Jumlah pesan yang diambil (default: 50, max: 100).</td>
                            </tr>
                            <tr>
                                <td className="p-3 sm:p-3.5 font-mono text-emerald-600 dark:text-emerald-400 font-medium">cursor</td>
                                <td className="p-3 sm:p-3.5 font-mono text-muted-foreground text-xs">string</td>
                                <td className="p-3 sm:p-3.5 text-xs text-muted-foreground">Opsional</td>
                                <td className="p-3 sm:p-3.5 text-xs text-muted-foreground">ID halaman untuk pagination.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Example Response Section */}
            <motion.div variants={itemVariants} className="space-y-3">
                <h2 className="text-base sm:text-lg font-bold text-foreground">
                    Contoh Respon (200 OK)
                </h2>

                <div className="relative bg-slate-950 text-slate-50 border border-slate-800 rounded-xl overflow-hidden font-mono text-xs shadow-xl">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/80 text-slate-400 text-[11px]">
                        <span className="font-sans font-medium text-slate-300">Response JSON</span>
                        <button
                            onClick={() => handleCopy(jsonResponseCode, "json_response")}
                            className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-all active:scale-95"
                        >
                            {copiedCode === "json_response" ? (
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
                            <span className="text-sky-300">{jsonResponseCode}</span>
                        </code>
                    </pre>
                </div>
            </motion.div>

            {/* Footer Navigation */}
            <motion.div variants={itemVariants} className="pt-6 border-t border-border/40 flex items-center justify-between">
                <Link
                    href="/docs/messages/send"
                    className="group flex items-center gap-3 p-3 px-4 rounded-xl border border-border/60 bg-card/40 hover:bg-card hover:border-emerald-500/40 transition-all duration-200"
                >
                    <div className="text-left">
                        <span className="block text-[10px] uppercase font-bold tracking-wider text-muted-foreground/70">Previous</span>
                        <span className="text-xs font-semibold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Send Messages</span>
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