import { Card, StatCard } from "@/components/Card"
import { ChartTooltip } from "@/components/ChartTool"
import { Building2,  Zap, DollarSign, MessageSquare } from "lucide-react"
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts"


const trafficData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i.toString().padStart(2, "0")}:00`,
    requests: Math.floor(800 + Math.random() * 1400),
    latency: Math.floor(40 + Math.random() * 120),
    errors: Math.floor(Math.random() * 30),
}))

const costRevenueData = [
    { month: "Feb", cost: 1240, revenue: 5800 },
    { month: "Mar", cost: 1580, revenue: 7200 },
    { month: "Apr", cost: 1320, revenue: 8100 },
    { month: "May", cost: 1890, revenue: 9400 },
    { month: "Jun", cost: 2100, revenue: 11200 },
    { month: "Jul", cost: 1950, revenue: 12800 },
    { month: "Aug", cost: 2340, revenue: 14600 },
]
export default function OverviewPage() {
    const services = [
        { name: "Ollama (Self-hosted)", status: "operational", latency: "42ms" },
        { name: "Gemini API", status: "operational", latency: "187ms" },
        { name: "OpenAI API", status: "degraded", latency: "412ms" },
        { name: "Evolution API (WA)", status: "operational", latency: "61ms" },
        { name: "Qdrant Vector DB", status: "operational", latency: "28ms" },
        { name: "Redis Cache", status: "operational", latency: "3ms" },
    ]

    return (
        <div className="p-6 space-y-5">
            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-4">
                <StatCard icon={<Building2 size={16} />} label="Total Workspaces" value="147" delta={12} deltaLabel="↑ 16 new this month" accent="violet" />
                <StatCard icon={<DollarSign size={16} />} label="Monthly Recurring Revenue" value="$14,820" delta={14} deltaLabel="MRR · Aug 2025" accent="emerald" />
                <StatCard icon={<Zap size={16} />} label="Tokens Consumed (Aug)" value="2.84B" delta={8} deltaLabel="Across all workspaces" accent="sky" />
                <StatCard icon={<MessageSquare size={16} />} label="Active Chatbot Sessions" value="3,412" delta={-4} deltaLabel="Live right now" accent="amber" />
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-5 gap-4">
                {/* API Traffic */}
                <Card className="col-span-3 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <div className="text-[13px] font-semibold text-white/80">Real-time API Traffic</div>
                            <div className="text-[11px] text-white/35 mt-0.5">Request volume & latency (last 24h)</div>
                        </div>
                        <div className="flex gap-3 text-[11px]">
                            <span className="flex items-center gap-1.5 text-white/40"><span className="w-2 h-2 rounded-full bg-violet-500 inline-block" /> Requests</span>
                            <span className="flex items-center gap-1.5 text-white/40"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Latency ms</span>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                        <AreaChart data={trafficData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                            <defs>
                                <linearGradient id="gReq" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="gLat" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="hour" tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }} tickLine={false} axisLine={false} interval={3} />
                            <YAxis tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }} tickLine={false} axisLine={false} />
                            <Tooltip content={<ChartTooltip />} />
                            <Area type="monotone" dataKey="requests" name="Requests" stroke="#6366f1" strokeWidth={1.5} fill="url(#gReq)" dot={false} />
                            <Area type="monotone" dataKey="latency" name="Latency ms" stroke="#f59e0b" strokeWidth={1.5} fill="url(#gLat)" dot={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                </Card>

                {/* Cost vs Revenue */}
                <Card className="col-span-2 p-5">
                    <div className="mb-4">
                        <div className="text-[13px] font-semibold text-white/80">AI Cost vs Revenue</div>
                        <div className="text-[11px] text-white/35 mt-0.5">Provider spend & tenant billing</div>
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={costRevenueData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }} barGap={2}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }} tickLine={false} axisLine={false} />
                            <YAxis tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }} tickLine={false} axisLine={false} />
                            <Tooltip content={<ChartTooltip />} />
                            <Bar dataKey="cost" name="AI Cost $" fill="rgba(244,63,94,0.5)" radius={[2, 2, 0, 0]} />
                            <Bar dataKey="revenue" name="Revenue $" fill="#6366f1" radius={[2, 2, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            {/* System Health */}
            <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="text-[13px] font-semibold text-white/80">System Health Monitor</div>
                    <span className="text-[11px] text-white/30">Updated just now</span>
                </div>
                <div className="grid grid-cols-6 gap-3">
                    {services.map((s) => (
                        <div key={s.name} className={`p-3 rounded-xl border ${s.status === "operational"
                                ? "border-emerald-500/15 bg-emerald-500/5"
                                : s.status === "degraded"
                                    ? "border-amber-500/20 bg-amber-500/5"
                                    : "border-rose-500/20 bg-rose-500/5"
                            }`}>
                            <div className="flex items-center gap-1.5 mb-2">
                                <span className={`w-1.5 h-1.5 rounded-full ${s.status === "operational" ? "bg-emerald-400" : s.status === "degraded" ? "bg-amber-400" : "bg-rose-400"
                                    }`} />
                                <span className={`text-[10px] font-medium uppercase tracking-wide ${s.status === "operational" ? "text-emerald-400" : s.status === "degraded" ? "text-amber-400" : "text-rose-400"
                                    }`}>{s.status}</span>
                            </div>
                            <div className="text-[12px] font-medium text-white/70 leading-tight">{s.name}</div>
                            <div className="text-[11px] text-white/35 mt-1 font-mono">{s.latency}</div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    )
}