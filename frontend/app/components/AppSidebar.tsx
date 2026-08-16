"use client";
import { BarChart3, Bot, CreditCard, InboxIcon, LayoutDashboard, LogOut, PanelLeftClose, PanelLeftOpen, Puzzle, RadioIcon, SettingsIcon, Sparkles, UserCheck, Users } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Avatar } from "./Avatar";
import cn from "./ClassName";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import useAuthStore from "@/lib/store/authStore";


interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

export default function AppSidebar({ page, setPage, collapsed, setCollapsed, logout }: {
  page: string; setPage: (p: string) => void; collapsed: boolean; setCollapsed: (v: boolean) => void;
  logout: () => void;
}) {
  const pathname = usePathname();
  const params = useParams();
  const { workspace } = params;
  const router = useRouter();
  const { user } = useAuthStore();

  const navItems: NavItem[] = [
    { id: `/dashboard/${workspace}`, label: "Dashboard", icon: LayoutDashboard },
    //{ id: `/dashboard/${workspace}/inbox`, label: "Inbox", icon: InboxIcon, badge: 7 },
    { id: `/dashboard/${workspace}/chatbot`, label: "AI Chatbot", icon: Bot },
    //{ id: `/dashboard/${workspace}/broadcast`, label: "Broadcast", icon: RadioIcon },
    //{ id: `/dashboard/${workspace}/contacts`, label: "Contacts", icon: Users },
    //{ id: `/dashboard/${workspace}/analytics`, label: "Analytics", icon: BarChart3 },
    { id: `/dashboard/${workspace}/integrations`, label: "Integrations", icon: Puzzle },
    //{ id: `/dashboard/${workspace}/team`, label: "Team", icon: UserCheck },
    { id: `/dashboard/${workspace}/billing`, label: "Billing", icon: CreditCard },
    { id: `/dashboard/${workspace}/settings`, label: "Settings", icon: SettingsIcon },
  ];
  const handleOnClick = (item: NavItem) => {
    setPage(item.label);
    router.push(item.id);
  }
  return (
    <motion.aside
      animate={{ width: collapsed ? 68 : 240 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="relative flex-shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col overflow-hidden z-20"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <span className="font-bold text-foreground text-base tracking-tight">EngageIQ</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map(item => {
          const active = pathname === item.id;
          return (
            <button
              key={item.id}
              title={collapsed ? item.label : undefined}
              onClick={() => handleOnClick(item)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className={cn("w-4.5 h-4.5 flex-shrink-0", active ? "text-sidebar-primary" : "")} style={active ? { color: "var(--sidebar-primary)" } : {}} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }} className="flex-1 text-left whitespace-nowrap">
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {!collapsed && item.badge && (
                <span className="ml-auto text-xs bg-primary text-white rounded-full px-1.5 py-0.5 font-semibold leading-none">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-2 flex-shrink-0">
        {!collapsed && (
          <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl hover:bg-sidebar-accent/50 transition-colors group mb-1">
            {/* Profil & Informasi User */}
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              {user?.profileUrl ? (
                <div className="relative flex-shrink-0">
                  <img
                    src={user?.profileUrl}
                    alt={user?.name || "Profile"}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-sidebar" />
                </div>
              ) : (
                <Avatar
                  initials={user?.name?.charAt(0).toUpperCase() || "AC"}
                  color="#6366f1"
                  size="sm"
                  online={true}
                />
              )}

              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-foreground truncate leading-tight">
                  {user?.name || "Alex Chen"}
                </div>
                <div className="text-[10px] text-muted-foreground truncate leading-tight">
                  {user?.role || "Owner"}
                </div>
              </div>
            </div>

            {/* Tombol Logout */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                logout();
              }}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center py-2 rounded-lg hover:bg-sidebar-accent/50 text-muted-foreground transition-colors"
        >
          {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>
    </motion.aside>
  );
}