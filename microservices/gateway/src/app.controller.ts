import { Controller, Get, Inject } from '@nestjs/common';
import { ClientProxy, MessagePattern, Payload, Ctx, NatsContext  } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Logger } from '@nestjs/common';

@Controller('gateway')
export class GatewayController {
  private readonly logger = new Logger(GatewayController.name);

  constructor(
    @Inject('VERBS_SERVICE') private readonly verbesClient: ClientProxy,
    @Inject('NAMES_SERVICE') private readonly nomsClient: ClientProxy,
  ) {}

  @MessagePattern('*')
  async handleLoggingMessage(
    @Payload() data: any,
    @Ctx() context: NatsContext
  ) {
    const topic = context.getSubject();
    this.logger.log(`Received message on topic ${topic}: ${JSON.stringify(data)}`);
    
    return {
      status: 'success',
      timestamp: new Date().toISOString(),
      topic,
      message: data
    };
  }

  @Get('health')
  async getHealth(): Promise<string> {
    return 'Gateway is up and running';
  }

  @Get('phrase')
  async getPhrase(): Promise<string> {
    const verbResponse = this.verbesClient.send<string>('get.verbe', {});
    const verb = await firstValueFrom(verbResponse);
    const nameResponse = this.nomsClient.send<string>('get.name', {});
    const mainChara = await firstValueFrom(nameResponse);
    const comparativeName = this.nomsClient.send<string>('get.name', {});
    const comparativeChara = await firstValueFrom(comparativeName);
    return ` ${mainChara} ${verb}${comparativeChara}`;
  }
}
