"use client";
import React, { useState } from 'react';
import { Mail, ArrowRight, ArrowLeft, ShieldCheck, Bot, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import LogoApp from '../components/LogoApp';
import useAxios from '@/lib/axios-service';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const { AxiosPublic } = useAxios();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const res = await AxiosPublic.post('auth/forgot-password', {
        email: email
      });
      const result = res.data;
      toast.success(result.message);
    } catch (err) {
      console.error("Fetch erorr: ", err);
    } finally {
      setIsLoading(false);
      setIsSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background text-foreground overflow-hidden">

      {/* Kiri: Kolom Form Reset Password */}
      <div className="w-full lg:w-[480px] flex flex-col justify-between p-6 sm:p-10 z-10 bg-background border-r border-border/40">

        <LogoApp />

        {/* Form Tengah */}
        <div className="w-full max-w-sm mx-auto my-auto space-y-5">

          {!isSubmitted ? (
            <>
              <div className="space-y-1.5 text-center lg:text-left">
                <h2 className="text-xl font-bold tracking-tight text-foreground">Forgot Password?</h2>
                <p className="text-xs text-muted-foreground">
                  No worries, enter your registered email address and we'll send you instructions to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                {/* Input Email */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email Address</label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3 w-4 h-4 text-muted-foreground/60" />
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-9 pl-10 pr-3 text-sm rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                {/* Tombol Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-9 mt-2 flex items-center justify-center gap-2 font-semibold text-xs rounded-lg bg-primary text-primary-foreground shadow-md shadow-primary/10 hover:bg-primary/90 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <span>{isLoading ? "Sending Instructions..." : "Send Reset Link"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          ) : (
            /* Tampilan Berhasil Dikirim */
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 text-center lg:text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mx-auto lg:mx-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-xl font-bold tracking-tight text-foreground">Check your email</h2>
                <p className="text-xs text-muted-foreground">
                  We've sent a password reset link to <span className="font-semibold text-foreground">{email}</span> if it is registered in our system.
                </p>
              </div>
              <p className="text-[11px] text-muted-foreground/80 bg-muted/50 p-3 rounded-lg border border-border/50">
                Didn't receive the email? Check your spam folder or try re-entering your email address.
              </p>
              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="w-full h-9 text-xs font-medium rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-colors shadow-sm"
              >
                Resend or Try Another Email
              </button>
            </motion.div>
          )}

          {/* Back to Login Link */}
          <div className="text-center text-xs text-muted-foreground pt-2">
            <a href="/login" className="inline-flex items-center gap-1.5 text-primary font-semibold hover:underline">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Sign In
            </a>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="text-center lg:text-left text-[11px] text-muted-foreground/60 flex items-center justify-center lg:justify-start gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          Secure multi-tenant authentication standard.
        </div>
      </div>

      {/* Kanan: Panel Promosi / Visual Brand (Persis dengan Login) */}
      <div className="hidden lg:flex flex-1 relative bg-muted/30 items-center justify-center p-12 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full filter blur-[80px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full filter blur-[80px]" />

        <div className="max-w-md space-y-6 text-center z-10">
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