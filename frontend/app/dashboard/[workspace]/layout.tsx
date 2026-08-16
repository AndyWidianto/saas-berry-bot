"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import AppSidebar from "../../components/AppSidebar";
import AppNavbar from "../../components/AppNavbar";
import useAxios from "@/lib/axios-service";
import { useRouter } from "next/navigation";
import useAuthStore from "@/lib/store/authStore";


export default function AppLayout({ children }: { children: React.ReactNode }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [page, setPage] = useState("Dashboard");
    const { AxiosPrivate } = useAxios();
    const { deleteSessionLogin } = useAuthStore();
    const router = useRouter();

    const handleLogout = async () => {
        const isConfirmed = window.confirm("Apakah Anda yakin ingin keluar dari akun ini?");

        // Batal jika pengguna memilih 'Cancel'
        if (!isConfirmed) return;
        try {
            await AxiosPrivate.post("/auth/logout");
        } catch (error) {
            console.error("Gagal melakukan logout di server:", error);
        } finally {
            deleteSessionLogin();
            router.push("/login");
        }
    };

    return (
        <div className="flex h-screen bg-background overflow-hidden font-[Inter,system-ui,sans-serif]">
            <AppSidebar page={page} setPage={setPage} collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} logout={handleLogout} />
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <AppNavbar darkMode={darkMode} setDarkMode={setDarkMode} page={page} />
                <main className="flex-1 overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={page}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className="h-full"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    )
}