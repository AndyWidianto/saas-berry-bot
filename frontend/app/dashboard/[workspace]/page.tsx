"use client";

import { useEffect, useRef, useState } from "react";
import { PageHeader } from "../../components/PageHeader";
import { Btn } from "../../components/Button";
import { Bot, Brain, Clock, Cpu, Download, Sparkles, Star, TrendingUp, Users } from "lucide-react";
import { Card, StatCard } from "../../components/Cards";
import { Area, AreaChart, Bar, CartesianGrid, Line, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Cell, ReferenceLine } from "recharts";
import cn from "../../components/ClassName";
import { COLORS } from "../../../lib/colors";
import { DashboardAnalytics, DashboardAnalyticsChart, DashboardPeakAndDistribution, DashboarModelPerformance } from "@/lib/types";
import useAxios from "@/lib/axios-service";
import { useParams } from "next/navigation";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Skeleton } from "@/app/components/Skeletons";


export default function DashboardPage() {
    const { AxiosPrivate } = useAxios();
    const { workspace: workspaceId } = useParams();
    const [range, setRange] = useState<"7d" | "30d" | "90d">("30d");
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const [dashboardAnalytics, setDashboardAnalytics] = useState<DashboardAnalytics | null>(null);
    const [dashboardAnalyticsChart, setDashboardAnalyticsChart] = useState<DashboardAnalyticsChart | null>(null);
    const [dashboardModelPerformance, setDashboardModelPerformance] = useState<DashboarModelPerformance[]>([]);
    const [dashboardPeakAndDistribution, setDashboardPeakAndDistribution] = useState<DashboardPeakAndDistribution | null>(null);

    const dashboardRef = useRef<HTMLDivElement>(null);
    const modelPerformanceRef = useRef<HTMLDivElement>(null);

    const getStatCardsData = (analytics: DashboardAnalytics) => {
        return [
            {
                key: 'avgResponseTime',
                label: 'Avg Response Time',
                value: analytics.avgResponseTime.value,
                change: `${analytics.avgResponseTime.changePercentage > 0 ? '+' : ''}${analytics.avgResponseTime.changePercentage}%`,
                positive: analytics.avgResponseTime.isImprovement,
                icon: Clock,
                color: 'blue',
            },
            {
                key: 'aiResolutionRate',
                label: 'AI Resolution Rate',
                value: analytics.aiResolutionRate.value,
                change: `${analytics.aiResolutionRate.changePercentage > 0 ? '+' : ''}${analytics.aiResolutionRate.changePercentage}%`,
                positive: analytics.aiResolutionRate.isImprovement,
                icon: Bot,
                color: 'green',
            },
            {
                key: 'avgConfidence',
                label: 'Avg Confidence',
                value: analytics.avgConfidence.value,
                change: `${analytics.avgConfidence.changePercentage > 0 ? '+' : ''}${analytics.avgConfidence.changePercentage}%`,
                positive: analytics.avgConfidence.isImprovement,
                icon: Sparkles,
                color: 'purple',
            },
            {
                key: 'retentionRate',
                label: 'Retention Rate',
                value: analytics.retentionRate.value,
                change: `${analytics.retentionRate.changePercentage > 0 ? '+' : ''}${analytics.retentionRate.changePercentage}%`,
                positive: analytics.retentionRate.isImprovement,
                icon: Users,
                color: 'orange',
            },
        ];
    };

    const fetchAllDashboardData = async () => {
        setIsLoading(true);
        try {
            const [resAnalytics, resChart, resPerformance, resPeak] = await Promise.all([
                AxiosPrivate.get(`/${workspaceId}/dashboard/analytics?range=${range}`),
                AxiosPrivate.get(`/${workspaceId}/dashboard/analytics/charts?range=${range}`),
                AxiosPrivate.get(`/${workspaceId}/dashboard/analytics/model/performance?range=${range}`),
                AxiosPrivate.get(`/${workspaceId}/dashboard/analytics/peak-and-distribution?range=${range}`)
            ]);

            setDashboardAnalytics(resAnalytics.data);
            setDashboardAnalyticsChart(resChart.data);
            setDashboardModelPerformance(resPerformance.data);
            setDashboardPeakAndDistribution(resPeak.data);
        } catch (err) {
            console.error("Dashboard fetch error: ", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (workspaceId) {
            fetchAllDashboardData();
        }
    }, [range, workspaceId]);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-xs">
                    <p className="font-medium mb-2 text-foreground">{label}</p>
                    {payload.map((p: any, i: number) => (
                        <div key={i} className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                            <span className="text-muted-foreground">{p.name}:</span>
                            <span className="font-medium text-foreground">{p.value}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    const handleExportModelPerformancePdf = () => {
        if (!dashboardModelPerformance || dashboardModelPerformance.length === 0) return;

        const doc = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
        });

        doc.setFontSize(16);
        doc.setTextColor(15, 23, 42);
        doc.text("AI Model Performance Report", 14, 20);

        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text("Processed messages, confidence score, and latency breakdown", 14, 26);

        const tableHead = [["Model", "Handled", "Confidence", "Avg Latency", "Success Rate"]];
        const tableData = dashboardModelPerformance.map((item) => [
            item.agent,
            item.resolved,
            item.confidence,
            item.avgTime,
            `${item.performance}%`,
        ]);

        autoTable(doc, {
            startY: 32,
            head: tableHead,
            body: tableData,
            theme: "striped",
            headStyles: {
                fillColor: [15, 23, 42],
                textColor: [255, 255, 255],
                fontSize: 9,
                fontStyle: "bold",
            },
            bodyStyles: {
                fontSize: 9,
                textColor: [51, 65, 85],
            },
            alternateRowStyles: {
                fillColor: [248, 250, 252],
            },
            margin: { left: 14, right: 14 },
        });

        doc.save(`ai-model-performance-${workspaceId || "report"}.pdf`);
    };

    return (
        <div className="h-full overflow-auto p-6" ref={dashboardRef}>
            <PageHeader
                title="Dashboard"
                subtitle="Wawasan performa mendalam di seluruh saluran"
                actions={
                    <div className="flex items-center rounded-lg border border-border overflow-hidden text-xs">
                        {(["7d", "30d", "90d"] as const).map(r => (
                            <button
                                key={r}
                                onClick={() => setRange(r)}
                                className={cn(
                                    "px-3 py-1.5 font-medium transition-colors",
                                    range === r ? "bg-primary text-white" : "bg-card text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                }
            />

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i} className="p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-8 w-8 rounded-lg" />
                            </div>
                            <Skeleton className="h-7 w-20" />
                            <Skeleton className="h-3 w-16" />
                        </Card>
                    ))
                ) : (
                    dashboardAnalytics && getStatCardsData(dashboardAnalytics).map((card) => (
                        <StatCard
                            key={card.key}
                            title={card.label}
                            value={card.value}
                            change={card.change}
                            positive={card.positive}
                            icon={card.icon}
                            color={card.color}
                        />
                    ))
                )}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <Card className="p-5">
                    <h3 className="font-semibold text-sm mb-1">AI Latency Trend</h3>
                    <p className="text-xs text-muted-foreground mb-4">Average response time vs target (seconds)</p>
                    {isLoading ? (
                        <Skeleton className="w-full h-[200px] rounded-md" />
                    ) : (
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={dashboardAnalyticsChart?.responseTimeData}>
                                <defs>
                                    <linearGradient id="gradAvg" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} unit="s" />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="avgLatencySec" name="Avg Latency (s)" stroke="#6366f1" strokeWidth={2} fill="url(#gradAvg)" />
                                <ReferenceLine y={3} label={{ value: 'Target 3s', fill: '#ef4444', fontSize: 10 }} stroke="#ef4444" strokeDasharray="4 4" />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </Card>

                <Card className="p-5">
                    <h3 className="font-semibold text-sm mb-1">Message & Contact Growth</h3>
                    <p className="text-xs text-muted-foreground mb-4">Monthly total messages vs active contacts</p>
                    {isLoading ? (
                        <Skeleton className="w-full h-[200px] rounded-md" />
                    ) : (
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={dashboardAnalyticsChart?.growthData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="totalMessages" name="Total Messages" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="activeContacts" name="Active Contacts" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </Card>
            </div>

            {/* Model Performance Table */}
            <Card className="p-5 mb-4" ref={modelPerformanceRef}>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="font-semibold text-sm">AI Model Performance</h3>
                        <p className="text-xs text-muted-foreground">
                            Processed messages, confidence score, and latency breakdown
                        </p>
                    </div>
                    <Btn
                        variant="secondary"
                        size="sm"
                        icon={Download}
                        onClick={handleExportModelPerformancePdf}
                        disabled={isLoading || dashboardModelPerformance.length === 0}
                    >
                        Export
                    </Btn>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border">
                                {["Model", "Handled", "Confidence", "Avg Latency", "Success Rate"].map((h) => (
                                    <th key={h} className="text-left text-[11px] font-medium text-muted-foreground px-3 py-2">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <tr key={i} className="border-b border-border/50">
                                        <td className="px-3 py-3"><Skeleton className="h-5 w-28" /></td>
                                        <td className="px-3 py-3"><Skeleton className="h-4 w-12" /></td>
                                        <td className="px-3 py-3"><Skeleton className="h-4 w-16" /></td>
                                        <td className="px-3 py-3"><Skeleton className="h-4 w-12" /></td>
                                        <td className="px-3 py-3"><Skeleton className="h-3 w-full" /></td>
                                    </tr>
                                ))
                            ) : (
                                dashboardModelPerformance.map((item) => {
                                    const perfPct = item.performance;
                                    return (
                                        <tr key={item.agent} className="border-b border-border/50 hover:bg-muted/30">
                                            <td className="px-3 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                                                        <Cpu className="w-3.5 h-3.5" />
                                                    </div>
                                                    <span className="text-xs font-medium text-foreground">{item.agent}</span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-3 text-xs font-mono text-foreground">{item.resolved}</td>
                                            <td className="px-3 py-3">
                                                <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                                                    <Sparkles className="w-3 h-3 fill-purple-400/20" />
                                                    <span className="text-xs font-medium text-foreground">{item.confidence}</span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-3 text-xs font-mono text-foreground">{item.avgTime}</td>
                                            <td className="px-3 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                                        <div className="h-full rounded-full bg-primary" style={{ width: `${perfPct}%` }} />
                                                    </div>
                                                    <span className="text-[10px] font-mono text-muted-foreground w-8">{perfPct}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Peak Hour + Channel */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="p-5">
                    <h3 className="font-semibold text-sm mb-1">Peak Chat Hours</h3>
                    <p className="text-xs text-muted-foreground mb-4">Volume by time of day</p>
                    {isLoading ? (
                        <Skeleton className="w-full h-[180px] rounded-md" />
                    ) : (
                        <ResponsiveContainer width="100%" height={180}>
                            <BarChart data={dashboardPeakAndDistribution?.peakHoursData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="volume" name="Chats" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </Card>

                <Card className="p-5">
                    <h3 className="font-semibold text-sm mb-1">Channel Distribution</h3>
                    <p className="text-xs text-muted-foreground mb-4">Share of conversations by channel</p>
                    {isLoading ? (
                        <Skeleton className="w-full h-[180px] rounded-md" />
                    ) : (
                        <div className="flex items-center gap-6">
                            <ResponsiveContainer width="50%" height={180}>
                                <PieChart>
                                    <Pie data={dashboardPeakAndDistribution?.channelDistributionData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                                        {dashboardPeakAndDistribution?.channelDistributionData.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex-1 space-y-3">
                                {dashboardPeakAndDistribution?.channelDistributionData.map((c, i) => (
                                    <div key={c.name}>
                                        <div className="flex items-center justify-between text-xs mb-1">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                                <span className="text-foreground">{c.name}</span>
                                            </div>
                                            <span className="font-medium text-foreground">{c.value}%</span>
                                        </div>
                                        <div className="h-1 bg-muted rounded-full overflow-hidden">
                                            <div className="h-full rounded-full" style={{ width: `${c.value}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}