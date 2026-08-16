"use client";

import React, { useState } from "react";
import { Bot, MessageSquare, Lock, Mail, User, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle2, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import cn from "../components/ClassName";

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
    const [step, setStep] = useState<1 | 2>(1);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        pin: ["", "", "", "", "", ""] // Array untuk 6 digit PIN
    });

    // Handle navigasi antar langkah
    const nextStep = (e: React.FormEvent) => {
        e.preventDefault();
        setStep(2);
    };

    const prevStep = () => {
        setStep(1);
    };

    // Handle Input PIN otomatis geser ke kolom berikutnya
    const handlePinChange = (element: HTMLInputElement, index: number) => {
        if (isNaN(Number(element.value))) return false;

        const newPin = [...formData.pin];
        newPin[index] = element.value;
        setFormData({ ...formData, pin: newPin });

        // Fokus pindah ke kanan jika terisi
        if (element.value !== "" && element.nextSibling) {
            (element.nextSibling as HTMLInputElement).focus();
        }
    };

    // Handle hapus PIN (Backspace) pindah ke kolom kiri
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
        
        // Payload siap kirim ke Backend (NestJS / Golang) Anda
        const payload = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            securityPin: pinString
        };

        setTimeout(() => {
            setIsLoading(false);
            alert("Registration Success! Account created securely.");
            console.log("Registered Data Setup:", payload);
        }, 1500);
    };

    return (
        <div className="min-h-screen w-full flex bg-background text-foreground overflow-hidden">
            
            {/* Kiri: Kolom Form Kontainer */}
            <div className="w-full lg:w-[480px] flex flex-col justify-between p-6 sm:p-10 z-10 bg-background border-r border-border/40">
                
                {/* Logo Top */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                            <MessageSquare className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <span className="font-semibold text-base tracking-tight text-foreground">Evolve WA</span>
                    </div>
                    {/* Step Indicator */}
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                        Step {step} of 2
                    </span>
                </div>

                {/* Form Multi-Step Area */}
                <div className="w-full max-w-sm mx-auto my-auto py-8">
                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            /* --- LANGKAH 1: DATA DIRI --- */
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: -16 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 16 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-5"
                            >
                                <div className="space-y-1">
                                    <h2 className="text-xl font-bold tracking-tight text-foreground">Create Account</h2>
                                    <p className="text-xs text-muted-foreground">Get started with your dedicated isolated workspace.</p>
                                </div>

                                <form onSubmit={nextStep} className="space-y-4">
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

                                    <Btn type="submit" variant="primary" icon={ArrowRight} className="w-full mt-2 font-semibold">
                                        Continue to Security
                                    </Btn>
                                </form>
                            </motion.div>
                        ) : (
                            /* --- LANGKAH 2: SETUP SECURITY PIN --- */
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
                                        {formData.pin.map((data, index) => (
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
                                        <Btn variant="secondary" onClick={prevStep} icon={ArrowLeft} className="flex-1 justify-center">
                                            Back
                                        </Btn>
                                        <Btn type="submit" variant="primary" disabled={isLoading} icon={CheckCircle2} className="flex-1 justify-center font-semibold">
                                            {isLoading ? "Processing..." : "Finish Register"}
                                        </Btn>
                                    </div>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Link Login */}
                    {step === 1 && (
                        <div className="text-center text-xs text-muted-foreground mt-5">
                            Already have an account?{" "}
                            <a href="#" className="text-primary font-semibold hover:underline">
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

            {/* Kanan: Branding Visual */}
            <div className="hidden lg:flex flex-1 relative bg-muted/30 items-center justify-center p-12 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full filter blur-[80px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full filter blur-[80px]" />

                <div className="max-w-md space-y-6 text-center z-10">
                    <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="bg-card border border-border/80 p-5 rounded-2xl shadow-xl max-w-sm mx-auto flex items-start gap-4 text-left"
                    >
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-xs text-foreground">Double-Layered Security</h4>
                            <p className="text-[11px] text-muted-foreground mt-0.5">Encrypted password matching standards combined with isolated user secure PINs block unofficial hardware hacks.</p>
                        </div>
                    </motion.div>

                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Deploy AI WhatsApp Solutions.</h1>
                        <p className="text-xs text-muted-foreground px-6">
                            Create workflows, sync knowledge bases using localized vectors or Gemini AI studio, and broadcast reliably without infrastructure constraints.
                        </p>
                    </div>
                </div>
            </div>

        </div>
    );
}