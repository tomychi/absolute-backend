import { BaseEntity } from '../../config/base.entity';
import { ILocation } from 'src/interfaces/location.interface';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'locations' })
export class LocationsEntity extends BaseEntity implements ILocation {
  @Column()
  province: string;

  @Column()
  city: string;

  @Column({ unique: true })
  address: string;

  @Column()
  phone: string;
}
