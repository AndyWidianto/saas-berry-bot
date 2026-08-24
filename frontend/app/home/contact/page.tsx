"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Mail,
    MessageSquare,
    Send,
    MapPin,
    Phone,
    Clock,
    CheckCircle2,
    Bot
} from 'lucide-react';
import { Card } from '@/app/components/Cards';
import { Btn } from '@/app/components/Button';
import useAxios from '@/lib/axios-service';
import { toast } from 'sonner';
import axios from 'axios';

export default function ContactPage() {
    const { AxiosPublic } = useAxios();
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        workspace: '',
        message: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await AxiosPublic.post(`/contact/me`, formData);
            setSubmitted(true);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const message = err.response?.data.message || "Gagal delete knowledge";
                toast.error(message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-background text-foreground selection:bg-primary/20 font-sans relative overflow-x-hidden">
            {/* Background Radial Blur Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full filter blur-[100px] -z-10" />
            <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-violet-500/10 rounded-full filter blur-[100px] -z-10" />

            {/* Main Container */}
            <main className="max-w-5xl mx-auto px-6 pt-24 pb-16 relative z-10">

                {/* Header Section */}
                <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50 text-[11px] font-medium text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        24/7 Support Available
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.15]">
                        Let’s talk about your <br className="hidden sm:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-500">
                            Automation Needs.
                        </span>
                    </h1>

                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                        Have questions about workspace setup, Gemini RAG integration, or Pay As You Go token usage? Drop us a message below.
                    </p>
                </div>

                {/* Content Layout: Form & Info */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Left Side: Contact Info Cards */}
                    <div className="lg:col-span-5 space-y-4">
                        <Card className="p-5 bg-card border border-border/60 hover:border-primary/50 transition-colors group">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                                    <Mail className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-foreground">Email Support</h3>
                                    <p className="text-xs text-muted-foreground mt-0.5 mb-2">Direct technical inquiries to our team.</p>
                                    <a href="mailto:andywidianto56@gmail.com" className="text-xs font-medium text-primary hover:underline">
                                        andywidianto56@gmail.com
                                    </a>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-5 bg-card border border-border/60 hover:border-violet-500/50 transition-colors group">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0 group-hover:bg-violet-500/20 transition-colors">
                                    <MessageSquare className="w-5 h-5 text-violet-500" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-foreground">WhatsApp Live Support</h3>
                                    <p className="text-xs text-muted-foreground mt-0.5 mb-2">Instant responses handled by our Bot.</p>
                                    <a href="https://wa.me/6285183229055" className="text-xs font-medium text-violet-500 hover:underline">
                                        +62 851-8322-9055
                                    </a>
                                </div>
                            </div>
                        </Card>

                        {/* <Card className="p-5 bg-card border border-border/60 hover:border-emerald-500/50 transition-colors group">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                                    <Clock className="w-5 h-5 text-emerald-500" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-foreground">Working Hours</h3>
                                    <p className="text-xs text-muted-foreground mt-0.5">Mon - Fri: 09:00 - 18:00 WIB</p>
                                    <p className="text-[11px] text-muted-foreground/80 mt-1">Automated AI System active 24/7</p>
                                </div>
                            </div>
                        </Card> */}

                        {/* Showcase Small Badge */}
                        <motion.div
                            animate={{ y: [0, -6, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="bg-card/50 border border-border/60 p-4 rounded-xl shadow-lg mt-6"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                    <Bot className="w-4 h-4 text-emerald-500" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-xs text-foreground">Fast Response Guaranteed</h4>
                                    <p className="text-[10px] text-muted-foreground">Average resolution time &lt; 2 hours</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Side: Contact Form Container */}
                    <div className="lg:col-span-7">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="bg-card border border-border/60 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-primary/5"
                        >
                            {submitted ? (
                                <div className="py-12 text-center space-y-4">
                                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground">Pesan Terkirim!</h3>
                                    <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                                        Terima kasih telah menghubungi kami. Tim kami akan segera menanggapi pertanyaan Anda melalui email.
                                    </p>
                                    <Btn
                                        variant="secondary"
                                        onClick={() => setSubmitted(false)}
                                        className="h-9 px-4 text-xs mt-4 bg-muted/30 border-border/60 hover:bg-muted/80"
                                    >
                                        Kirim Pesan Lain
                                    </Btn>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5 text-left">
                                            <label className="text-xs font-semibold text-foreground">Nama Lengkap</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="John Doe"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full h-10 px-3.5 rounded-lg bg-muted/20 border border-border/60 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 transition-colors"
                                            />
                                        </div>

                                        <div className="space-y-1.5 text-left">
                                            <label className="text-xs font-semibold text-foreground">Email</label>
                                            <input
                                                type="email"
                                                required
                                                placeholder="john@example.com"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full h-10 px-3.5 rounded-lg bg-muted/20 border border-border/60 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 transition-colors"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5 text-left">
                                        <label className="text-xs font-semibold text-foreground">Nama Workspace / Perusahaan (Opsional)</label>
                                        <input
                                            type="text"
                                            placeholder="My Workspace Ltd."
                                            value={formData.workspace}
                                            onChange={(e) => setFormData({ ...formData, workspace: e.target.value })}
                                            className="w-full h-10 px-3.5 rounded-lg bg-muted/20 border border-border/60 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 transition-colors"
                                        />
                                    </div>

                                    <div className="space-y-1.5 text-left">
                                        <label className="text-xs font-semibold text-foreground">Pesan / Pertanyaan</label>
                                        <textarea
                                            required
                                            rows={4}
                                            placeholder="Jelaskan kebutuhan integrasi WhatsApp atau pertanyaan fitur Anda..."
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            className="w-full p-3.5 rounded-lg bg-muted/20 border border-border/60 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 transition-colors resize-none leading-relaxed"
                                        />
                                    </div>

                                    <Btn
                                        variant="primary"
                                        icon={Send}
                                        disabled={isLoading}
                                        className="w-full h-10 px-6 font-semibold shadow-md shadow-primary/20 mt-2 text-xs"
                                    >

                                        {isLoading ? 'Sending...' : 'Send Message'}
                                    </Btn>
                                </form>
                            )}
                        </motion.div>
                    </div>

                </div>
            </main>
        </div>
    );
}