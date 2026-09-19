"use client";
import { BarChart3, Bot, CreditCard, InboxIcon, LayoutDashboard, LogOut, PanelLeftClose, PanelLeftOpen, Puzzle, RadioIcon, SettingsIcon, ShoppingBag, Sparkles, UserCheck, Users, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Avatar, AvatarFallback, AvatarImage } from "./Avatar";
import cn from "./ClassName";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import useAuthStore from "@/lib/store/authStore";
import LogoApp from "./LogoApp";
import { useEffect } from "react";


interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}
const getInitials = (name: string | null, fallback: string | null) => {
  const displayName = name || fallback || "User";
  return displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export default function AppSidebar({ page, setPage, collapsed, setCollapsed, logout, mobileOpen,
  setMobileOpen, }: {
    page: string;
    setPage: (p: string) => void;
    collapsed: boolean;
    setCollapsed: (v: boolean) => void;
    logout: () => void;
    mobileOpen: boolean;
    setMobileOpen: (isOpen: boolean) => void;
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
    { id: `/dashboard/${workspace}/products`, label: "Products", icon: ShoppingBag },
    { id: `/dashboard/${workspace}/contacts`, label: "Contacts", icon: Users },
    //{ id: `/dashboard/${workspace}/analytics`, label: "Analytics", icon: BarChart3 },
    { id: `/dashboard/${workspace}/integrations`, label: "Integrations", icon: Puzzle },
    //{ id: `/dashboard/${workspace}/team`, label: "Team", icon: UserCheck },
    { id: `/dashboard/${workspace}/billing`, label: "Billing", icon: CreditCard },
    { id: `/dashboard/${workspace}/settings`, label: "Settings", icon: SettingsIcon },
  ];
  const handleOnClick = (item: NavItem) => {
    setPage(item.label);
    setMobileOpen(false);
    router.push(item.id);
  }
  useEffect(() => {
    const navActive = navItems.findIndex(nav => nav.id === pathname);
    if ((navActive > 0)) {
      setPage(navItems[navActive].label);
    }
  }, []);
  return (
    <>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      {/* 2. Sidebar Component */}
      <motion.aside
        initial={false}
        animate={{
          width: collapsed ? 68 : 240,
        }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className={cn(
          // Mobile: Position Fixed Drawer (Slide in/out)
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar border-r border-sidebar-border overflow-hidden transition-transform duration-300 md:static md:translate-x-0 md:z-20 flex-shrink-0",
          mobileOpen ? "translate-x-0 w-[240px]" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Logo Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-sidebar-border flex-shrink-0">
          <LogoApp collapsed={collapsed} mobileOpen={mobileOpen} />

          {/* Tombol Close Khusus Mobile */}
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-sidebar-accent md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {navItems.map((item) => {
            const active = pathname === item.id;
            const isTextVisible = !collapsed || mobileOpen;

            return (
              <button
                key={item.id}
                title={collapsed && !mobileOpen ? item.label : undefined}
                onClick={() => handleOnClick(item)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <item.icon
                  className={cn(
                    "w-4.5 h-4.5 flex-shrink-0",
                    active ? "text-sidebar-primary" : ""
                  )}
                  style={active ? { color: "var(--sidebar-primary)" } : {}}
                />
                <AnimatePresence>
                  {isTextVisible && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.1 }}
                      className="flex-1 text-left whitespace-nowrap truncate"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isTextVisible && item.badge && (
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
          {/* User Profile */}
          {(!collapsed || mobileOpen) && (
            <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl hover:bg-sidebar-accent/50 transition-colors group mb-1">
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
                  <Avatar className="h-10 w-10 border border-border/50">
                    <AvatarImage src={user?.profileUrl || undefined} alt={"Profile"} />
                    <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                      {getInitials(user?.name || "", user?.email || "")}
                    </AvatarFallback>
                  </Avatar>
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

          {/* Toggle Collapse Button (Desktop Only) */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex w-full items-center justify-center py-2 rounded-lg hover:bg-sidebar-accent/50 text-muted-foreground transition-colors"
          >
            {collapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        </div>
      </motion.aside>
    </>
  );
}