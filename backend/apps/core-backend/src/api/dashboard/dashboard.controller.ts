import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { DashboardService } from "./dashboard.service";


@Controller("api/:workspaceId/dashboard")
export class DashboardController {
    constructor(private service: DashboardService) { }

    @Get("analytics")
    @UseGuards(AuthGuard("jwt"))
    async getAnalytics(@Param("workspaceId") workspaceId: string, @Query() query: { range?: string }) {
        return await this.service.getAnalytics(workspaceId, query.range);
    }

    @Get("analytics/charts")
    @UseGuards(AuthGuard("jwt"))
    async getAnatyticsAI(@Param("workspaceId") workspaceId: string, @Query() query: { range?: string }) {
        return await this.service.getDashboardCharts(workspaceId, query.range);
    }

    @Get("analytics/model/performance")
    @UseGuards(AuthGuard("jwt"))
    async getModelPerformance(@Param("workspaceId") workspaceId: string, @Query() query: { range?: string }) {
        return await this.service.getModelPerformance(workspaceId, query.range);
    }

    @Get("analytics/peak-and-distribution")
    @UseGuards(AuthGuard("jwt"))
    async getPeakAndDistribution(@Param("workspaceId") workspaceId: string, @Query() query: { range?: string }) {
        return await this.service.getPeakAndDistribution(workspaceId, query.range);
    }
}