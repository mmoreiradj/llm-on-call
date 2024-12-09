import { Injectable } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { adverbes, verbs } from './utils/words-list';

@Injectable()
export class VerbsController {
  @MessagePattern('get.verbe')
  getRandomVerb() {
    const verbe = verbs[Math.floor(Math.random() * verbs.length)];
    const adverbe = adverbes[Math.floor(Math.random() * adverbes.length)];
    const comparativeConjonction = 'que';
    const response = `${verbe} ${adverbe} ${comparativeConjonction} `;
    return response;
  }
}
