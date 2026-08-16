import { Page } from "@/types";
import { BookOpen, Building2, Cpu, CreditCard, Activity, Database, FileText, Key, LayoutDashboard, Settings, Shield, Users, Zap } from "lucide-react";


type NavSection = {
  title: string
  items: { id: string; label: string; icon: React.ReactNode; badge?: number }[]
}

const navSections: NavSection[] = [
    {
        title: "System",
        items: [
            { id: "overview", label: "Overview & Analytics", icon: <LayoutDashboard size={15} /> },
        ],
    },
    {
        title: "Tenants",
        items: [
            { id: "workspaces", label: "Workspaces / Tenants", icon: <Building2 size={15} />, badge: 3 },
            { id: "users", label: "Platform Users", icon: <Users size={15} /> },
        ],
    },
    {
        title: "AI Engine",
        items: [
            { id: "ai-models", label: "AI Models Engine", icon: <Cpu size={15} /> },
            { id: "provider-keys", label: "Provider Key Vault", icon: <Key size={15} /> },
            { id: "vector-db", label: "Vector DB / Embeddings", icon: <Database size={15} /> },
        ],
    },
    {
        title: "Knowledge",
        items: [
            { id: "articles", label: "Global Articles", icon: <FileText size={15} /> },
            { id: "knowledge-base", label: "System Knowledge Base", icon: <BookOpen size={15} /> },
        ],
    },
    {
        title: "Finance & Ops",
        items: [
            { id: "transactions", label: "Credit Ledger", icon: <CreditCard size={15} /> },
            { id: "logs", label: "System Logs & Traffic", icon: <Activity size={15} /> },
            { id: "settings", label: "Platform Settings", icon: <Settings size={15} /> },
        ],
    },
]

export function Sidebar({ page, onNav }: { page: Page; onNav: (p: Page) => void }) {
    return (
        <aside className="w-56 min-w-56 bg-[#0a0d14] border-r border-white/[0.06] flex flex-col overflow-y-auto">
            {/* Logo */}
            <div className="px-4 py-5 border-b border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
                        <Zap size={14} className="text-white" />
                    </div>
                    <div>
                        <div className="text-[13px] font-semibold text-white/90 leading-tight">KurmaBot</div>
                        <div className="text-[10px] text-violet-400 font-medium tracking-widest uppercase">SuperAdmin</div>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 py-3 px-2">
                {navSections.map((section) => (
                    <div key={section.title} className="mb-4">
                        <div className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-widest text-white/25">
                            {section.title}
                        </div>
                        {section.items.map((item) => {
                            const active = page === item.id
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => onNav(item.id as Page)}
                                    className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-[13px] transition-all mb-0.5 cursor-pointer border-0 text-left ${active
                                        ? "bg-violet-600/15 text-violet-300"
                                        : "text-white/45 hover:text-white/75 hover:bg-white/[0.04]"
                                        }`}
                                >
                                    <span className={active ? "text-violet-400" : ""}>{item.icon}</span>
                                    <span className="flex-1">{item.label}</span>
                                    {item.badge && (
                                        <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold flex items-center justify-center">
                                            {item.badge}
                                        </span>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                ))}
            </nav>

            {/* Admin profile at bottom */}
            <div className="px-3 py-3 border-t border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-violet-700 flex items-center justify-center text-[11px] font-bold text-white">KM</div>
                    <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-medium text-white/80 truncate">Kyle Martin</div>
                        <div className="text-[10px] text-white/35">Super Admin</div>
                    </div>
                    <Shield size={13} className="text-violet-400 shrink-0" />
                </div>
            </div>
        </aside>
    )
}