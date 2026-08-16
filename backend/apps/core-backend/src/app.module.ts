import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApiModule } from './api/api.module';
import { EventModule } from './event/event.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CloudinaryModule } from '../../lib/cloudinary/cloudinary.module';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { PrismaModule } from '../../lib/prisma/prisma.module';
import { Keyv } from 'keyv';
import { KeyvCacheableMemory } from 'cacheable';
import KeyvRedis from '@keyv/redis';
import { createClient } from 'redis';
import { BullModule } from '@nestjs/bullmq';
import { NodemailerModule } from '@library/nodemailer/nodemailer.module';
import { ServeStaticModule } from '@nestjs/serve-static';


@Module({
  imports: [
    PrismaModule,
    ApiModule,
    EventModule,
    NodemailerModule,
    ServeStaticModule.forRoot({
      rootPath: '/var/berry/images',
      serveRoot: '/images',          // Prefix URL publik
    }),
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
export class AppModule {}
