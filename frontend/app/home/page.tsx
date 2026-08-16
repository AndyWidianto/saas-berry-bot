"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Bot, ArrowRight, Zap, ShieldCheck, Code, Menu } from 'lucide-react';
import { Card } from '../components/Cards';
import { Btn } from '../components/Button';

export default function LandingPage() {
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
                        Scale up WhatsApp with <br className="hidden sm:block"/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-500">
                            AI Automation.
                        </span>
                    </h1>
                    
                    <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
                        Isolate client workflows inside secured Workspaces, train RAG models with customized knowledge bases, and control your token budget smoothly.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Btn variant="primary" icon={ArrowRight} className="w-full sm:w-auto h-10 px-6 font-semibold shadow-md shadow-primary/20">
                        Start Building Now
                    </Btn>
                    <Btn variant="secondary" className="w-full sm:w-auto h-10 px-6 font-medium bg-muted/30 border-border/60 hover:bg-muted/80">
                        <Code className="w-4 h-4 mr-2" /> Read the Docs
                    </Btn>
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
            <section id="features" className="max-w-5xl mx-auto px-6 py-24 border-t border-border/30">
                <div className="text-center mb-14">
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Engineered for Performance</h2>
                    <p className="text-xs text-muted-foreground mt-2 max-w-sm mx-auto">Build, deploy, and scale your automated workflows without backend complexity.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Menggunakan komponen Card yang direquest */}
                    <Card className="p-5 bg-card border border-border/60 hover:border-primary/50 transition-colors group">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                            <Zap className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="text-sm font-semibold text-foreground mb-1.5">Omnichannel Inbox</h3>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                            Combine WhatsApp, Telegram, and Webhook events into one unified dashboard interface.
                        </p>
                    </Card>

                    <Card className="p-5 bg-card border border-border/60 hover:border-violet-500/50 transition-colors group">
                        <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center mb-4 group-hover:bg-violet-500/20 transition-colors">
                            <Bot className="w-5 h-5 text-violet-500" />
                        </div>
                        <h3 className="text-sm font-semibold text-foreground mb-1.5">Local LLM Connect</h3>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                            Easily connect DeepSeek or Llama via Ollama for private, fast, and offline AI processing.
                        </p>
                    </Card>

                    <Card className="p-5 bg-card border border-border/60 hover:border-emerald-500/50 transition-colors group">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
                            <ShieldCheck className="w-5 h-5 text-emerald-500" />
                        </div>
                        <h3 className="text-sm font-semibold text-foreground mb-1.5">Multi-tenant Ready</h3>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                            Isolate client data strictly. Robust architecture with dedicated token budgets per workspace.
                        </p>
                    </Card>
                </div>
            </section>

            {/* Footer Minimalis */}
            <footer className="border-t border-border/40">
                <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-primary" />
                        <span className="font-semibold text-xs text-foreground tracking-tight">Evolve WA</span>
                    </div>
                    <div className="flex items-center gap-6 text-[11px] font-medium text-muted-foreground">
                        <a href="#" className="hover:text-foreground">Terms</a>
                        <a href="#" className="hover:text-foreground">Privacy</a>
                        <a href="#" className="hover:text-foreground">Status</a>
                    </div>
                    <div className="text-[11px] text-muted-foreground/60">
                        © {new Date().getFullYear()} Evolve Platform. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}