"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Bot, ArrowRight, Zap, ShieldCheck, Code, Menu, Sparkles } from 'lucide-react';
import { Card } from '../components/Cards';
import { Btn, LinkHref } from '../components/Button';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
    const router = useRouter();
    return (
        <div className="min-h-screen w-full bg-background text-foreground selection:bg-primary/20 font-sans relative overflow-x-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full filter blur-[100px] -z-10" />
            <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-violet-500/10 rounded-full filter blur-[100px] -z-10" />

            <main className="max-w-5xl mx-auto px-6 pt-24 pb-16 text-center space-y-10 relative z-10">
                <div className="space-y-5 max-w-3xl mx-auto">
                    {/* <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50 text-[11px] font-medium text-muted-foreground mb-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        v2.0 Beta Access Available
                    </div> */}

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.15]">
                        Scale up WhatsApp with <br className="hidden sm:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-500">
                            AI Automation.
                        </span>
                    </h1>

                    <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
                        Isolate client workflows inside secured Workspaces, train RAG models with customized knowledge bases, and control your token budget smoothly.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <LinkHref href='/login' variant="primary" icon={ArrowRight} className="w-full sm:w-auto h-10 px-6 font-semibold shadow-md shadow-primary/20">
                        Start Building Now
                    </LinkHref>
                    <a href='/docs' className="inline-flex items-center font-medium rounded-lg transition-colors duration-150 bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border w-full sm:w-auto h-10 px-6 font-medium bg-muted/30 border-border/60 hover:bg-muted/80">
                        <Code className="w-4 h-4 mr-2" /> Read the Docs
                    </a>
                </div>

                {/* Hero Interactive Showcase / Animation */}
                <div className="pt-12">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="relative mx-auto max-w-2xl bg-card border border-border/60 rounded-2xl p-2 shadow-2xl shadow-primary/5"
                    >
                        <div className="bg-muted/20 rounded-xl p-6 sm:p-8 border border-border/40 text-left flex flex-col sm:flex-row gap-6 items-center">

                            {/* Floating Element Sama Seperti Form Login */}
                            <motion.div
                                animate={{ y: [0, -8, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="bg-background border border-border/80 p-4 rounded-xl shadow-lg w-full max-w-[240px] flex-shrink-0"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                                        <Bot className="w-4 h-4 text-violet-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-xs text-foreground">RAG Engine Active</h4>
                                        <p className="text-[10px] text-muted-foreground">Connected to Local LLM</p>
                                    </div>
                                </div>
                                <div className="space-y-2 mt-4">
                                    <div className="h-2 w-full bg-muted rounded-full" />
                                    <div className="h-2 w-2/3 bg-muted rounded-full" />
                                </div>
                            </motion.div>

                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold tracking-tight text-foreground">Smart Automated Workspace</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Your local LLMs & Official Meta APIs are seamlessly connected to provide 24/7 autonomous responses directly from your server.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>

            {/* Features Section */}
            <section id="features" className="max-w-5xl mx-auto px-6 py-20 border-t border-border/40 relative z-10">
                <div className="text-center mb-12 space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-1">
                        <Sparkles className="w-3 h-3" /> Key Capabilities
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                        Engineered for High Performance
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                        Bangun, deploy, dan kelola alur otomatisasi WhatsApp & AI tanpa kerumitan infrastruktur backend.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <Card className="p-6 bg-card/60 backdrop-blur-sm border border-border/70 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5 group">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
                            <MessageSquare className="w-5 h-5 text-emerald-500" />
                        </div>
                        <h3 className="text-sm font-bold text-foreground mb-1.5 flex items-center gap-2">
                            WhatsApp & REST API
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Integrasikan instance WhatsApp secara langsung dengan HTTP REST API untuk pengiriman pesan otomatis dan webhook trigger real-time.
                        </p>
                    </Card>

                    <Card className="p-6 bg-card/60 backdrop-blur-sm border border-border/70 hover:border-violet-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/5 group">
                        <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4 group-hover:bg-violet-500/20 transition-colors">
                            <Bot className="w-5 h-5 text-violet-500" />
                        </div>
                        <div className="flex items-center justify-between mb-1.5">
                            <h3 className="text-sm font-bold text-foreground">
                                Google AI Studio Power
                            </h3>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                                OpenAI Soon
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Didukung oleh model Gemini via Google AI Studio untuk pemrosesan konteks tinggi, RAG, dan respon cerdas yang presisi.
                        </p>
                    </Card>

                    <Card className="p-6 bg-card/60 backdrop-blur-sm border border-border/70 hover:border-sky-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-sky-500/5 group">
                        <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mb-4 group-hover:bg-sky-500/20 transition-colors">
                            <ShieldCheck className="w-5 h-5 text-sky-500" />
                        </div>
                        <h3 className="text-sm font-bold text-foreground mb-1.5">
                            Multi-tenant Isolation
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Isolasi data klien dan sesi WhatsApp secara aman dalam Workspace terpisah dengan pengelolaan API key dan kuota token mandiri.
                        </p>
                    </Card>
                </div>
            </section>
        </div>
    );
}