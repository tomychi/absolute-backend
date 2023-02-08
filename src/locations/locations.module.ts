import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationsController } from './controllers/locations.controller';
import { LocationsService } from './services/locations.service';
import { LocationsEntity } from './entities/locations.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LocationsEntity])],
  controllers: [LocationsController],
  providers: [LocationsService],
})
export class LocationsModule {}
