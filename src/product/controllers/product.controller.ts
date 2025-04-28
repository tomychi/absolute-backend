import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ProductService } from '../services/product.service';
import { ProductCreateDTO, ProductUpdateDTO } from '../dto/product.dto';
import { ProductEntity } from '../entities/product.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Product')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('create/:companyId')
  async createProduct(
    @Body() productCreateDTO: ProductCreateDTO,
    @Param('companyId') companyId: string,
  ): Promise<ProductEntity> {
    return this.productService.createProduct(productCreateDTO, companyId);
  }

  @Get('/:companyId')
  async getProductsByCompany(
    @Param('companyId') companyId: string,
  ): Promise<ProductEntity[]> {
    return this.productService.getProductsByCompany(companyId);
  }

  @Delete(':id')
  async deleteProduct(@Param('id') productId: string): Promise<void> {
    return this.productService.softDeleteProduct(productId);
  }

  @Put(':id')
  async updateProduct(
    @Param('id') productId: string,
    @Body() productUpdateDTO: ProductUpdateDTO,
  ): Promise<ProductEntity> {
    return this.productService.updateProduct(productId, productUpdateDTO);
  }
}
