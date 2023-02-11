import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { LocationsService } from '../services/locations.service';
import {
  LocationDTO,
  LocationUpdateDTO,
  LocationToProductDTO,
} from '../dto/location.dto';

@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post('create')
  public async createLocation(@Body() body: LocationDTO) {
    return await this.locationsService.createLocation(body);
  }

  @Get('all')
  public async finAllLocations() {
    return await this.locationsService.findLocations();
  }

  @Get(':id')
  public async findLocationById(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.locationsService.findLocationById(id);
  }

  @Put('edit/:id')
  public async updateLocation(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: LocationUpdateDTO,
  ) {
    return await this.locationsService.updateLocation(body, id);
  }

  @Delete('delete/:id')
  public async deleteLocation(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.locationsService.deleteLocation(id);
  }

  // Relation with Product
  @Post('add-to-product')
  public async addToProduct(@Body() body: LocationToProductDTO) {
    return await this.locationsService.relationToProduct(body);
  }
}
