import { Injectable } from '@nestjs/common';
import { ProductEntity } from '../entities/product.entity';
import { CompanyEntity } from '../../company/entities/company.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductCreateDTO, ProductUpdateDTO } from '../dto/product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>,
    @InjectRepository(CompanyEntity)
    private companyRepository: Repository<CompanyEntity>,
  ) {}

  async createProduct(
    ProductCreateDTO: ProductCreateDTO,
    companyId: string,
  ): Promise<ProductEntity> {
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
    });
    if (!company) {
      throw new Error('Company not found');
    }

    const product = this.productRepository.create({
      ...ProductCreateDTO,
      company,
    });

    return this.productRepository.save(product);
  }

  async getProductsByCompany(companyId: string): Promise<ProductEntity[]> {
    return this.productRepository.find({
      where: { company: { id: companyId }, isDeleted: false },
    });
  }

  async softDeleteProduct(productId: string): Promise<void> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });
    if (!product) {
      throw new Error('Product not found');
    }

    product.isDeleted = true;
    await this.productRepository.save(product);
  }

  async updateProduct(
    productId: string,
    productUpdateDTO: ProductUpdateDTO,
  ): Promise<ProductEntity> {
    const product = await this.productRepository.findOne({
      where: { id: productId, isDeleted: false },
    });
    if (!product) {
      throw new Error('Product not found or has been deleted');
    }

    Object.assign(product, productUpdateDTO);
    return this.productRepository.save(product);
  }
}
