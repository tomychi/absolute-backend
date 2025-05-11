import { Column, Entity, OneToMany } from 'typeorm';
import { ICompany } from '../../interfaces/company.interface';
import { UserCompanyEntity } from '../../user/entities/userCompany.entity';
import { BaseEntity } from '../../config/base.entity';
import { BranchEntity } from '../../branch/entities/branch.entity';
import { ProductEntity } from '../../product/entities/product.entity';
import { CustomerEntity } from 'src/customer/entities/customer.entity';

@Entity({ name: 'company' })
export class CompanyEntity extends BaseEntity implements ICompany {
  @Column()
  name: string;

  @Column()
  address: string;

  @OneToMany(() => UserCompanyEntity, (userCompany) => userCompany.company)
  usersIncludes: UserCompanyEntity[];

  @OneToMany(() => BranchEntity, (branch) => branch.company)
  branches: BranchEntity[];

  @OneToMany(() => ProductEntity, (product) => product.company)
  products: ProductEntity[];

  @OneToMany(() => CustomerEntity, (customer) => customer.company)
  customers: CustomerEntity[];
}
