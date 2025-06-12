// src/modules/customer/dto/customer.dto.ts
export class CustomerCreateDTO {
  name: string;
  email: string;
  phone: string;
  address: string;
  companyId: string;
}

export class CustomerUpdateDTO {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}
