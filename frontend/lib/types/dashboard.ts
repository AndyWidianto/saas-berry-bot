
export interface DashboardAnalytics {
    avgResponseTime: {
        value: string;
        changePercentage: number;
        isImprovement: boolean;
    };
    aiResolutionRate: {
        value: string;
        changePercentage: number;
        isImprovement: boolean;
    };
    avgConfidence: {
        value: string;
        changePercentage: number;
        isImprovement: boolean;
    };
    retentionRate: {
        value: string;
        changePercentage: number;
        isImprovement: boolean;
    };
}

export interface DashboardAnalyticsChart {
    responseTimeData: {
        day: string;
        avgLatencySec: number;
        target: number;
    }[];
    growthData: {
        month: string;
        totalMessages: number;
        activeContacts: number;
    }[];
}
export interface DashboarModelPerformance {
    agent: string;
    resolved: number;
    confidence: string;
    avgTime: string;
    performance: number;
}

export interface DashboardPeakAndDistribution {
    peakHoursData: {
        hour: string;
        count: number;
    }[];
    channelDistributionData: {
        name: string;
        value: number;
    }[];
}