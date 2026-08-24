'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Layers, AlertCircle } from 'lucide-react';
import useAuthStore from '@/lib/store/authStore';
import useAxios from '@/lib/axios-service';

function AuthSuccessContent() {
    const { AxiosPublic } = useAxios();
  const { login, setUser } = useAuthStore();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Jika tidak ada token di URL, redirect ke login
    if (!token) {
      setErrorMessage('Token otentikasi tidak ditemukan.');
      setTimeout(() => router.push('/login'), 2000);
      return;
    }

    let isMounted = true;

    const handleGetUser = async () => {
      try {
        const res = await AxiosPublic.get(`/auth/me`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const result = res.data;

        if (isMounted) {
          // Sesuaikan dengan struktur respons API Anda
          const userData = result.data || result.user || result;

          setUser(userData);
          login(userData, token);

          router.replace('/dashboard');
        }
      } catch (err: any) {
        console.error('Fetch error: ', err);
        if (isMounted) {
          setErrorMessage(err.response?.data?.message || 'Gagal memverifikasi akun Anda.');
          setTimeout(() => router.push('/login'), 2500);
        }
      }
    };

    handleGetUser();

    return () => {
      isMounted = false;
    };
  }, [token, login, setUser, router]);

  return (
    <div className="w-full max-w-sm bg-card/60 backdrop-blur-md border border-border/60 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col items-center text-center space-y-5 transition-all">
      {/* Brand/Icon Indicator */}
      <div className="relative flex items-center justify-center">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
          <Layers className="w-7 h-7" />
        </div>
        {!errorMessage && (
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-primary"></span>
          </span>
        )}
      </div>

      <div className="space-y-2 w-full">
        {errorMessage ? (
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-destructive font-semibold text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Otentikasi Gagal</span>
            </div>
            <p className="text-xs text-muted-foreground">{errorMessage}</p>
            <p className="text-[11px] text-muted-foreground/80 italic">Mengalihkan ke login...</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-foreground font-semibold text-base">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span>Memproses Log In</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed animate-pulse">
              Mohon tunggu, sedang mengambil data akun Anda...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthSuccessPage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-4 relative selection:bg-primary/20">
      {/* Background Ambient Glow */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full filter blur-[120px] pointer-events-none -z-10" />

      {/* Wrapping useSearchParams dengan Suspense untuk kompatibilitas Next.js */}
      <Suspense
        fallback={
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading...
          </div>
        }
      >
        <AuthSuccessContent />
      </Suspense>
    </div>
  );
}