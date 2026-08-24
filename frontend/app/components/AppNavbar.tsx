import { AlertCircle, AlertTriangle, BarChart3, Bell, Bot, Building2, Check, CheckCircle2, ChevronDown, ChevronsUpDown, Clock, CreditCard, InboxIcon, Info, LayoutDashboard, Menu, Moon, Plus, Puzzle, RadioIcon, Search, SettingsIcon, Sun, UserCheck, Users, Wallet } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import cn from "./ClassName";
import { Avatar } from "./Avatar";
import useAxios from "@/lib/axios-service";
import { useBalanceStore } from "@/lib/store/balanceStore";
import { useParams, usePathname, useRouter } from "next/navigation";
import useAuthStore from "@/lib/store/authStore";
import { useWorkspaceStore } from "@/lib/store/workspaceStore";
import CreateWorkspaceModal from "./CreateWorkspaceModal";
import { toast } from "sonner";
import axios from "axios";
import { Notification, NotificationAction, Workspace } from "@/lib/types";


interface AppNavbarProps {
  darkMode: boolean;
  mobileOpen: boolean;
  setDarkMode: (v: boolean) => void;
  page: string;
  setMobileOpen: (state: boolean) => void
}

export default function AppNavbar({
  darkMode,
  setDarkMode,
  page,
  mobileOpen,
  setMobileOpen,
}: AppNavbarProps) {
  const { balance, setBalance } = useBalanceStore();
  const { AxiosPrivate } = useAxios();
  const { user } = useAuthStore();
  const { workspace: workspaceId } = useParams();
  const { workspaces, setWorkspace, workspace, setWorkspaces } = useWorkspaceStore();

  const [notifOpen, setNotifOpen] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [isOpenModalWorkspace, setIsOpenModalWorkspace] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoadingFetch, setIsLoadingFetch] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check if there are any unread notifications
  const hasUnread = notifications.some((n) => !n.isRead);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper: Get icon & color theme based on notification level
  const getLevelBadge = (level: string) => {
    switch (level?.toUpperCase()) {
      case 'ERROR':
        return {
          icon: <AlertCircle className="w-3.5 h-3.5 text-destructive" />,
          bgColor: 'bg-destructive/10 border-destructive/20',
          textColor: 'text-destructive',
        };
      case 'WARNING':
        return {
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />,
          bgColor: 'bg-amber-500/10 border-amber-500/20',
          textColor: 'text-amber-600 dark:text-amber-400',
        };
      case 'SUCCESS':
        return {
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />,
          bgColor: 'bg-emerald-500/10 border-emerald-500/20',
          textColor: 'text-emerald-600 dark:text-emerald-400',
        };
      case 'INFO':
      default:
        return {
          icon: <Info className="w-3.5 h-3.5 text-blue-500" />,
          bgColor: 'bg-blue-500/10 border-blue-500/20',
          textColor: 'text-blue-600 dark:text-blue-400',
        };
    }
  };

  const formatTime = (dateInput: string | Date) => {
    const date = new Date(dateInput);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Baru saja';
    if (diffInMinutes < 60) return `${diffInMinutes}m yang lalu`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}j yang lalu`;
    return `${Math.floor(diffInMinutes / 1440)}h yang lalu`;
  };

  const fetchWorkspaces = async () => {
    setIsLoadingFetch(true);
    try {
      const res = await AxiosPrivate.get("/workspaces");
      const data = res.data;
      const newWorkspaces = data.data as Workspace[];
      console.log(newWorkspaces);
      setWorkspaces(newWorkspaces);
      setWorkspace(newWorkspaces[0]);
      if (!newWorkspaces.find(wp => wp.id === workspaceId)) {
        router.push(`/dashboard/${newWorkspaces[0].id}`);
      }
    } catch (err) {
      console.error("Fetch error: ", err);
    } finally {
      setIsLoadingFetch(false);
    }
  }

  const pathname = usePathname();

  const handleSwitchWorkspace = (newWorkspaceId: string) => {
    const segments = pathname.split("/");
    segments[2] = newWorkspaceId;
    const newPath = segments.join("/");
    router.replace(newPath, { scroll: false });
  };

  const router = useRouter();
  const pageTitle = page ?? "Dashboard";

  const createWorkspace = async (formData: { name: string }) => {
    setIsLoading(true);
    try {
      const res = await AxiosPrivate.post("/workspaces", formData);
      const data = res.data;
      const newWorkspace = data.data;
      setWorkspace(newWorkspace);
      setWorkspaces([...workspaces, newWorkspace]);

      router.push(`/dashboard/${newWorkspace.id}`);
      toast.success(data.message || "Create workspace successfully");
      setIsOpenModalWorkspace(false);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data.message;
        if (message) toast.error(message);
      }
      console.error("Fetch error: ", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await AxiosPrivate.get(`/${workspaceId}/notifications?status='UNREAD'`);
      const data = res.data;
      console.log(data);
      setNotifications(data.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data.message;
        if (message) toast.error(message);
      }
      console.error("Fetch error: ", err);
    }
  }

  const onMarkAllAsRead = async () => {
    try {
      setNotifications(prev => prev.map(p => ({ ...p, isRead: true })));
      await AxiosPrivate.post(`/${workspaceId}/notifications/markread/all`, {});
      toast.success("semua notifikasi berhasil ditandai.");
    } catch (err) {
      console.error("Fetch error: ", err);
    }
  }
  const onMarkAsRead = async (notif: Notification) => {
    try {
      setNotifications(prev => prev.map(p => ({ ...p, isRead: p.id === notif.id ? true : p.isRead })));
      await AxiosPrivate.post(`/${workspaceId}/notifications/markread`, {
        id: notif.id
      });
      const action: NotificationAction | null =notif.metadata?.action
      if (action) {
        if (action === "CONFIGURE_MODEL") {
          router.push(`/dashboard/${workspaceId}/chatbot?tab=settings`);
        }
        if (action === "LOW_BALANCE_ALERT") {
          router.push(`/dashboard/${workspaceId}/billing?tab=topup`);
        }
      }
    } catch (err) {
      console.error("Fetch error: ", err);
    }
  }

  const handleSelectWorkspace = (ws: Workspace) => {
    setWorkspace(ws);
    setWorkspaceOpen(false);
    handleSwitchWorkspace(ws.id);
  };

  const fetchBalance = async () => {
    if (!workspaceId) return;
    if (balance && balance.workspaceId === workspaceId) return;
    try {
      const res = await AxiosPrivate.get(`${workspaceId}/balance`);
      const result = res.data;
      setBalance(result.data);
    } catch (err) {
      console.error("Fetch Error: ", err);
    }
  };

  const formatted = (nominal: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(nominal);
  };

  useEffect(() => {
    fetchBalance();
    fetchNotifications();
    if (workspaces.length === 0) {
      fetchWorkspaces();
    }
  }, [workspaceId]);

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between gap-2 md:gap-4 px-3 sm:px-6 flex-shrink-0 z-10 w-full">
      <CreateWorkspaceModal
        isOpen={isOpenModalWorkspace}
        onClose={() => setIsOpenModalWorkspace(false)}
        onSave={(data) => createWorkspace(data)}
        isLoading={isLoading}
      />

      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors md:hidden shrink-0"
          aria-label="Open Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Workspace Dropdown */}
        <div className="relative shrink-0">
          <button
            onClick={() => setWorkspaceOpen(!workspaceOpen)}
            className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border border-border/80 bg-muted/40 hover:bg-muted text-sm font-medium text-foreground transition-all active:scale-95"
          >
            {workspace?.logoUrl ? (
              <img
                src={workspace.logoUrl}
                alt={workspace.name}
                className="w-6 h-6 rounded-lg object-cover shrink-0"
              />
            ) : (
              <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                {workspace?.name?.charAt(0)?.toUpperCase() || "W"}
              </div>
            )}
            <div className="flex flex-col text-left hidden sm:flex min-w-0">
              <span className="text-xs font-semibold leading-none max-w-[100px] lg:max-w-[140px] truncate">
                {workspace?.name || "Select Workspace"}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${workspace?.isAiActive ? "bg-emerald-500" : "bg-muted-foreground/40"
                    }`}
                />
                <span className="text-[10px] text-muted-foreground leading-tight truncate">
                  {workspace?.isAiActive ? "AI Active" : "AI Inactive"}
                </span>
              </div>
            </div>

            <ChevronsUpDown className="w-3.5 h-3.5 text-muted-foreground ml-0.5 sm:ml-1 shrink-0" />
          </button>

          {/* Workspace Dropdown Content */}
          <AnimatePresence>
            {workspaceOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 top-11 w-56 sm:w-60 bg-card border border-border rounded-xl shadow-xl z-50 p-1.5"
              >
                <div className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Workspaces
                </div>

                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => handleSelectWorkspace(ws)}
                    className={cn(
                      "w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors",
                      workspace?.id === ws.id
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-muted text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Building2 className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{ws.name}</span>
                    </div>
                    {workspace?.id === ws.id && <Check className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                ))}

                <div className="h-px bg-border my-1" />

                <button
                  onClick={() => {
                    setWorkspaceOpen(false);
                    setIsOpenModalWorkspace(true);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-primary hover:bg-primary/5 transition-colors font-medium"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Buat Workspace Baru</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Page Title (Disembunyikan di layar kecil) */}
        <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground min-w-0">
          <div className="h-4 w-px bg-border" />
          <span className="font-medium text-foreground truncate">{pageTitle}</span>
        </div>
      </div>

      {/* CENTER SECTION: SEARCH BAR (Sembunyi di mobile & tablet kecil) */}
      {/* <div className="flex-1 max-w-xs xl:max-w-md mx-2 hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            placeholder="Search conversations..."
            className="w-full bg-muted/60 rounded-lg pl-9 pr-8 py-1.5 text-xs lg:text-sm border border-transparent focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground bg-background border border-border rounded px-1.5 py-0.5 hidden lg:inline-block">
            ⌘K
          </kbd>
        </div>
      </div> */}

      {/* RIGHT SECTION: ACTIONS & USER PROFILE */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Indikator Saldo & Top Up (Ringkas di mobile) */}
        <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 bg-muted/50 border border-border/80 rounded-xl text-xs font-semibold text-foreground">
          <Wallet className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span className="text-[11px] sm:text-xs">
            {formatted(balance?.amount || 0)}
          </span>
          <button
            onClick={() => router.push(`/dashboard/${workspaceId}/billing`)}
            className="ml-0.5 w-5 h-5 rounded-md bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 shadow-sm transition-colors active:scale-95 shrink-0"
            title="Top Up Saldo"
          >
            <Plus className="w-3 h-3 stroke-[3]" />
          </button>
        </div>

        {/* Notification Bell */}
        <div className="relative" ref={dropdownRef}>
          {/* Bell Trigger Button */}
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors relative"
            aria-label="Notifikasi"
          >
            <Bell className="w-4 h-4" />
            {hasUnread && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive animate-pulse" />
            )}
          </button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-11 w-80 sm:w-96 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden flex flex-col"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-3.5 border-b border-border/80 bg-muted/30">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-xs sm:text-sm text-foreground">Notification</h3>
                    {hasUnread && (
                      <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-primary/10 text-primary rounded-full">
                        Baru
                      </span>
                    )}
                  </div>
                  {hasUnread && onMarkAllAsRead && (
                    <button
                      onClick={onMarkAllAsRead}
                      className="text-[11px] text-primary hover:underline font-medium flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      Tandai semua dibaca
                    </button>
                  )}
                </div>

                {/* List Item Notifikasi */}
                <div className="max-h-80 overflow-y-auto divide-y divide-border/40">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center flex flex-col items-center justify-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                        <Bell className="w-5 h-5 opacity-50" />
                      </div>
                      <p className="text-xs text-muted-foreground">Belum ada notifikasi saat ini.</p>
                    </div>
                  ) : (
                    notifications.map((item) => {
                      const levelTheme = getLevelBadge(item.level);

                      return (
                        <div
                          key={item.id}
                          onClick={() => !item.isRead && onMarkAsRead(item)}
                          className={`p-3.5 transition-colors flex gap-3 text-left items-start ${!item.isRead
                            ? 'bg-primary/[0.03] hover:bg-primary/[0.06] cursor-pointer'
                            : 'hover:bg-muted/50 opacity-80'
                            }`}
                        >
                          {/* Icon Indikator Level */}
                          <div
                            className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center border shrink-0 ${levelTheme.bgColor}`}
                          >
                            {levelTheme.icon}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-semibold text-xs text-foreground truncate">
                                {item.title}
                              </span>
                              <span className="text-[10px] text-muted-foreground whitespace-nowrap flex items-center gap-0.5">
                                <Clock className="w-2.5 h-2.5" />
                                {formatTime(item.createdAt)}
                              </span>
                            </div>

                            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                              {item.message}
                            </p>

                            <div className="flex items-center justify-between pt-1">
                              {/* Category Tag */}
                              <span className="text-[9px] font-medium tracking-wider uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border/50">
                                {item.category.replace('_', ' ')}
                              </span>

                              {/* Unread dot */}
                              {!item.isRead && (
                                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dark Mode Toggle (Disembunyikan di hp paling kecil untuk menghemat ruang) */}
        {/* <button
          onClick={() => setDarkMode(!darkMode)}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg hidden sm:flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button> */}

        {/* User Profile */}
        <div className="flex items-center gap-1.5 pl-1.5 sm:pl-2 border-l border-border">
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
          <div className="hidden xl:block">
            <div className="text-xs font-medium text-foreground leading-tight truncate max-w-[90px]">
              {user?.name}
            </div>
            <div className="text-[10px] text-muted-foreground truncate">
              {user?.role?.toLowerCase()}
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden sm:block shrink-0" />
        </div>
      </div>
    </header>
  );
}