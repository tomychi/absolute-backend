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
import { LocationDTO, LocationUpdateDTO } from '../dto/location.dto';

@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post('create')
  public async registerUser(@Body() body: LocationDTO) {
    return await this.locationsService.createLocation(body);
  }

  @Get('all')
  public async findAllUsers() {
    return await this.locationsService.findLocations();
  }

  @Get(':id')
  public async findUser(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.locationsService.findLocationById(id);
  }

  @Put('edit/:id')
  public async updateUser(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: LocationUpdateDTO,
  ) {
    return await this.locationsService.updateLocation(body, id);
  }

  @Delete('delete/:id')
  public async deleteUser(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.locationsService.deleteLocation(id);
  }
}
