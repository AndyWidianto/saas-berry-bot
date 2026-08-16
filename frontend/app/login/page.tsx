"use client";

import React, { useState } from "react";
import { Bot, MessageSquare, Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import cn from "../components/ClassName";
import useAxios from "@/lib/axios-service";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
import useAuthStore from "@/lib/store/authStore";

const Btn = ({ children, variant = "primary", size = "md", onClick, className, icon: Icon, type = "button", disabled }: {
    children?: React.ReactNode; variant?: "primary" | "secondary" | "ghost" | "danger";
    size?: "sm" | "md"; onClick?: () => void; className?: string; icon?: React.ElementType; type?: "submit" | "button"; disabled?: boolean;
}) => {
    const variants = {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border disabled:opacity-50",
        ghost: "hover:bg-muted text-foreground disabled:opacity-50",
        danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50",
    };
    const sizes = { sm: "h-8 px-3 text-xs gap-1.5", md: "h-9 px-4 text-sm gap-2" };
    return (
        <button type={type} onClick={onClick} disabled={disabled} className={cn("inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150", variants[variant], sizes[size], className)}>
            {children}
            {Icon && <Icon className={size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"} />}
        </button>
    );
};

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

    return (
        <div className="min-h-screen w-full flex bg-background text-foreground overflow-hidden">
            
            {/* Kiri: Kolom Form Login */}
            <div className="w-full lg:w-[480px] flex flex-col justify-between p-6 sm:p-10 z-10 bg-background border-r border-border/40">
                
                {/* Logo Top */}
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                        <MessageSquare className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <span className="font-semibold text-base tracking-tight text-foreground">Evolve WA</span>
                </div>

                {/* Form Tengah */}
                <div className="w-full max-w-sm mx-auto my-auto space-y-6">
                    <div className="space-y-1.5 text-center lg:text-left">
                        <h2 className="text-xl font-bold tracking-tight text-foreground">Welcome Back</h2>
                        <p className="text-xs text-muted-foreground">Enter your credentials to manage your Omnichannel & AI chatbots.</p>
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
                                <a href="#" className="text-xs text-primary hover:underline font-medium">Forgot password?</a>
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
                        <Btn
                            type="submit"
                            variant="primary"
                            disabled={isLoading}
                            icon={ArrowRight}
                            className="w-full mt-2 font-semibold shadow-md shadow-primary/10"
                        >
                            {isLoading ? "Signing in..." : "Sign In to Account"}
                        </Btn>
                    </form>

                    {/* Pembatas / Register Option */}
                    <div className="text-center text-xs text-muted-foreground">
                        Don't have an account?{" "}
                        <a href="#" className="text-primary font-semibold hover:underline">
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

            {/* Kanan: Panel Promosi / Visual Brand (Tersembunyi di Mobile/Tablet) */}
            <div className="hidden lg:flex flex-1 relative bg-muted/30 items-center justify-center p-12 overflow-hidden">
                {/* Efek Gradasi Background AI */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full filter blur-[80px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full filter blur-[80px]" />

                <div className="max-w-md space-y-6 text-center z-10">
                    {/* Floating Component Animation */}
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="bg-card border border-border/80 p-5 rounded-2xl shadow-xl max-w-sm mx-auto flex items-start gap-4 text-left"
                    >
                        <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-5 h-5 text-violet-500" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-xs text-foreground">Smart Automated Workspace</h4>
                            <p className="text-[11px] text-muted-foreground mt-0.5">Your local LLMs & Official Meta APIs are seamlessly connected to provide 24/7 autonomous responses.</p>
                        </div>
                    </motion.div>

                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Scale up WhatsApp with AI Automation.</h1>
                        <p className="text-xs text-muted-foreground px-6">
                            Isolate client workflows inside secured Workspaces, train RAG models with customized knowledge bases, and control your token budget smoothly.
                        </p>
                    </div>
                </div>
            </div>

        </div>
    );
}