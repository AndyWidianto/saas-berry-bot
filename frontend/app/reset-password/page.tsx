'use client';

import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Check, X, ArrowRight, ShieldCheck, Bot, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '../components/Cards';
import { Btn } from '../components/Button';
import LogoApp from '../components/LogoApp';
import { useSearchParams } from 'next/navigation';
import useAxios from '@/lib/axios-service';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
    const { AxiosPublic } = useAxios();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const query = useSearchParams();
    const key = query.get("token");

    // Kriteria Validasi Password
    const validations = [
        { label: 'Minimal 8 karakter', valid: password.length >= 8 },
        { label: 'Mengandung huruf kapital (A-Z)', valid: /[A-Z]/.test(password) },
        { label: 'Mengandung angka (0-9)', valid: /[0-9]/.test(password) },
        { label: 'Mengandung karakter khusus (!@#$%^&*)', valid: /[^A-Za-z0-9]/.test(password) },
    ];

    const isPasswordMatch = password && confirmPassword && password === confirmPassword;
    const isFormValid = validations.every((v) => v.valid) && isPasswordMatch;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;

        setIsLoading(true);
        try {
            const res = await AxiosPublic.post("auth/reset-password", {
                key: key,
                password
            });
            const result = res.data;
            toast.success(result.message);
        } catch (err) {
            console.error("Fetch error: ", err);
        } finally {
            setIsLoading(false);
            setIsSuccess(true);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-background text-foreground overflow-hidden">

            {/* Kiri: Kolom Form Reset Password */}
            <div className="w-full lg:w-[480px] flex flex-col justify-between p-6 sm:p-10 z-10 bg-background border-r border-border/40">

                <LogoApp />

                {/* Area Form Tengah */}
                <div className="w-full max-w-sm mx-auto my-auto py-6">
                    {!isSuccess ? (
                        <div className="space-y-5">
                            <div className="space-y-1.5 text-center lg:text-left">
                                <h2 className="text-xl font-bold tracking-tight text-foreground">Set New Password</h2>
                                <p className="text-xs text-muted-foreground">
                                    Your new password must be different from previously used passwords.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Input Password Baru */}
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                                        New Password
                                    </label>
                                    <div className="relative flex items-center">
                                        <Lock className="absolute left-3 w-4 h-4 text-muted-foreground/60" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full h-9 pl-10 pr-10 text-sm rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 p-1 text-muted-foreground/70 hover:text-foreground transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Input Konfirmasi Password */}
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                                        Confirm Password
                                    </label>
                                    <div className="relative flex items-center">
                                        <Lock className="absolute left-3 w-4 h-4 text-muted-foreground/60" />
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            required
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full h-9 pl-10 pr-10 text-sm rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 p-1 text-muted-foreground/70 hover:text-foreground transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                        </button>
                                    </div>
                                    {confirmPassword && !isPasswordMatch && (
                                        <p className="text-[11px] text-destructive mt-1">Passwords do not match.</p>
                                    )}
                                </div>

                                {/* Indikator Validasi Menggunakan Komponen Card Anda */}
                                <Card className="p-3 bg-muted/40 border-border/50 space-y-1.5">
                                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                        Password Requirements:
                                    </p>
                                    {validations.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-[11px]">
                                            {item.valid ? (
                                                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                            ) : (
                                                <X className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                                            )}
                                            <span className={item.valid ? 'text-foreground' : 'text-muted-foreground/70'}>
                                                {item.label}
                                            </span>
                                        </div>
                                    ))}
                                </Card>

                                {/* Button Submit */}
                                <Btn
                                    type="submit"
                                    disabled={!isFormValid || isLoading}
                                    className="w-full h-9 mt-2 flex items-center justify-center gap-2 font-semibold text-xs rounded-lg shadow-md shadow-primary/10 transition-colors cursor-pointer"
                                >
                                    <span>{isLoading ? 'Resetting Password...' : 'Reset Password'}</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Btn>
                            </form>
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Card className="p-6 text-center shadow-xl">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground">Password Reset Complete!</h3>
                                <p className="text-xs text-muted-foreground mt-1 mb-5">
                                    Your password has been successfully updated. You can now log in with your new password.
                                </p>
                                <div
                                    className="w-full h-9 text-xs font-semibold rounded-lg"
                                >
                                    <a href="/login" className="flex items-center justify-center gap-2">
                                        Back to Sign In <ArrowRight className="w-3.5 h-3.5" />
                                    </a>
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </div>

                {/* Footer Bottom */}
                <div className="text-center lg:text-left text-[11px] text-muted-foreground/60 flex items-center justify-center lg:justify-start gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    Secure multi-tenant authentication standard.
                </div>
            </div>

            {/* Kanan: Panel Visual Brand */}
            <div className="hidden lg:flex flex-1 relative bg-muted/30 items-center justify-center p-12 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full filter blur-[80px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full filter blur-[80px]" />

                <div className="max-w-md space-y-6 text-center z-10">
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        <Card className="p-5 max-w-sm mx-auto flex items-start gap-4 text-left shadow-xl border-border/80">
                            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                                <Bot className="w-5 h-5 text-violet-500" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-xs text-foreground">Smart Automated Workspace</h4>
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                    Your local LLMs & Official Meta APIs are seamlessly connected to provide 24/7 autonomous responses.
                                </p>
                            </div>
                        </Card>
                    </motion.div>

                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Scale up WhatsApp with AI Automation.
                        </h1>
                        <p className="text-xs text-muted-foreground px-6">
                            Isolate client workflows inside secured Workspaces, train RAG models with customized knowledge bases, and control your token budget smoothly.
                        </p>
                    </div>
                </div>
            </div>

        </div>
    );
}