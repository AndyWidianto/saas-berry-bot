"use client";

import React, { useState } from "react";
import { Bot, MessageSquare, Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import useAxios, { baseUrl } from "@/lib/axios-service";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
import useAuthStore from "@/lib/store/authStore";
import LogoApp from "../components/LogoApp";

export default function LoginPage() {
    const { AxiosPublic } = useAxios();
    const { login } = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({ email: "", password: "" });
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await AxiosPublic.post("/login", formData, {
                withCredentials: true
            });
            const data = res.data;
            login(data.user, data.accessToken);
            toast.success("Login successfully");
            router.push(`/dashboard`);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const message = err.response?.data.message;
                if (message) toast.error(message);
            }
            console.error("Fetch error: ", err);
        } finally {
            setIsLoading(false);
        }
    };
    const handleOAuthLogin = (provider: 'google' | 'github') => {
        window.location.href = `${baseUrl}/auth/${provider}`;
    };

    return (
        <div className="min-h-screen w-full flex bg-background text-foreground overflow-hidden">

            {/* Kiri: Kolom Form Login */}
            <div className="w-full lg:w-[480px] flex flex-col justify-between p-6 sm:p-10 z-10 bg-background border-r border-border/40">

                <LogoApp />

                {/* Form Tengah */}
                <div className="w-full max-w-sm mx-auto my-auto space-y-5">
                    <div className="space-y-1.5 text-center lg:text-left">
                        <h2 className="text-xl font-bold tracking-tight text-foreground">Welcome Back</h2>
                        <p className="text-xs text-muted-foreground">Enter your credentials to manage your Omnichannel & AI chatbots.</p>
                    </div>

                    {/* Tombol OAuth (Google & GitHub) */}
                    <div className="grid grid-cols-1 gap-3 pt-1">
                        <button
                            type="button"
                            onClick={() => handleOAuthLogin("google")}
                            className="flex items-center justify-center gap-2 h-9 px-3 text-xs font-medium rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-colors shadow-sm"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    stroke="currentColor" strokeWidth="0" />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    stroke="currentColor" strokeWidth="0" />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                                    stroke="currentColor" strokeWidth="0" />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                                    stroke="currentColor" strokeWidth="0" />
                            </svg>
                            Google
                        </button>
                        {/* <button
                            type="button"
                            onClick={() => handleOAuthLogin("github")}
                            className="flex items-center justify-center gap-2 h-9 px-3 text-xs font-medium rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-colors shadow-sm"
                        >
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                            </svg>
                            GitHub
                        </button> */}
                    </div>

                    {/* Pembatas Line OR */}
                    <div className="relative flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border/60" />
                        </div>
                        <span className="relative bg-background px-2 text-[10px] uppercase tracking-wider text-muted-foreground/70">
                            Or continue with email
                        </span>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Input Email */}
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email Address</label>
                            <div className="relative flex items-center">
                                <Mail className="absolute left-3 w-4 h-4 text-muted-foreground/60" />
                                <input
                                    type="email"
                                    required
                                    placeholder="name@company.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full h-9 pl-10 pr-3 text-sm rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>
                        </div>

                        {/* Input Password */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-xs font-medium text-muted-foreground">Password</label>
                                <a href="/forgot-password" className="text-xs text-primary hover:underline font-medium">Forgot password?</a>
                            </div>
                            <div className="relative flex items-center">
                                <Lock className="absolute left-3 w-4 h-4 text-muted-foreground/60" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full h-9 pl-10 pr-10 text-sm rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 p-1 hover:bg-muted-foreground/10 rounded text-muted-foreground/70 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                            </div>
                        </div>

                        {/* Tombol Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-9 mt-2 flex items-center justify-center gap-2 font-semibold text-xs rounded-lg bg-primary text-primary-foreground shadow-md shadow-primary/10 hover:bg-primary/90 disabled:opacity-50 transition-colors"
                        >
                            <span>{isLoading ? "Signing in..." : "Sign In to Account"}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </form>

                    {/* Pembatas / Register Option */}
                    <div className="text-center text-xs text-muted-foreground">
                        Don't have an account?{" "}
                        <a href="register" className="text-primary font-semibold hover:underline">
                            Request Access
                        </a>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="text-center lg:text-left text-[11px] text-muted-foreground/60 flex items-center justify-center lg:justify-start gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    Secure multi-tenant authentication standard.
                </div>
            </div>

            {/* Kanan: Panel Promosi / Visual Brand */}
            <div className="hidden lg:flex flex-1 relative bg-muted/30 items-center justify-center p-12 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full filter blur-[80px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full filter blur-[80px]" />

                <div className="max-w-md space-y-6 text-center z-10">
                    <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="bg-card border border-border/80 p-5 rounded-2xl shadow-xl max-w-sm mx-auto flex items-start gap-4 text-left"
                    >
                        <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center flex-shrink-0">
                            <ShieldCheck className="w-5 h-5 text-sky-500" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-xs text-foreground">Multi-tenant Data Isolation</h4>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                Sesi WhatsApp, API Key, dan kuota token diisolasi secara aman dalam Workspace terpisah.
                            </p>
                        </div>
                    </motion.div>

                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Deploy AI WhatsApp Solutions.
                        </h1>
                        <p className="text-xs text-muted-foreground px-6">
                            Integrasikan instance WhatsApp via REST API, proses konteks tinggi dengan Gemini via Google AI Studio, dan kelola alur otomatisasi tanpa kerumitan infrastruktur.
                        </p>
                    </div>
                </div>
            </div>

        </div>
    );
}