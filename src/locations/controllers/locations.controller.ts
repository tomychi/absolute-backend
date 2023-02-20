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

  @Put('update-products/:locationId/:productId')
  public async updateProduct(
    @Param('locationId', new ParseUUIDPipe()) locationId: string,
    @Param('productId', new ParseUUIDPipe()) productId: string,
    @Body() body: any,
  ) {
    const location = await this.locationsService.findLocationById(locationId);
    const relation = await this.locationsService.findLocationByProduct(
      locationId,
      productId,
    );
    if (!relation) throw Error('No existe el producto en la ubicación');

    const relationId = relation.productsIncludes[0].id;
    const product = relation.productsIncludes[0].product;

    const { stock, ...rest } = body;

    const updateProduct = await this.productsService.updateProduct(
      rest,
      productId,
    );

    const updateRelation = await this.locationsService.updateRelationToProduct(
      { location, product, stock },
      relationId,
    );

    return {
      updateProduct,
      updateRelation,
    };
  }
}
