import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../../lib/prisma/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CloudinaryModule } from '../../lib/cloudinary/cloudinary.module';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import { Keyv } from 'keyv';
import { createClient } from "redis";
import { BullModule } from '@nestjs/bullmq';
import { CorsBypassMiddleware } from './middleware/cors.middleware';
import { ChatbotModule } from './chatbot/chatbot.module';
import { MessageModule } from './message/message.module';
import { BillingModule } from '@library/billing/billing.module';
import { NodemailerModule } from '@library/nodemailer/nodemailer.module';
import { QueueChatbotModule } from './queue-chatbot/queue-chatbot.module';

@Module({
  imports: [
    PrismaModule,
    ChatbotModule,
    MessageModule,
    BillingModule,
    NodemailerModule,
    QueueChatbotModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env"
    }),
    CloudinaryModule,
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisClient = createClient({
          url: configService.get<string>("REDIS_URL"),
        });

        redisClient.on('connect', () => {
          console.log('✅ [Redis] Berhasil terhubung ke Redis DB 6!');
        });

        redisClient.on('error', (err) => {
          console.error('❌ [Redis Error]', err.message);
        });

        await redisClient.connect();
        const keyvRedis = new KeyvRedis(redisClient as any);

        return {
          stores: [
            new Keyv({
              store: keyvRedis,
              ttl: 5 * 60 * 1000,
            }),
          ],
        }
      },
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          url: configService.get<string>("REDIS_URL")
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorsBypassMiddleware).forRoutes("*");
  }
}
