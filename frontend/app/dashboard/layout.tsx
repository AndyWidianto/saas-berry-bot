"use client";
import useAuthStore from "@/lib/store/authStore";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { accessToken, hasHydrated } = useAuthStore();
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                refetchOnWindowFocus: false,
                retry: 1,
                staleTime: 1000 * 60 * 5, // 5 menit
            },
        },
    }));

    useEffect(() => {
        if (!hasHydrated) return;
        if (!accessToken) {
            router.replace("/login");
        } else {
            setIsChecking(false);
        }
    }, [hasHydrated, accessToken, router]);

    if (isChecking) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-background">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }
    
    return (
        <div className="h-screen w-screen">
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </div>
    );
}