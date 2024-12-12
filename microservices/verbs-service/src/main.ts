// src/main.ts
import { NestFactory } from '@nestjs/core';
import { VerbesModule } from './verbs.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(VerbesModule);
  const configService = appContext.get(ConfigService);
  const NATS_HOST = configService.get('NATS_HOST') ?? 'localhost';
  const NATS_PORT = configService.get('NATS_PORT') ?? '4222';
  const NATS_URL = `${NATS_HOST}:${NATS_PORT}`;

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    VerbesModule,
    {
      transport: Transport.NATS,
      options: {
        name: 'VERBS_SERVICE',
        servers: [`nats://${NATS_URL}`],
      },
    },
  );

  await app.listen();
}
bootstrap();
