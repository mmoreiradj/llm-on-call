import { Module } from '@nestjs/common';
import { GatewayController } from './app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ClientsModule.registerAsync([
      {
        imports: [ConfigModule],
        name: 'VERBS_SERVICE',
        useFactory: (configService) => ({
          transport: Transport.NATS,
          options: {
            servers: [
              `nats://${configService.get('NATS_HOST')}:${configService.get('NATS_PORT')}`,
            ],
          },
        }),
        inject: [ConfigService],
      },
      {
        imports: [ConfigModule],
        name: 'NAMES_SERVICE',
        useFactory: (configService) => ({
          transport: Transport.NATS,
          options: {
            servers: [
              `nats://${configService.get('NATS_HOST')}:${configService.get('NATS_PORT')}`,
            ],
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [GatewayController],
  providers: [],
})
export class AppModule {}
