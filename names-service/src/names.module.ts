import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NamesController } from './names.controller';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [NamesController],
  providers: [],
})
export class NamesModule {}
