import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApiModule } from './api/api.module';
import { EventModule } from './event/event.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { PrismaModule } from '../../lib/prisma/prisma.module';
import { Keyv } from 'keyv';
import KeyvRedis from '@keyv/redis';
import { createClient } from 'redis';
import { BullModule } from '@nestjs/bullmq';
import { NodemailerModule } from '@library/nodemailer/nodemailer.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { EmbeddingModule } from '@library/shared/embedding.module';
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { APP_GUARD } from '@nestjs/core';
import { StorageModule } from '@library/storage/storage.module';
import { AgentModule } from '@library/agent/agent.module';


@Module({
  imports: [
    PrismaModule,
    EventModule,
    AgentModule,
    ApiModule,
    EventModule,
    NodemailerModule,
    EmbeddingModule,
    StorageModule,
    ServeStaticModule.forRoot({
      rootPath: '/var/berry/images',
      serveRoot: '/images',          // Prefix URL publik
    }),
    ServeStaticModule.forRoot({
      rootPath: '/var/berry/files',
      serveRoot: '/files',          // Prefix URL publik
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env"
    }),
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
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // Waktu (dalam milidetik). 60000ms = 1 menit
        limit: 10,  // Maksimal 10 request per window (ttl)
      },
    ]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ],
})
export class AppModule { }
