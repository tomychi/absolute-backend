import { Injectable } from '@nestjs/common';
import { UserService } from '../../user/services/user.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { UserEntity } from '../../user/entities/user.entity';
import { PayloadToken } from '../interfaces/auth.interface';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  public async validateUser(email: string, password: string) {
    const userByEmail = await this.userService.findBy({
      key: 'email',
      value: email,
    });

    if (userByEmail) {
      const match = await bcrypt.compare(password, userByEmail.password);

      if (match) return userByEmail;
    }

    return null;
  }

  public signJWT({
    payload,
    secret,
    expires,
  }: {
    payload: jwt.JwtPayload;
    secret: string;
    expires: number | string;
  }) {
    return jwt.sign(payload, secret, { expiresIn: expires });
  }

  public async generateJWT(user: UserEntity): Promise<any> {
    const getUser = await this.userService.findUserById(user.id);

    const payload: PayloadToken = {
      role: getUser.role,
      sub: getUser.id,
    };

    return {
      accessToken: this.signJWT({
        payload,
        secret: process.env.JWT_SECRET,
        expires: '1h',
      }),
      user,
    };
  }
}
