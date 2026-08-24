"use client";

import React, { useState } from "react";
import { Bot, MessageSquare, Lock, Mail, User, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle2, ShieldAlert, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import cn from "../components/ClassName";
import useAxios from "@/lib/axios-service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import axios from "axios";
import LogoApp from "../components/LogoApp";

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

export default function RegisterPage() {
    const { AxiosPublic } = useAxios();
    const [step, setStep] = useState<1 | 2>(1);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        pin: ["", "", "", "", "", ""] // Array untuk 6 digit PIN
    });

    const router = useRouter();

    const nextStep = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                password: formData.password
            }
            await AxiosPublic.post("/auth/code-pin", payload);
            setStep(2);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const message = err.response?.data.message;
                if (message) toast.error(message);
            }
            setStep(1);
            console.error("Fetch error: ", err);
        } finally {
            setIsLoading(false);
        }
    };

    const prevStep = () => {
        setStep(1);
    };

    const handlePinChange = (element: HTMLInputElement, index: number) => {
        if (isNaN(Number(element.value))) return false;

        const newPin = [...formData.pin];
        newPin[index] = element.value;
        setFormData({ ...formData, pin: newPin });

        if (element.value !== "" && element.nextSibling) {
            (element.nextSibling as HTMLInputElement).focus();
        }
    };

    const handlePinKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace" && formData.pin[index] === "" && e.currentTarget.previousSibling) {
            (e.currentTarget.previousSibling as HTMLInputElement).focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const pinString = formData.pin.join("");
        if (pinString.length < 6) {
            alert("Please complete your 6-digit Security PIN.");
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                codePin: formData.pin.join("")
            }
            const res = await AxiosPublic.post("/auth/register", payload);
            const data = res.data;
            console.log(data);
            toast.success("Register successfully");
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
        window.location.href = `http://localhost:5000/api/auth/${provider}`;
    };

    return (
        <div className="min-h-screen w-full flex bg-background text-foreground overflow-hidden">
            <div className="w-full lg:w-[480px] flex flex-col justify-between p-6 sm:p-10 z-10 bg-background border-r border-border/40">
                <div className="flex items-center justify-between">
                    <LogoApp />
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                        Step {step} of 2
                    </span>
                </div>

                {/* Form Multi-Step Area */}
                <div className="w-full max-w-sm mx-auto my-auto py-6">
                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: -16 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 16 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-4"
                            >
                                <div className="space-y-1">
                                    <h2 className="text-xl font-bold tracking-tight text-foreground">Create Account</h2>
                                    <p className="text-xs text-muted-foreground">Get started with your dedicated isolated workspace.</p>
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
                                            />
                                            <path
                                                fill="#34A853"
                                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            />
                                            <path
                                                fill="#FBBC05"
                                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                                            />
                                            <path
                                                fill="#EA4335"
                                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                                            />
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
                                <div className="relative flex items-center justify-center my-1">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-border/60" />
                                    </div>
                                    <span className="relative bg-background px-2 text-[10px] uppercase tracking-wider text-muted-foreground/70">
                                        Or sign up with email
                                    </span>
                                </div>

                                <form onSubmit={nextStep} className="space-y-3.5">
                                    <div>
                                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Full Name</label>
                                        <div className="relative flex items-center">
                                            <User className="absolute left-3 w-4 h-4 text-muted-foreground/60" />
                                            <input
                                                type="text" required placeholder="John Doe"
                                                value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full h-9 pl-10 pr-3 text-sm rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:border-primary transition-colors"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email Address</label>
                                        <div className="relative flex items-center">
                                            <Mail className="absolute left-3 w-4 h-4 text-muted-foreground/60" />
                                            <input
                                                type="email" required placeholder="name@company.com"
                                                value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full h-9 pl-10 pr-3 text-sm rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:border-primary transition-colors"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Password</label>
                                        <div className="relative flex items-center">
                                            <Lock className="absolute left-3 w-4 h-4 text-muted-foreground/60" />
                                            <input
                                                type={showPassword ? "text" : "password"} required placeholder="••••••••"
                                                value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                className="w-full h-9 pl-10 pr-10 text-sm rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:border-primary transition-colors"
                                            />
                                            <button
                                                type="button" onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 p-1 hover:bg-muted-foreground/10 rounded text-muted-foreground/70"
                                            >
                                                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full h-9 mt-1 flex items-center justify-center gap-2 font-semibold text-xs rounded-lg bg-primary text-primary-foreground shadow-md shadow-primary/10 hover:bg-primary/90 transition-colors"
                                    >
                                        <span>{isLoading ? "Processing..." : "Continue to Security"}</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                </form>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 16 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -16 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-5"
                            >
                                <div className="space-y-1">
                                    <h2 className="text-xl font-bold tracking-tight text-foreground">Set Security PIN</h2>
                                    <p className="text-xs text-muted-foreground">Define a 6-digit transaction PIN to protect your critical API configurations & tokens.</p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Input PIN 6 Kolom */}
                                    <div className="flex justify-between gap-2">
                                        {formData.pin.map((data: string, index: number) => (
                                            <input
                                                key={index}
                                                type="text"
                                                maxLength={1}
                                                value={data}
                                                onChange={(e) => handlePinChange(e.target, index)}
                                                onKeyDown={(e) => handlePinKeyDown(e, index)}
                                                className="w-12 h-12 text-center text-lg font-bold rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                            />
                                        ))}
                                    </div>

                                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-2.5 text-xs text-amber-600 dark:text-amber-400">
                                        <ShieldAlert className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>Never share this security PIN with anyone. It will be requested during crucial gateway deployments.</span>
                                    </div>

                                    {/* Aksi Tombol */}
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={prevStep}
                                            className="flex-1 h-9 flex items-center justify-center gap-2 text-xs font-medium rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-colors"
                                        >
                                            <ArrowLeft className="w-3.5 h-3.5" />
                                            <span>Back</span>
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="flex-1 h-9 flex items-center justify-center gap-2 font-semibold text-xs rounded-lg bg-primary text-primary-foreground shadow-md shadow-primary/10 hover:bg-primary/90 disabled:opacity-50 transition-colors"
                                        >
                                            <span>{isLoading ? "Processing..." : "Finish Register"}</span>
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Link Login */}
                    {step === 1 && (
                        <div className="text-center text-xs text-muted-foreground mt-4">
                            Already have an account?{" "}
                            <a href="/login" className="text-primary font-semibold hover:underline">
                                Sign In
                            </a>
                        </div>
                    )}
                </div>

                {/* Footer Bottom */}
                <div className="text-center lg:text-left text-[11px] text-muted-foreground/50">
                    By registering, you agree to secure data tenant isolation standard rules.
                </div>
            </div>
            
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