import { Module } from '@nestjs/common';
import { VerbsController } from './verbs.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [VerbsController],
  providers: [],
})
export class VerbesModule {}
