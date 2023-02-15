import { ROLES } from '../../interfaces/roles';
export interface PayloadToken {
  sub: string;
  role: ROLES;
}

export interface AuthBody {
  email: string;
  password: string;
}
