import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  const configService = app.get(ConfigService);
  const NATS_HOST = configService.get('NATS_HOST') ?? 'localhost';
  const NATS_PORT = configService.get('NATS_PORT') ?? '4222';
  const NATS_URL = `${NATS_HOST}:${NATS_PORT}`;
  app.connectMicroservice({
    transport: Transport.NATS,
    options: {
      servers: [`nats://${NATS_URL}`],
    },
  });
  await app.startAllMicroservices();
  await app.listen(configService.get('SERVER_PORT'), '0.0.0.0');
}
bootstrap();
