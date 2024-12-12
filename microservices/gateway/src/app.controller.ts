import { Controller, Get, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('gateway')
export class GatewayController {
  constructor(
    @Inject('VERBS_SERVICE') private readonly verbesClient: ClientProxy,
    @Inject('NAMES_SERVICE') private readonly nomsClient: ClientProxy,
  ) {}

  @Get('health')
  async getHealth(): Promise<string> {
    return 'Gateway is up and running';
  }

  // !TODO: Uncomment this method : to test database connection
  // @Get('ready')
  // async getReady(): Promise<string> {
  //   return 'Gateway is ready to serve'
  // }

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
