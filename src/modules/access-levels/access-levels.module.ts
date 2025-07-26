import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessLevelsService } from './services/access-levels.service';
import { AccessLevel } from './entities/access-level.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AccessLevel])],
  providers: [AccessLevelsService] as const,
  exports: [AccessLevelsService, TypeOrmModule] as const,
})
export class AccessLevelsModule {}
