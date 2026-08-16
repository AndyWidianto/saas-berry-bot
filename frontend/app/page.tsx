"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AppPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/home");
  })

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )
}