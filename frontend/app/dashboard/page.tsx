"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAxios from "@/lib/axios-service";
import { Workspace, WorkspaceMember } from "@/lib/types/workspace";
import { useWorkspaceStore } from "@/lib/store/workspaceStore";
import useAuthStore from "@/lib/store/authStore";
import { Loader2, AlertCircle, RefreshCw, Layers } from 'lucide-react';



export default function WorkspacePage() {
  const { AxiosPrivate } = useAxios();
  const { user } = useAuthStore();
  const { setWorkspace, setWorkspaces } = useWorkspaceStore();
  
  const [isLoadingFetch, setIsLoadingFetch] = useState(true);
  const [message, setMessage] = useState("Menyiapkan lingkungan kerja Anda...");
  const [isError, setIsError] = useState(false);
  const router = useRouter();

  const fetchWorkspaces = async () => {
    setIsLoadingFetch(true);
    setIsError(false);
    
    try {
      setMessage("Memeriksa data workspace...");
      const res = await AxiosPrivate.get("/workspaces");
      const data = res.data;
      const newWorkspaces = (data.data as Workspace[]) || [];
      const workspace = newWorkspaces.length > 0 ? newWorkspaces[0] : null;

      setWorkspaces(newWorkspaces);
      setWorkspace(workspace);

      if (!workspace) {
        setMessage("Membuat workspace baru untuk Anda...");
        const responseCreate = await AxiosPrivate.post("/workspaces", {
          name: `Default-${user?.name || 'User'}`
        });
        const result = responseCreate.data;
        const newWorkspace = result.data as Workspace;

        setWorkspaces([newWorkspace]);
        setWorkspace(newWorkspace);
        
        setMessage("Workspace berhasil dibuat! Mengalihkan...");
        router.push(`/dashboard/${newWorkspace.id}`);
        return;
      }

      setMessage("Memuat dashboard...");
      router.push(`/dashboard/${workspace.id}`);
    } catch (err) {
      console.error("Fetch error: ", err);
      setIsError(true);
      setMessage("Gagal memuat atau membuat workspace. Silakan coba lagi.");
    } finally {
      setIsLoadingFetch(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-4 relative selection:bg-primary/20">
      {/* Background Ambient Glow */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full filter blur-[120px] pointer-events-none -z-10" />

      {/* Main Status Card */}
      <div className="w-full max-w-sm bg-card/60 backdrop-blur-md border border-border/60 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col items-center text-center space-y-5 transition-all">
        
        {/* Brand/Icon Indicator */}
        <div className="relative flex items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
            <Layers className="w-7 h-7" />
          </div>
          {(isLoadingFetch || !isError) && (
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-primary"></span>
            </span>
          )}
        </div>

        {/* Dynamic Loading or Error State */}
        {!isError ? (
          <div className="space-y-3 w-full">
            <div className="flex items-center justify-center gap-2 text-foreground font-semibold text-base">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span>Mempersiapkan Workspace</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed animate-pulse">
              {message}
            </p>
          </div>
        ) : (
          <div className="space-y-4 w-full">
            <div className="flex items-center justify-center gap-2 text-destructive font-semibold text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Terjadi Kesalahan</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {message}
            </p>
            <button
              onClick={fetchWorkspaces}
              className="w-full py-2 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Coba Lagi
            </button>
          </div>
        )}
      </div>
    </div>
  );
}