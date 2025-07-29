import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(
  OmitType(CreateProductDto, ['sku'] as const),
) {
  // All fields from CreateProductDto except 'sku' are optional for updates
  // SKU should not be changed after creation to maintain consistency
}
