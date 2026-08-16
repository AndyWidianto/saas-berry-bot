"use client";

import { useState } from "react";
import { PageHeader } from "../../../components/PageHeader";
import { Btn } from "../../../components/Button";
import { ChannelBadge } from "../../../components/ChannelBadge";
import { CheckCircle, Download, Eye, Filter, MoreHorizontal, Plus, Search, Send, Target, X } from "lucide-react";
import cn from "../../../components/ClassName";
import { Card } from "../../../components/Cards";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge } from "../../../components/Bagde";
import { toast } from "sonner";


interface Campaign {
  id: string; name: string;
  status: "draft" | "scheduled" | "running" | "completed" | "failed";
  audience: number; sent: number; delivered: number; read: number;
  failed: number; ctr: number; scheduledAt: string; channel: string;
}

const campaigns: Campaign[] = [
  { id: "1", name: "Summer Sale 2024", status: "completed", audience: 12400, sent: 12400, delivered: 11950, read: 8820, failed: 450, ctr: 18.4, scheduledAt: "Jun 15, 2024", channel: "WhatsApp" },
  { id: "2", name: "Flash Deal - Weekend", status: "running", audience: 5800, sent: 4200, delivered: 4050, read: 2840, failed: 150, ctr: 22.1, scheduledAt: "Jul 12, 2024", channel: "WhatsApp" },
  { id: "3", name: "Re-engagement Q3", status: "scheduled", audience: 3200, sent: 0, delivered: 0, read: 0, failed: 0, ctr: 0, scheduledAt: "Jul 20, 2024", channel: "Email" },
  { id: "4", name: "New Product Launch", status: "draft", audience: 0, sent: 0, delivered: 0, read: 0, failed: 0, ctr: 0, scheduledAt: "—", channel: "WhatsApp" },
  { id: "5", name: "Loyalty Reward Program", status: "completed", audience: 2100, sent: 2100, delivered: 2040, read: 1680, failed: 60, ctr: 31.2, scheduledAt: "May 30, 2024", channel: "Telegram" },
];

const broadcastPerfData = [
  { name: "Summer Sale", sent: 12400, read: 8820, clicked: 2280 },
  { name: "Flash Deal", sent: 4200, read: 2840, clicked: 920 },
  { name: "Loyalty", sent: 2100, read: 1680, clicked: 524 },
  { name: "Product", sent: 6800, read: 4760, clicked: 1540 },
];


export default function BroadcastPage() {
  const [activeTab, setActiveTab] = useState<"campaigns" | "create">("campaigns");
  const [previewMsg, setPreviewMsg] = useState("Hey {{name}}! 🎉 Our Summer Sale is LIVE! Get up to 50% OFF on selected items. Shop now and use code SUMMER50. Limited time offer — ends Sunday!");

  const statusConfig: Record<Campaign["status"], { label: string; variant: "success" | "info" | "warning" | "danger" | "default" }> = {
    completed: { label: "Completed", variant: "success" },
    running: { label: "Running", variant: "info" },
    scheduled: { label: "Scheduled", variant: "warning" },
    draft: { label: "Draft", variant: "default" },
    failed: { label: "Failed", variant: "danger" },
  };

  return (
    <div className="h-full overflow-auto p-6">
      <PageHeader
        title="Broadcast Manager"
        subtitle="Send campaigns to your audience across all channels"
        actions={
          <>
            <Btn variant="secondary" size="sm" icon={Download}>Export</Btn>
            <Btn variant="primary" size="sm" icon={Plus} onClick={() => setActiveTab("create")}>New Campaign</Btn>
          </>
        }
      />
      <div className="flex gap-1 mb-6 border-b border-border">
        {[{ id: "campaigns", label: "Campaigns" }, { id: "create", label: "Create Campaign" }].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id as any)} className={cn("px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px", activeTab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "campaigns" && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Sent", value: "36,800", icon: Send, color: "#6366f1" },
              { label: "Delivered", value: "35,140", icon: CheckCircle, color: "#10b981" },
              { label: "Read Rate", value: "71.8%", icon: Eye, color: "#3b82f6" },
              { label: "Avg CTR", value: "23.9%", icon: Target, color: "#f59e0b" },
            ].map(s => (
              <Card key={s.label} className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${s.color}15` }}>
                  <s.icon className="w-5 h-5" style={{ color: s.color }} />
                </div>
                <div>
                  <div className="text-xl font-bold text-foreground">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              </Card>
            ))}
          </div>

          {/* Broadcast Performance Chart */}
          <Card className="p-5 mb-6">
            <h3 className="font-semibold text-sm mb-4">Campaign Performance</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={broadcastPerfData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="sent" name="Sent" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="read" name="Read" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="clicked" name="Clicked" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Campaigns Table */}
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold text-sm">All Campaigns</h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input className="bg-muted rounded-lg pl-8 pr-3 py-1.5 text-xs w-48 border border-border focus:outline-none" placeholder="Search campaigns..." />
                </div>
                <Btn variant="secondary" size="sm" icon={Filter}>Filter</Btn>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-border">
                  {["Campaign", "Channel", "Status", "Audience", "Sent", "Read", "CTR", "Scheduled", ""].map(h => (
                    <th key={h} className="text-left text-[11px] font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {campaigns.map(c => {
                    const st = statusConfig[c.status];
                    const deliveryPct = c.audience > 0 ? Math.round((c.delivered / c.audience) * 100) : 0;
                    return (
                      <tr key={c.id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="px-4 py-3"><span className="text-xs font-medium text-foreground">{c.name}</span></td>
                        <td className="px-4 py-3"><ChannelBadge channel={c.channel.toLowerCase() as any} /></td>
                        <td className="px-4 py-3"><Badge variant={st.variant}>{st.label}</Badge></td>
                        <td className="px-4 py-3 text-xs text-foreground">{c.audience.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <div>
                            <span className="text-xs text-foreground">{c.sent.toLocaleString()}</span>
                            {c.status === "running" && (
                              <div className="mt-1 w-20 h-1 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full" style={{ width: `${deliveryPct}%` }} />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-foreground">{c.read.toLocaleString()}</td>
                        <td className="px-4 py-3 text-xs font-medium text-foreground">{c.ctr > 0 ? `${c.ctr}%` : "—"}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{c.scheduledAt}</td>
                        <td className="px-4 py-3">
                          <button className="text-muted-foreground hover:text-foreground"><MoreHorizontal className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {activeTab === "create" && (
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* Form */}
          <div className="xl:col-span-3 space-y-5">
            <Card className="p-5">
              <h3 className="font-semibold text-sm mb-4">Campaign Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Campaign Name</label>
                  <input className="w-full bg-muted rounded-lg px-3 py-2.5 text-sm border border-border focus:border-primary/50 focus:outline-none" placeholder="e.g. Summer Flash Sale" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">Channel</label>
                    <select className="w-full bg-muted rounded-lg px-3 py-2.5 text-sm border border-border focus:outline-none">
                      <option>WhatsApp</option><option>Telegram</option><option>Email</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">Audience Segment</label>
                    <select className="w-full bg-muted rounded-lg px-3 py-2.5 text-sm border border-border focus:outline-none">
                      <option>All Contacts</option><option>VIP Customers</option><option>New Users</option><option>Inactive (30d)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Message Content</label>
                  <textarea
                    className="w-full bg-muted rounded-lg px-3 py-2.5 text-sm border border-border focus:border-primary/50 focus:outline-none resize-none"
                    rows={5}
                    value={previewMsg}
                    onChange={e => setPreviewMsg(e.target.value)}
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">Use {"{{name}}"}, {"{{email}}"} for personalization. {previewMsg.length}/1024 chars.</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Tags (audience filter)</label>
                  <div className="flex flex-wrap gap-1.5 p-2.5 bg-muted rounded-lg border border-border">
                    {["VIP", "Loyal", "Active"].map(t => <span key={t} className="flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-1 rounded-full"><span>{t}</span><X className="w-3 h-3 cursor-pointer" /></span>)}
                    <input className="bg-transparent text-xs outline-none" placeholder="Add tag..." />
                  </div>
                </div>
              </div>
            </Card>
            <Card className="p-5">
              <h3 className="font-semibold text-sm mb-4">Schedule</h3>
              <div className="flex gap-2 mb-4">
                {["Send Now", "Schedule Later"].map(opt => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm">
                    <input type="radio" name="schedule" defaultChecked={opt === "Send Now"} className="accent-primary" />
                    {opt}
                  </label>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Date</label>
                  <input type="date" className="w-full bg-muted rounded-lg px-3 py-2.5 text-sm border border-border focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Timezone</label>
                  <select className="w-full bg-muted rounded-lg px-3 py-2.5 text-sm border border-border focus:outline-none">
                    <option>UTC+7 (WIB)</option><option>UTC+0</option><option>UTC-5 (EST)</option>
                  </select>
                </div>
              </div>
            </Card>
            <div className="flex gap-3 justify-end">
              <Btn variant="secondary">Save Draft</Btn>
              <Btn variant="primary" icon={Send} onClick={() => toast.success("Campaign scheduled successfully!")}>Schedule Campaign</Btn>
            </div>
          </div>

          {/* Preview */}
          <div className="xl:col-span-2">
            <Card className="p-5 sticky top-0">
              <h3 className="font-semibold text-sm mb-4">Live Preview</h3>
              <div className="flex justify-center">
                <div className="w-56 bg-slate-800 rounded-3xl p-3 shadow-xl">
                  <div className="bg-white dark:bg-slate-700 rounded-2xl overflow-hidden">
                    <div className="bg-emerald-500 px-3 py-2 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center"><span className="text-[9px] font-bold text-white">B</span></div>
                      <div>
                        <div className="text-[10px] font-semibold text-white">Business Name</div>
                        <div className="text-[8px] text-white/70">WhatsApp Business</div>
                      </div>
                    </div>
                    <div className="p-3 bg-[#e5ddd5] min-h-40">
                      <div className="bg-white rounded-xl rounded-tl-sm p-2.5 shadow-sm max-w-[90%]">
                        <p className="text-[10px] text-gray-800 leading-relaxed">{previewMsg.replace("{{name}}", "Sarah")}</p>
                        <p className="text-[8px] text-gray-400 text-right mt-1">10:30 AM ✓✓</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Estimated reach</span><span className="font-medium text-foreground">12,400 contacts</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Character count</span><span className="font-medium text-foreground">{previewMsg.length} / 1024</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Estimated cost</span><span className="font-medium text-foreground">$24.80</span></div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}