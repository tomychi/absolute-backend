import { InvoiceStatus } from '../entities/invoice.entity';

export class InvoiceItemResponseDto {
  id: string;
  productId: string;
  productName: string;
  productSku?: string;
  productDescription?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discountAmount: number;
  effectivePrice: number;
  discountPercentage: number;

  product?: {
    id: string;
    name: string;
    sku?: string;
    price: number;
  };
}

export class InvoiceResponseDto {
  id: string;
  invoiceNumber: string;
  branchId: string;
  customerId: string;
  userId: string;
  status: InvoiceStatus;
  subtotalAmount: number;
  taxAmount: number;
  taxRate: number;
  discountAmount: number;
  discountRate: number;
  totalAmount: number;
  dueDate?: Date;
  paidDate?: Date;
  notes?: string;
  issuedAt: Date;
  createdAt: Date;
  updatedAt: Date;

  // Virtual properties
  isOverdue: boolean;
  isPaid: boolean;
  daysPastDue: number;

  // Relations
  branch?: {
    id: string;
    name: string;
    code: string;
  };

  customer?: {
    id: string;
    displayName: string;
    email?: string;
    taxId?: string;
  };

  user?: {
    id: string;
    firstName: string;
    lastName: string;
  };

  items: InvoiceItemResponseDto[];
}

// paginated-invoices-response.dto.ts
export class PaginatedInvoicesResponseDto {
  invoices: InvoiceResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export class InvoiceSummaryDto {
  totalInvoices: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  draftCount: number;
  pendingCount: number;
  paidCount: number;
  overdueCount: number;
  cancelledCount: number;
  averageInvoiceAmount: number;
  averagePaymentTime: number; // in days
}
