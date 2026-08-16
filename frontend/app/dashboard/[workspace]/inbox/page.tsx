"use client";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Bot, Check, CheckCircle, Eye, Globe, Headphones, ImageIcon, Mail, MapPin, Mic, MoreHorizontal, Paperclip, Phone, Plus, Search, SendHorizontal, Smile, Sparkles, Star } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Avatar } from "@/app/components/Avatar";
import cn from "@/app/components/ClassName";
import { ChannelBadge } from "@/app/components/ChannelBadge";
import { Badge } from "@/app/components/Bagde";
import { Btn } from "@/app/components/Button";


interface Conversation {
  id: string; name: string; initials: string; lastMsg: string;
  time: string; unread: number; online: boolean;
  channel: "whatsapp" | "instagram" | "telegram" | "email";
  isBot: boolean; color: string; agent?: string;
}

interface ChatMessage {
  id: string; content: string; from: "user" | "agent" | "bot";
  time: string; status?: "sent" | "delivered" | "read";
}
type ConvFilter = "all" | "mine" | "unassigned" | "bot" | "closed";

const chatMessages: ChatMessage[] = [
  { id: "1", content: "Hi! I need help with my recent order #ORD-8821.", from: "user", time: "10:30 AM" },
  { id: "2", content: "Hello Sarah! I'd be happy to help you with order #ORD-8821. Let me pull up the details for you.", from: "bot", time: "10:30 AM", status: "read" },
  { id: "3", content: "The order was placed 3 days ago but I still haven't received any shipping notification.", from: "user", time: "10:31 AM" },
  { id: "4", content: "I understand your concern! I can see that order #ORD-8821 is currently being processed at our warehouse. It should be shipped within the next 24 hours and you'll receive a tracking email.", from: "bot", time: "10:32 AM", status: "read" },
  { id: "5", content: "Can you expedite the shipping? I need it by Friday.", from: "user", time: "10:33 AM" },
  { id: "6", content: "I'm connecting you to a human agent who can assist with expedited shipping options. One moment please!", from: "bot", time: "10:33 AM", status: "read" },
  { id: "7", content: "Hi Sarah! This is Alex from the support team. I can see you'd like expedited shipping. We offer next-day delivery for $12.99. Would you like me to upgrade your order?", from: "agent", time: "10:35 AM", status: "read" },
  { id: "8", content: "Yes please! That would be great.", from: "user", time: "10:36 AM" },
  { id: "9", content: "Thanks! I'll check the order status right away.", from: "agent", time: "10:37 AM", status: "delivered" },
];
const conversations: Conversation[] = [
  { id: "1", name: "Sarah Johnson", initials: "SJ", lastMsg: "Thanks! I'll check the order status right away.", time: "2m", unread: 3, online: true, channel: "whatsapp", isBot: true, color: "#6366f1" },
  { id: "2", name: "Marcus Williams", initials: "MW", lastMsg: "When will my refund be processed?", time: "15m", unread: 1, online: true, channel: "instagram", isBot: false, color: "#10b981", agent: "Alex Chen" },
  { id: "3", name: "Emma Rodriguez", initials: "ER", lastMsg: "The product quality is excellent, 5 stars!", time: "1h", unread: 0, online: false, channel: "email", isBot: false, color: "#3b82f6" },
  { id: "4", name: "Liam Chen", initials: "LC", lastMsg: "Can I change my delivery address?", time: "2h", unread: 0, online: true, channel: "telegram", isBot: true, color: "#f59e0b" },
  { id: "5", name: "Olivia Davis", initials: "OD", lastMsg: "I love your new collection! 😍", time: "3h", unread: 0, online: false, channel: "instagram", isBot: false, color: "#8b5cf6", agent: "Maya Patel" },
  { id: "6", name: "Noah Martinez", initials: "NM", lastMsg: "Is this item available in size L?", time: "4h", unread: 0, online: false, channel: "whatsapp", isBot: true, color: "#ec4899" },
  { id: "7", name: "Ava Thompson", initials: "AT", lastMsg: "Thank you for resolving my issue!", time: "5h", unread: 0, online: false, channel: "email", isBot: false, color: "#14b8a6" },
  { id: "8", name: "Isabella Lee", initials: "IL", lastMsg: "How long does shipping take?", time: "6h", unread: 2, online: true, channel: "whatsapp", isBot: false, color: "#f59e0b" },
];
export default function InboxPage() {
  const [filter, setFilter] = useState<ConvFilter>("all");
  const [selectedConv, setSelectedConv] = useState(conversations[0]);
  const [message, setMessage] = useState("");
  const [showProfile, setShowProfile] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const filters: { id: ConvFilter; label: string; count?: number }[] = [
    { id: "all", label: "All", count: 28 },
    { id: "mine", label: "Mine", count: 12 },
    { id: "unassigned", label: "Unassigned", count: 8 },
    { id: "bot", label: "Bot", count: 5 },
    { id: "closed", label: "Closed" },
  ];

  const sendMessage = () => {
    if (!message.trim()) return;
    toast.success("Message sent");
    setMessage("");
  };

  return (
    <div className="h-full flex overflow-hidden">
      {/* Left: Conversation List */}
      <div className="w-72 xl:w-80 flex-shrink-0 border-r border-border flex flex-col bg-card">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="font-semibold text-sm flex-1">Conversations</h2>
            <Btn variant="primary" size="sm" icon={Plus}>New</Btn>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input className="w-full bg-muted rounded-lg pl-8 pr-3 py-1.5 text-xs border border-transparent focus:border-primary/30 focus:outline-none" placeholder="Search contacts..." />
          </div>
        </div>
        <div className="flex gap-1 p-2 border-b border-border overflow-x-auto">
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn("flex-shrink-0 px-2.5 py-1 rounded-md text-xs font-medium transition-colors", filter === f.id ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground hover:bg-muted")}
            >
              {f.label}{f.count ? ` (${f.count})` : ""}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => setSelectedConv(conv)}
              className={cn("w-full flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors border-b border-border/50 text-left", selectedConv.id === conv.id && "bg-primary/5 border-l-2 border-l-primary")}
            >
              <div className="relative flex-shrink-0">
                <Avatar initials={conv.initials} color={conv.color} size="md" online={conv.online} />
                <ChannelBadge channel={conv.channel} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground truncate">{conv.name}</span>
                  <span className="text-[10px] text-muted-foreground flex-shrink-0 ml-1">{conv.time}</span>
                </div>
                <p className="text-[11px] text-muted-foreground truncate mt-0.5">{conv.lastMsg}</p>
                <div className="flex items-center gap-2 mt-1">
                  {conv.isBot && <Badge variant="purple" className="text-[9px] px-1.5 py-0.5">AI</Badge>}
                  {conv.agent && <span className="text-[10px] text-muted-foreground">{conv.agent}</span>}
                  {conv.unread > 0 && <span className="ml-auto text-[10px] bg-primary text-white rounded-full px-1.5 py-0.5 font-bold">{conv.unread}</span>}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Center: Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-background">
        {/* Chat Header */}
        <div className="h-16 border-b border-border flex items-center gap-3 px-4 bg-card flex-shrink-0">
          <Avatar initials={selectedConv.initials} color={selectedConv.color} size="md" online={selectedConv.online} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">{selectedConv.name}</span>
              {selectedConv.isBot && <Badge variant="purple">Handled by AI</Badge>}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <ChannelBadge channel={selectedConv.channel} />
              <span>{selectedConv.online ? "Online" : "Offline"}</span>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {selectedConv.isBot && (
              <Btn variant="secondary" size="sm" icon={Headphones} onClick={() => toast.success("Took over conversation")}>Take Over</Btn>
            )}
            <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground" onClick={() => setShowProfile(!showProfile)}>
              <Eye className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {chatMessages.map(msg => (
            <div key={msg.id} className={cn("flex gap-2 max-w-[75%]", msg.from === "user" ? "ml-auto flex-row-reverse" : "mr-auto")}>
              {msg.from !== "user" && (
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: msg.from === "bot" ? "#6366f115" : "#10b98115" }}>
                  {msg.from === "bot" ? <Bot className="w-3.5 h-3.5 text-primary" /> : <Headphones className="w-3.5 h-3.5 text-emerald-600" />}
                </div>
              )}
              <div>
                {msg.from !== "user" && (
                  <span className="text-[10px] text-muted-foreground ml-1 mb-1 block">{msg.from === "bot" ? "AI Bot" : "Alex Chen"}</span>
                )}
                <div className={cn("px-3 py-2 rounded-2xl text-xs leading-relaxed",
                  msg.from === "user"
                    ? "bg-primary text-white rounded-tr-sm"
                    : "bg-card border border-border text-foreground rounded-tl-sm"
                )}>
                  {msg.content}
                </div>
                <div className={cn("flex items-center gap-1 mt-1 text-[10px] text-muted-foreground", msg.from === "user" ? "justify-end" : "justify-start")}>
                  <span>{msg.time}</span>
                  {msg.from === "user" && msg.status && (
                    <span>{msg.status === "read" ? <CheckCircle className="w-3 h-3 text-primary" /> : msg.status === "delivered" ? <Check className="w-3 h-3" /> : <Check className="w-3 h-3 opacity-50" />}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="border-t border-border p-3 bg-card flex-shrink-0">
          <div className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2">
            <div className="flex items-center gap-1">
              <button className="w-7 h-7 rounded flex items-center justify-center hover:bg-background transition-colors text-muted-foreground"><Smile className="w-4 h-4" /></button>
              <button className="w-7 h-7 rounded flex items-center justify-center hover:bg-background transition-colors text-muted-foreground"><Paperclip className="w-4 h-4" /></button>
              <button className="w-7 h-7 rounded flex items-center justify-center hover:bg-background transition-colors text-muted-foreground"><ImageIcon className="w-4 h-4" /></button>
              <button className="w-7 h-7 rounded flex items-center justify-center hover:bg-background transition-colors text-muted-foreground"><Mic className="w-4 h-4" /></button>
            </div>
            <input
              className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
              placeholder="Type a message... or / for canned responses"
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
            />
            <div className="flex items-center gap-1">
              <button className="w-7 h-7 rounded flex items-center justify-center hover:bg-background transition-colors text-muted-foreground">
                <Sparkles className="w-4 h-4 text-primary" />
              </button>
              <button
                onClick={sendMessage}
                className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
              >
                <SendHorizontal className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Customer Profile */}
      <AnimatePresence>
        {showProfile && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 288, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0 border-l border-border overflow-hidden bg-card"
          >
            <div className="w-72 h-full overflow-y-auto">
              <div className="p-4 border-b border-border">
                <div className="flex flex-col items-center text-center">
                  <Avatar initials={selectedConv.initials} color={selectedConv.color} size="lg" online={selectedConv.online} />
                  <h3 className="font-semibold mt-3 text-sm">{selectedConv.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="success">Active</Badge>
                    <Badge variant="purple">VIP</Badge>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground"><Phone className="w-3.5 h-3.5" /><span>+1 555-0101</span></div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground"><Mail className="w-3.5 h-3.5" /><span>sarah@example.com</span></div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground"><MapPin className="w-3.5 h-3.5" /><span>New York, US</span></div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground"><Globe className="w-3.5 h-3.5" /><span>WhatsApp</span></div>
                </div>
              </div>
              <div className="p-4 border-b border-border">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Customer Score</h4>
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-bold text-foreground">92</div>
                  <div>
                    <div className="text-xs text-muted-foreground">Excellent</div>
                    <div className="flex gap-0.5 mt-0.5">{[1,2,3,4,5].map(i => <Star key={i} className={cn("w-3 h-3", i <= 4 ? "fill-amber-400 text-amber-400" : "text-muted-foreground")} />)}</div>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Lifetime Value</span>
                  <span className="text-xs font-semibold text-foreground">$4,820</span>
                </div>
              </div>
              <div className="p-4 border-b border-border">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Recent Orders</h4>
                <div className="space-y-2">
                  {["#ORD-8821 — $89.00", "#ORD-7432 — $234.50", "#ORD-6891 — $45.00"].map(o => (
                    <div key={o} className="flex items-center justify-between text-xs">
                      <span className="text-foreground">{o.split("—")[0]}</span>
                      <span className="text-muted-foreground">{o.split("—")[1]}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Internal Notes</h4>
                <textarea
                  className="w-full bg-muted rounded-lg p-2 text-xs resize-none border border-transparent focus:border-primary/30 focus:outline-none"
                  rows={3}
                  placeholder="Add a note about this customer..."
                  defaultValue="VIP customer — prefers email updates. Had issue with last order shipping delay."
                />
                <div className="mt-3">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-1">
                    {["VIP", "Loyal", "High LTV"].map(t => <Badge key={t} variant="info">{t}</Badge>)}
                    <button className="text-[10px] text-primary hover:underline">+ Add</button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}