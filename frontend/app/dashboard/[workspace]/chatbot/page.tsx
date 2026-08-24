"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  ScrollText,
  Settings
} from "lucide-react";
import cn from "../../../components/ClassName";
import { useParams, useSearchParams } from "next/navigation";
import TabKnowledge from "./tabs/TabKnowledge";
import TabAILog from "./tabs/TabAILog";
import TabSettingChatbot from "./tabs/TabSettingChatbot";


type ChatbotTab = "knowledge" | "logs" | "settings";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));


export default function ChatbotPage() {
  const [tab, setTab] = useState<ChatbotTab>("knowledge");
  const { workspace: workspaceId } = useParams();
  const searchParam = useSearchParams();
  const searchTab = searchParam.get("tab");

  const tabs: { id: ChatbotTab; label: string; icon: React.ElementType }[] = [
    { id: "knowledge", label: "Knowledge Base", icon: BookOpen },
    { id: "logs", label: "AI Logs", icon: ScrollText },
    { id: "settings", label: "Settings & Token AI", icon: Settings }
  ];

  const renderingTab = () => {
    if (!workspaceId) return;
    switch (tab) {
      case "knowledge":
        return <TabKnowledge workspaceId={workspaceId as string} />
      case "logs":
        return <TabAILog workspaceId={workspaceId as string} />
      case "settings":
        return <TabSettingChatbot workspaceId={workspaceId as string} />
    }
  }

  useEffect(() => {
    if (!searchTab) return;
    if (searchTab  === "settings") {
      setTab("settings");
    }
  }, [searchTab])

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Sub-nav Container */}
      <div className="border-b border-border bg-card px-4 sm:px-6 flex items-center justify-between flex-shrink-0">
        {/* Tab Navigation Wrapper dengan Horizontal Scroll */}
        <div className="flex gap-1 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth w-full">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-2 px-3 sm:px-4 py-3 sm:py-3.5 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap shrink-0",
                tab === t.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <t.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Un-comment bagian ini jika butuh tombol aksi di header */}
        {/* {tab === "builder" && (
      <div className="hidden md:flex items-center gap-2 py-2 shrink-0 pl-4">
        <Btn variant="ghost" size="sm" icon={RotateCcw}>Undo</Btn>
        <Btn variant="secondary" size="sm" icon={Save}>Save</Btn>
        <Btn variant="primary" size="sm" icon={Zap} onClick={() => toast.success("Flow published successfully!")}>Publish</Btn>
      </div>
    )} */}
      </div>

      {/* Active Tab Content Wrapper */}
      <div className="flex-1 overflow-auto">
        {renderingTab()}
      </div>
    </div>
  );
}