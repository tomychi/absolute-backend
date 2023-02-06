import { BaseEntity } from '../../config/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { ICompany } from '../../interfaces/company.interface';

@Entity({ name: 'companies' })
export class CompaniesEntity extends BaseEntity implements ICompany {
  @Column()
  name: string;

  @Column()
  description: string;
}
