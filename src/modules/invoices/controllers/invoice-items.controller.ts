import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { InvoiceItemsService } from '../services/invoice-items.service';
import { CreateInvoiceItemDto } from '../dto/create-invoice-item.dto';
import { InvoiceItemResponseDto } from '../dto/invoice-response.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ApiResponseHelper } from '../../../common/helpers/api-response.helper';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

@ApiTags('Invoice Items')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class InvoiceItemsController {
  constructor(private readonly invoiceItemsService: InvoiceItemsService) {}

  @Get('invoices/:invoiceId/items')
  @ApiOperation({
    summary: 'Get invoice items',
    description: 'Get all items for a specific invoice.',
  })
  @ApiParam({ name: 'invoiceId', description: 'Invoice ID' })
  @ApiResponse({
    status: 200,
    description: 'Invoice items retrieved successfully',
    type: [InvoiceItemResponseDto],
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - no access to invoice company',
  })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async findByInvoice(
    @Param('invoiceId', ParseUUIDPipe) invoiceId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<InvoiceItemResponseDto[]>> {
    const items = await this.invoiceItemsService.findByInvoice(
      invoiceId,
      req.user.id,
    );

    return ApiResponseHelper.success(
      items,
      'Invoice items retrieved successfully',
    );
  }

  @Post('invoices/:invoiceId/items')
  @ApiOperation({
    summary: 'Add item to invoice',
    description:
      'Add a new item to an invoice. Only draft invoices can be modified. User must have owner, admin or manager role.',
  })
  @ApiParam({ name: 'invoiceId', description: 'Invoice ID' })
  @ApiResponse({
    status: 201,
    description: 'Invoice item added successfully',
    type: InvoiceItemResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error or invoice cannot be modified',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Invoice or product not found' })
  async addItem(
    @Param('invoiceId', ParseUUIDPipe) invoiceId: string,
    @Body() createItemDto: CreateInvoiceItemDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<InvoiceItemResponseDto>> {
    const item = await this.invoiceItemsService.addItem(
      invoiceId,
      createItemDto,
      req.user.id,
    );

    return ApiResponseHelper.success(
      item,
      'Invoice item added successfully',
      HttpStatus.CREATED,
    );
  }

  @Patch('invoice-items/:itemId')
  @ApiOperation({
    summary: 'Update invoice item',
    description:
      'Update an invoice item. Only items from draft invoices can be modified. User must have owner, admin or manager role.',
  })
  @ApiParam({ name: 'itemId', description: 'Invoice item ID' })
  @ApiResponse({
    status: 200,
    description: 'Invoice item updated successfully',
    type: InvoiceItemResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error or invoice cannot be modified',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Invoice item not found' })
  async updateItem(
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() updateData: Partial<CreateInvoiceItemDto>,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<InvoiceItemResponseDto>> {
    const item = await this.invoiceItemsService.updateItem(
      itemId,
      updateData,
      req.user.id,
    );

    return ApiResponseHelper.success(item, 'Invoice item updated successfully');
  }

  @Delete('invoice-items/:itemId')
  @ApiOperation({
    summary: 'Remove invoice item',
    description:
      'Remove an item from an invoice. Only items from draft invoices can be removed. User must have owner, admin or manager role.',
  })
  @ApiParam({ name: 'itemId', description: 'Invoice item ID' })
  @ApiResponse({
    status: 204,
    description: 'Invoice item removed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invoice cannot be modified',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Invoice item not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeItem(
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<void> {
    await this.invoiceItemsService.removeItem(itemId, req.user.id);
  }
}
