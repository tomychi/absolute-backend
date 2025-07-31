export class CustomerResponseDto {
  id: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  displayName: string;
  taxId?: string;
  email?: string;
  phone?: string;
  companyId: string;
  isComplete: boolean;
  hasContactInfo: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Optional relations
  company?: {
    id: string;
    name: string;
  };

  invoiceCount?: number;
  totalInvoiced?: number;
  lastInvoiceDate?: Date;
}

// paginated-customers-response.dto.ts
export class PaginatedCustomersResponseDto {
  customers: CustomerResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
