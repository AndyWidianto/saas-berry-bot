import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { KnowledgeModule } from "./knowledge/knowledge.module";
import { UsersModule } from "./users/users.module";
import { MessageModule } from "./message/message.module";
import { WorkspaceModule } from "./workspace/worskpace.module";
import { IntegrationModule } from "./integration/integration.module";
import { BalanceModule } from "./balance/balance.module";
import { ModelModule } from "./model/model.module";
import { ArticleModule } from "./article/article.module";
import { InvoiceModule } from "./invoice/invoice.module";
import { BillingModule } from "@library/billing/billing.module";
import { ApiKeyModule } from "./apikeys/apikey.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { ContactModule } from "./contact/contact.module";



@Module({
    imports: [
        AuthModule,
        KnowledgeModule,
        UsersModule,
        MessageModule,
        WorkspaceModule,
        IntegrationModule,
        BalanceModule,
        ModelModule,
        ArticleModule,
        InvoiceModule,
        BillingModule,
        ApiKeyModule,
        DashboardModule,
        ContactModule
    ]
})
export class ApiModule {}