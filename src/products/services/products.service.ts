import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorManager } from 'src/utils/error.manager';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { ProductsEntity } from '../entities/products.entity';
import { ProductDTO, ProductUpdateDTO } from '../dto/product.dto';

import { CloudinaryService } from '../../cloudinary/services/cloudinary.service';
@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductsEntity)
    private readonly productRepository: Repository<ProductsEntity>,

    private cloudinary: CloudinaryService,
  ) {}

  public async createProduct(body: ProductDTO): Promise<ProductsEntity> {
    try {
      return await this.productRepository.save(body);
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findProducts(): Promise<ProductsEntity[]> {
    try {
      const products: ProductsEntity[] = await this.productRepository.find();

      if (products.length === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se encontraron productos',
        });
      }

      return products;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findProductById(id: string): Promise<ProductsEntity> {
    try {
      const product: ProductsEntity = await this.productRepository
        .createQueryBuilder('product')
        .where({ id })
        .leftJoinAndSelect('product.locationsIncludes', 'locationsIncludes')
        .leftJoinAndSelect('locationsIncludes.location', 'location')
        .getOne();

      if (!product) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se econtro product con el id: ' + id,
        });
      }

      return product;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateProduct(
    body: ProductUpdateDTO,
    id: string,
  ): Promise<UpdateResult> {
    try {
      const product: UpdateResult = await this.productRepository.update(
        id,
        body,
      );
      if (product.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo actualizar el producto id: ' + id,
        });
      }

      return product;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async deleteProduct(id: string): Promise<DeleteResult> {
    try {
      const product: DeleteResult = await this.productRepository.delete(id);
      if (product.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo borrar el producto id: ' + id,
        });
      }

      return product;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async uploadImageToCloudinary(file: Express.Multer.File) {
    return await this.cloudinary.uploadImage(file).catch(() => {
      throw new BadRequestException('Invalid file type');
    });
  }
}
