import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ProductsService } from '../services/products.service';
import { ProductDTO, ProductUpdateDTO } from '../dto/product.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post('create')
  public async createProduct(@Body() body: ProductDTO) {
    return await this.productsService.createProduct(body);
  }

  @Get('all')
  public async findAllProducts() {
    return await this.productsService.findProducts();
  }

  @Get(':id')
  public async findProduct(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.productsService.findProductById(id);
  }

  @Put('edit/:id')
  public async updateUser(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: ProductUpdateDTO,
  ) {
    return await this.productsService.updateProduct(body, id);
  }

  @Delete('delete/:id')
  public async deleteProduct(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.productsService.deleteProduct(id);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  public async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return await (
      await this.productsService.uploadImageToCloudinary(file)
    ).url;
  }
}
