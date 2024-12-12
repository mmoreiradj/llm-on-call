import { Injectable } from '@nestjs/common';
import { Ctx, MessagePattern, NatsContext } from '@nestjs/microservices';

@Injectable()
export class NamesController {
  private readonly names = [
    'Thomas',
    'Sylvain',
    'Charley',
    'Martin',
    'Léo',
    'Alexandre',
  ];

  @MessagePattern('get.name')
  getRandomName() {
    const name = this.names[Math.floor(Math.random() * this.names.length)];
    return name;
  }
}
