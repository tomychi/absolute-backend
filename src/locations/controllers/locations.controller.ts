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
import { ProductsService } from '../../products/services/products.service';
import {
  LocationDTO,
  LocationUpdateDTO,
  LocationToProductDTO,
} from '../dto/location.dto';

@Controller('locations')
export class LocationsController {
  constructor(
    private readonly locationsService: LocationsService,
    private readonly productsService: ProductsService,
  ) {}

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

  // Crear producto en un locations
  @Post('create-products/:id')
  public async createCompany(
    @Body() body: any,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    const { stock, ...rest } = body;
    const product = await this.productsService.createProduct(rest);
    const location = await this.locationsService.findLocationById(id);

    const relationData: LocationToProductDTO = {
      location,
      product,
      stock,
    };
    await this.locationsService.relationToProduct(relationData);

    return product;
  }
}
