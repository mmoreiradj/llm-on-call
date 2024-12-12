import { NestFactory } from '@nestjs/core';
import { NamesModule } from './names.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(NamesModule);
  const configService = appContext.get(ConfigService);
  const NATS_HOST = configService.get('NATS_HOST') ?? 'localhost';
  const NATS_PORT = configService.get('NATS_PORT') ?? '4222';
  const NATS_URL = `${NATS_HOST}:${NATS_PORT}`;

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    NamesModule,
    {
      transport: Transport.NATS,
      options: {
        name: 'NAMES_SERVICE',
        servers: [`nats://${NATS_URL}`],
      },
    },
  );

  await app.listen();
}
bootstrap();
