"use client";

import {
    Bot, Users, CheckCircle, Headphones, RadioIcon, AlertTriangle,
    MessageSquare, Activity, Target, Brain, Calendar, Download
} from "lucide-react";
import { motion } from "motion/react";
import cn from "../../components/ClassName";
import { Card, StatCard } from "../../components/Cards";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { COLORS } from "@/lib/colors";
import { PageHeader } from "@/app/components/PageHeader";
import { Btn } from "@/app/components/Button";
import { Badge } from "@/app/components/Bagde";





export default function DashboardPage() {
    const growthData = [
        { month: "Jan", contacts: 8200, active: 6100 },
        { month: "Feb", contacts: 9400, active: 7200 },
        { month: "Mar", contacts: 10800, active: 8400 },
        { month: "Apr", contacts: 12100, active: 9600 },
        { month: "May", contacts: 13900, active: 11200 },
        { month: "Jun", contacts: 15800, active: 12800 },
        { month: "Jul", contacts: 17200, active: 14100 },
    ];
    const msgTrendData = [
        { day: "Mon", incoming: 420, resolved: 380, escalated: 42 },
        { day: "Tue", incoming: 580, resolved: 520, escalated: 58 },
        { day: "Wed", incoming: 490, resolved: 450, escalated: 40 },
        { day: "Thu", incoming: 720, resolved: 640, escalated: 80 },
        { day: "Fri", incoming: 860, resolved: 780, escalated: 76 },
        { day: "Sat", incoming: 540, resolved: 500, escalated: 40 },
        { day: "Sun", incoming: 310, resolved: 290, escalated: 22 },
    ];
    const stats = [
        { title: "Total Messages", value: "24,812", change: "12.4%", positive: true, icon: MessageSquare, color: "#6366f1", subtitle: "vs last week" },
        { title: "Active Conversations", value: "342", change: "8.2%", positive: true, icon: Activity, color: "#10b981", subtitle: "Right now" },
        { title: "Broadcast Sent", value: "18,604", change: "5.7%", positive: true, icon: RadioIcon, color: "#3b82f6", subtitle: "This month" },
        { title: "Conversion Rate", value: "22.8%", change: "3.1%", positive: true, icon: Target, color: "#f59e0b", subtitle: "From broadcasts" },
        { title: "New Contacts", value: "1,423", change: "2.3%", positive: false, icon: Users, color: "#8b5cf6", subtitle: "This week" },
        { title: "AI Resolution Rate", value: "76.4%", change: "4.8%", positive: true, icon: Brain, color: "#ec4899", subtitle: "Handled by AI" },
    ];

    const activity = [
        { id: 1, icon: Bot, text: "AI Bot resolved conversation with Liam Chen", time: "2m ago", color: "#6366f1" },
        { id: 2, icon: Users, text: "New lead captured: Priya Kumar via WhatsApp", time: "8m ago", color: "#10b981" },
        { id: 3, icon: CheckCircle, text: "Campaign 'Summer Sale 2024' completed successfully", time: "1h ago", color: "#3b82f6" },
        { id: 4, icon: Headphones, text: "Human takeover: Marcus Williams escalated to Maya Patel", time: "2h ago", color: "#f59e0b" },
        { id: 5, icon: RadioIcon, text: "Broadcast 'Flash Deal' started sending to 5,800 contacts", time: "3h ago", color: "#8b5cf6" },
        { id: 6, icon: AlertTriangle, text: "Low AI confidence — 5 conversations flagged for review", time: "4h ago", color: "#ef4444" },
    ];


    const chatVolumeData = [
        { hour: "06:00", volume: 28 }, { hour: "08:00", volume: 84 },
        { hour: "10:00", volume: 152 }, { hour: "12:00", volume: 188 },
        { hour: "14:00", volume: 164 }, { hour: "16:00", volume: 212 },
        { hour: "18:00", volume: 176 }, { hour: "20:00", volume: 98 },
        { hour: "22:00", volume: 42 },
    ];

    const channelData = [
        { name: "WhatsApp", value: 48 }, { name: "Instagram", value: 24 },
        { name: "Telegram", value: 14 }, { name: "Email", value: 14 },
    ];

    const quotas = [
        { label: "WhatsApp Quota", used: 8840, total: 10000, color: "#10b981" },
        { label: "Broadcast Usage", used: 18604, total: 25000, color: "#6366f1" },
        { label: "AI Token Usage", used: 720000, total: 1000000, color: "#f59e0b" },
        { label: "Storage", used: 6.8, total: 10, color: "#3b82f6", unit: "GB" },
    ];

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-xs">
                    <p className="font-medium mb-2 text-foreground">{label}</p>
                    {payload.map((p: any, i: number) => (
                        <div key={i} className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                            <span className="text-muted-foreground">{p.name}:</span>
                            <span className="font-medium text-foreground">{p.value.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="h-full overflow-auto p-6">
            <PageHeader
                title="Dashboard"
                subtitle="Welcome back, Alex. Here's what's happening today."
                actions={
                    <>
                        <Btn variant="secondary" size="sm" icon={Calendar}>Jul 1 – Jul 15</Btn>
                        <Btn variant="primary" size="sm" icon={Download}>Export</Btn>
                    </>
                }
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
                {stats.map((s, i) => (
                    <motion.div key={s.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className={i < 3 ? "" : "hidden xl:block"}>
                        <StatCard {...s} />
                    </motion.div>
                ))}
                {/* Show remaining on medium screens */}
                {stats.slice(3).map((s, i) => (
                    <motion.div key={s.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (i + 3) * 0.06 }} className="xl:hidden">
                        <StatCard {...s} />
                    </motion.div>
                ))}
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                <Card className="p-5 lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-semibold text-sm text-foreground">Message Trend</h3>
                            <p className="text-xs text-muted-foreground">Incoming vs resolved this week</p>
                        </div>
                        <Badge variant="success">+12.4% vs last week</Badge>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={msgTrendData}>
                            <defs>
                                <linearGradient id="colorIncoming" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 11 }} />
                            <Area type="monotone" dataKey="incoming" name="Incoming" stroke="#6366f1" strokeWidth={2} fill="url(#colorIncoming)" />
                            <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#10b981" strokeWidth={2} fill="url(#colorResolved)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </Card>

                <Card className="p-5">
                    <div className="mb-4">
                        <h3 className="font-semibold text-sm text-foreground">Channel Distribution</h3>
                        <p className="text-xs text-muted-foreground">By message volume</p>
                    </div>
                    <ResponsiveContainer width="100%" height={160}>
                        <PieChart>
                            <Pie data={channelData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                                {channelData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Pie>
                            <Tooltip formatter={(v: any) => `${v}%`} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2">
                        {channelData.map((c, i) => (
                            <div key={c.name} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                                    <span className="text-muted-foreground">{c.name}</span>
                                </div>
                                <span className="font-medium text-foreground">{c.value}%</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <Card className="p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-semibold text-sm text-foreground">Chat Volume by Hour</h3>
                            <p className="text-xs text-muted-foreground">Today's peak hours</p>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={chatVolumeData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                            <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="volume" name="Messages" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>

                <Card className="p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-semibold text-sm text-foreground">Customer Growth</h3>
                            <p className="text-xs text-muted-foreground">Total vs active contacts</p>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={growthData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 11 }} />
                            <Line type="monotone" dataKey="contacts" name="Total" stroke="#6366f1" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="active" name="Active" stroke="#10b981" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Recent Activity */}
                <Card className="p-5 lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-sm text-foreground">Recent Activity</h3>
                        <button className="text-xs text-primary hover:underline">View all</button>
                    </div>
                    <div className="space-y-3">
                        {activity.map(a => (
                            <div key={a.id} className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${a.color}15` }}>
                                    <a.icon className="w-4 h-4" style={{ color: a.color }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-foreground">{a.text}</p>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">{a.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Quota Cards */}
                <Card className="p-5">
                    <h3 className="font-semibold text-sm text-foreground mb-4">Usage Quotas</h3>
                    <div className="space-y-4">
                        {quotas.map(q => {
                            const pct = Math.round((q.used / q.total) * 100);
                            return (
                                <div key={q.label}>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-xs text-muted-foreground">{q.label}</span>
                                        <span className="text-xs font-medium text-foreground">{pct}%</span>
                                    </div>
                                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${pct}%` }}
                                            transition={{ duration: 0.8, ease: "easeOut" }}
                                            className="h-full rounded-full"
                                            style={{ backgroundColor: q.color }}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-[10px] text-muted-foreground">
                                            {q.unit ? `${q.used}${q.unit}` : q.used.toLocaleString()}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground">
                                            {q.unit ? `${q.total}${q.unit}` : q.total.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <button className="w-full mt-4 py-2 text-xs font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors border border-primary/20">
                        Upgrade Plan
                    </button>
                </Card>
            </div>
        </div>
    );
}