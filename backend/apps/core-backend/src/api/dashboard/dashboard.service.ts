import { PrismaService } from "@library/prisma/prisma.service";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import type { Cache } from "cache-manager";


@Injectable()
export class DashboardService {
    constructor(
        private prisma: PrismaService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) { }

    async getAnalytics(workspaceId: string, range?: string) {
        const valueCardDashboard = await this.cacheManager.get(`value-card-dashboard-${range}`);
        if (valueCardDashboard) {
            return valueCardDashboard;
        }
        const now = new Date();

        let durationMs: number;
        switch (range) {
            case "24h":
            case "1d":
                durationMs = 24 * 60 * 60 * 1000; // 1 Hari
                break;
            case "7d":
                durationMs = 7 * 24 * 60 * 60 * 1000; // 7 Hari
                break;
            case "90d":
                durationMs = 90 * 24 * 60 * 60 * 1000; // 90 Hari
                break;
            case "30d":
            default:
                durationMs = 30 * 24 * 60 * 60 * 1000; // 30 Hari (Default)
                break;
        }

        const currentPeriodStart = new Date(now.getTime() - durationMs);
        const previousPeriodStart = new Date(now.getTime() - durationMs * 2);

        // Filter dasar Prisma
        const baseWhereCurrent = {
            workspaceId,
            createdAt: { gte: currentPeriodStart },
        };

        const baseWherePrev = {
            workspaceId,
            createdAt: { gte: previousPeriodStart, lt: currentPeriodStart },
        };

        const [
            currentTotal,
            currentAgg,
            currentResolved,
            prevTotal,
            prevAgg,
            prevResolved,
        ] = await Promise.all([
            this.prisma.aiLog.count({ where: baseWhereCurrent }),
            this.prisma.aiLog.aggregate({
                _avg: { latencyMs: true, confidence: true },
                where: baseWhereCurrent,
            }),
            this.prisma.aiLog.count({
                where: {
                    ...baseWhereCurrent,
                    isFallback: false,
                    isEscalated: false,
                },
            }),
            this.prisma.aiLog.count({ where: baseWherePrev }),
            this.prisma.aiLog.aggregate({
                _avg: { latencyMs: true, confidence: true },
                where: baseWherePrev,
            }),
            this.prisma.aiLog.count({
                where: {
                    ...baseWherePrev,
                    isFallback: false,
                    isEscalated: false,
                },
            }),
        ]);

        const currAvgLatencySec = (currentAgg._avg.latencyMs || 0) / 1000;
        const prevAvgLatencySec = (prevAgg._avg.latencyMs || 0) / 1000;

        const responseTimeChange = prevAvgLatencySec > 0
            ? ((currAvgLatencySec - prevAvgLatencySec) / prevAvgLatencySec) * 100
            : 0;

        const currResRate = currentTotal > 0 ? (currentResolved / currentTotal) * 100 : 0;
        const prevResRate = prevTotal > 0 ? (prevResolved / prevTotal) * 100 : 0;
        const resRateChange = currResRate - prevResRate;

        const currConfidencePct = (currentAgg._avg.confidence || 0) * 100;
        const prevConfidencePct = (prevAgg._avg.confidence || 0) * 100;
        const confidenceChange = currConfidencePct - prevConfidencePct;

        const currRetention = 84.2;
        const retentionChange = 2.1;

        const formattedResponseTime = currAvgLatencySec >= 60
            ? `${(currAvgLatencySec / 60).toFixed(1)}m`
            : `${currAvgLatencySec.toFixed(1)}s`;

        const response = {
            avgResponseTime: {
                value: formattedResponseTime,
                changePercentage: Number(responseTimeChange.toFixed(1)),
                isImprovement: responseTimeChange < 0, // Latensi berkurang = Perbaikan (Hijau)
            },
            aiResolutionRate: {
                value: `${currResRate.toFixed(1)}%`,
                changePercentage: Number(resRateChange.toFixed(1)),
                isImprovement: resRateChange > 0,
            },
            avgConfidence: {
                value: `${currConfidencePct.toFixed(1)}%`,
                changePercentage: Number(confidenceChange.toFixed(1)),
                isImprovement: confidenceChange > 0,
            },
            retentionRate: {
                value: `${currRetention.toFixed(1)}%`,
                changePercentage: Number(retentionChange.toFixed(1)),
                isImprovement: retentionChange > 0,
            },
        };
        this.cacheManager.set(`value-card-dashboard-${range}`, response);
        return response;
    }

    async getDashboardCharts(workspaceId: string, range?: string) {
        const chartAiLogs = await this.cacheManager.get(`chart-ailog-${range}`);
        if (chartAiLogs) {
            return chartAiLogs;
        }
        let daysCount = 7;
        let isHours = false;

        switch (range) {
            case "24h":
            case "1d":
                daysCount = 1;
                isHours = true;
                break;
            case "30d":
                daysCount = 30;
                break;
            case "90d":
                daysCount = 90;
                break;
            case "7d":
            default:
                daysCount = 7;
                break;
        }

        const startDate = new Date();
        if (isHours) {
            startDate.setHours(startDate.getHours() - 23, 0, 0, 0);
        } else {
            startDate.setDate(startDate.getDate() - (daysCount - 1));
            startDate.setHours(0, 0, 0, 0);
        }

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const [logs, messages] = await Promise.all([
            this.prisma.aiLog.findMany({
                where: {
                    workspaceId,
                    createdAt: { gte: startDate },
                },
                select: {
                    latencyMs: true,
                    createdAt: true,
                },
            }),
            this.prisma.message.findMany({
                where: {
                    workspaceId,
                    createdAt: { gte: sixMonthsAgo },
                },
                select: {
                    senderId: true,
                    createdAt: true,
                },
            }),
        ]);

        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        const timeMap = new Map<string, { totalMs: number; count: number }>();

        if (isHours) {
            for (let i = 0; i < 24; i++) {
                const d = new Date(startDate);
                d.setHours(d.getHours() + i);
                const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${d.getHours()}`;
                const label = `${String(d.getHours()).padStart(2, '0')}:00`;
                timeMap.set(key, { totalMs: 0, count: 0 });
                (timeMap as any).set(`label_${key}`, label);
            }
        } else {
            for (let i = 0; i < daysCount; i++) {
                const d = new Date(startDate);
                d.setDate(d.getDate() + i);
                const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
                const label = daysCount > 14
                    ? `${d.getDate()} ${monthNames[d.getMonth()]}`
                    : dayNames[d.getDay()];
                timeMap.set(key, { totalMs: 0, count: 0 });
                (timeMap as any).set(`label_${key}`, label);
            }
        }

        logs.forEach((log) => {
            const d = new Date(log.createdAt);
            const key = isHours
                ? `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${d.getHours()}`
                : `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

            if (timeMap.has(key)) {
                const current = timeMap.get(key)!;
                current.totalMs += log.latencyMs || 0;
                current.count += 1;
            }
        });

        const responseTimeData: { day: string; avgLatencySec: number; target: number }[] = [];
        timeMap.forEach((data, key) => {
            if (!key.startsWith('label_')) {
                const label = (timeMap as any).get(`label_${key}`);
                responseTimeData.push({
                    day: label,
                    avgLatencySec: data.count > 0 ? Number((data.totalMs / data.count / 1000).toFixed(2)) : 0,
                    target: 3.0,
                });
            }
        });

        const monthsMap = new Map<string, { totalMessages: number; senders: Set<string>; label: string }>();

        for (let i = 0; i < 6; i++) {
            const d = new Date(sixMonthsAgo);
            d.setMonth(d.getMonth() + i);
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            const label = monthNames[d.getMonth()];
            monthsMap.set(key, { totalMessages: 0, senders: new Set(), label });
        }

        messages.forEach((msg) => {
            const d = new Date(msg.createdAt);
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            if (monthsMap.has(key)) {
                const current = monthsMap.get(key)!;
                current.totalMessages += 1;
                if (msg.senderId) {
                    current.senders.add(msg.senderId);
                }
            }
        });

        const growthData = Array.from(monthsMap.values()).map((data) => ({
            month: data.label,
            totalMessages: data.totalMessages,
            activeContacts: data.senders.size,
        }));

        const response = {
            responseTimeData,
            growthData,
        };
        await this.cacheManager.set(`chart-ailog-${range}`, response, 1000 * 60 * 5);
        return response;
    }

    async getModelPerformance(workspaceId: string, range?: string) {
        const modelPerformance = await this.cacheManager.get(`model-performance-${range}`);
        if (modelPerformance) {
            return modelPerformance;
        }
        let startDate: Date | undefined;

        if (range) {
            startDate = new Date();
            switch (range) {
                case "24h":
                case "1d":
                    startDate.setDate(startDate.getDate() - 1);
                    break;
                case "7d":
                    startDate.setDate(startDate.getDate() - 7);
                    break;
                case "90d":
                    startDate.setDate(startDate.getDate() - 90);
                    break;
                case "30d":
                default:
                    startDate.setDate(startDate.getDate() - 30);
                    break;
            }
        }

        const whereCondition = {
            workspaceId,
            ...(startDate ? { createdAt: { gte: startDate } } : {}),
        };

        const groupedLogs = await this.prisma.aiLog.groupBy({
            by: ['modelName'],
            where: whereCondition,
            _count: { id: true },
            _avg: {
                latencyMs: true,
                confidence: true
            },
        });

        if (groupedLogs.length === 0) {
            return [];
        }

        const response = await Promise.all(
            groupedLogs.map(async (log) => {
                const total = log._count.id;

                // Hitung fallback count untuk model ini
                const fallbackCount = await this.prisma.aiLog.count({
                    where: {
                        workspaceId,
                        modelName: log.modelName,
                        isFallback: true
                    },
                });

                const successRate = total > 0 ? Math.round(((total - fallbackCount) / total) * 100) : 0;
                const avgLatencySec = (log._avg.latencyMs || 0) / 1000;
                const avgConfidencePct = Math.round((log._avg.confidence || 0) * 100);

                return {
                    agent: log.modelName || 'Default Model',
                    resolved: total,
                    confidence: `${avgConfidencePct}%`,
                    avgTime: `${avgLatencySec.toFixed(1)}s`,
                    performance: successRate,
                };
            })
        );
        await this.cacheManager.set(`model-performance-${range}`, response, 1000 * 60 * 5);
        return response;
    }

    async getPeakAndDistribution(workspaceId: string, range?: string) {
        let startDate: Date | undefined;

        if (range) {
            startDate = new Date();
            switch (range) {
                case "24h":
                case "1d":
                    startDate.setDate(startDate.getDate() - 1);
                    break;
                case "7d":
                    startDate.setDate(startDate.getDate() - 7);
                    break;
                case "90d":
                    startDate.setDate(startDate.getDate() - 90);
                    break;
                case "30d":
                default:
                    startDate.setDate(startDate.getDate() - 30);
                    break;
            }
        }

        const messages = await this.prisma.message.findMany({
            where: {
                workspaceId,
                ...(startDate ? { createdAt: { gte: startDate } } : {}),
            },
            select: { createdAt: true, platform: true }
        });

        const hoursMap = new Array(12).fill(0).map((_, i) => ({
            hour: `${String(i * 2).padStart(2, '0')}:00`,
            count: 0
        }));

        let waCount = 0;
        let apiCount = 0;

        messages.forEach(msg => {
            const hour = new Date(msg.createdAt).getHours();
            const index = Math.floor(hour / 2);
            if (hoursMap[index]) hoursMap[index].count++;

            if (msg.platform === "WHATSAPP_BAYLIES") waCount++;
            if (msg.platform === 'API') apiCount++;
        });

        const total = messages.length || 1;

        const channelDistributionData = [
            { name: 'WhatsApp', value: Math.round((waCount / total) * 100) },
            { name: 'API / Webhook', value: Math.round((apiCount / total) * 100) }
        ];

        return {
            peakHoursData: hoursMap,
            channelDistributionData
        };
    }
}