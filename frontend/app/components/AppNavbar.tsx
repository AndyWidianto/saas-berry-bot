import { BarChart3, Bell, Bot, ChevronDown, CreditCard, InboxIcon, LayoutDashboard, Moon, Plus, Puzzle, RadioIcon, Search, SettingsIcon, Sun, UserCheck, Users, Wallet } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import cn from "./ClassName";
import { Avatar } from "./Avatar";
import useAxios from "@/lib/axios-service";
import { useBalanceStore } from "@/lib/store/balanceStore";
import { useParams } from "next/navigation";
import useAuthStore from "@/lib/store/authStore";


const navItems: { id: string; label: string; icon: React.ElementType; badge?: number }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "inbox", label: "Inbox", icon: InboxIcon, badge: 7 },
  { id: "chatbot", label: "AI Chatbot", icon: Bot },
  { id: "broadcast", label: "Broadcast", icon: RadioIcon },
  { id: "contacts", label: "Contacts", icon: Users },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "integrations", label: "Integrations", icon: Puzzle },
  { id: "team", label: "Team", icon: UserCheck },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];


export default function AppNavbar({ darkMode, setDarkMode, page }: { darkMode: boolean; setDarkMode: (v: boolean) => void; page: string }) {
  const { balance, setBalance } = useBalanceStore(); // Mengambil saldo dari store
  const { AxiosPrivate } = useAxios();
  const { user } = useAuthStore();
  const [notifOpen, setNotifOpen] = useState(false);
  const pageTitle = navItems.find(n => n.id === page)?.label ?? "Dashboard";
  const { workspace } = useParams();

  const notifications = [
    { id: 1, text: "New conversation from Sarah Johnson", time: "2m ago", read: false },
    { id: 2, text: "Campaign 'Flash Deal' reached 80% delivery", time: "15m ago", read: false },
    { id: 3, text: "James Wilson went offline", time: "1h ago", read: true },
    { id: 4, text: "AI bot escalated 3 conversations", time: "2h ago", read: true },
  ];

  const fetchBalance = async () => {
    if (balance !== null) return; // Jika saldo sudah ada, tidak perlu fetch lagi
    try {
      const res = await AxiosPrivate.get(`${workspace}/balance`);
      const result = res.data;
      setBalance(result.data.amount);
    } catch (err) {
      console.error("Fetch Error: ", err);
    }
  }

  const formatted = (nominal: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0, // Mengabaikan koma/desimal (dibulatkan)
    }).format(nominal);
  }

  useEffect(() => {
    fetchBalance();
  }, [workspace]);

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-sm flex items-center gap-4 px-6 flex-shrink-0 z-10">
      <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
        <span className="font-medium text-foreground">{pageTitle}</span>
      </div>
      <div className="flex-1 max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            placeholder="Search conversations, contacts..."
            className="w-full bg-muted rounded-lg pl-9 pr-4 py-2 text-sm border border-transparent focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground bg-background border border-border rounded px-1.5 py-0.5">⌘K</kbd>
        </div>
      </div>
      <div className="flex items-center gap-2 ml-auto">
        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
          </button>
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-11 w-80 bg-card border border-border rounded-xl shadow-xl z-50"
              >
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <h3 className="font-semibold text-sm">Notifications</h3>
                  <button className="text-xs text-primary hover:underline">Mark all read</button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n.id} className={cn("flex gap-3 px-4 py-3 hover:bg-muted/50 cursor-pointer", !n.read && "bg-primary/5")}>
                      <div className={cn("w-2 h-2 rounded-full mt-1.5 flex-shrink-0", n.read ? "bg-transparent" : "bg-primary")} />
                      <div>
                        <p className="text-xs text-foreground">{n.text}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* TAMBAHAN: Indikator Saldo & Tombol Top Up Plus */}
        <div className="flex items-center gap-2 px-2.5 py-1 bg-muted/50 border border-border/80 rounded-xl text-xs font-semibold text-foreground">
          <Wallet className="w-3.5 h-3.5 text-muted-foreground" />
          <span>{formatted(balance || 0) }</span>
          <button
            onClick={() => { }} // Silakan sesuaikan fungsi trigger modal Anda
            className="ml-1 w-5 h-5 rounded-md bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 shadow-sm transition-colors active:scale-95"
            title="Top Up Saldo"
          >
            <Plus className="w-3 h-3 stroke-[3]" />
          </button>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-border">
          <Avatar initials="AC" color="#6366f1" size="sm" />
          <div className="hidden sm:block">
            <div className="text-xs font-medium text-foreground leading-tight">{user?.name}</div>
            <div className="text-[10px] text-muted-foreground">{user?.role.toLocaleLowerCase()}</div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
      </div>
    </header>
  );
}