import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users/services/users.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { UsersEntity } from '../../users/entities/users.entity';
import { PayloadToken } from '../interfaces/auth.interface';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  public async validateUser(email: string, password: string) {
    const userByEmail = await this.usersService.findUserBy({
      key: 'email',
      value: email,
    });
    if (userByEmail) {
      const match = await bcrypt.compare(password, userByEmail.password);
      if (match) return userByEmail;
    }
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

  public async validateUserGoogle(
    email: string,
    given_name: string,
    family_name: string,
    picture: string,
  ) {
    const userByEmail = await this.usersService.findUserBy({
      key: 'email',
      value: email,
    });

    if (userByEmail) {
      return userByEmail;
    } else {
      const randomPassword = Math.random().toString(36).slice(-8);
      const newUser = await this.usersService.createUser({
        password: randomPassword,
        email: email,
        firstName: given_name,
        lastName: family_name,
        image: picture,
      });
      return newUser;
    }
  }

  public async generateJWT(user: UsersEntity): Promise<any> {
    const getUser = await this.usersService.findUserById(user.id);

    const payload: PayloadToken = {
      role: getUser.role,
      sub: getUser.id,
    };

    return {
      accessToken: this.signJWT({
        payload,
        secret: process.env.JWT_SECRET,
        expires: '24h',
      }),
      user,
    };
  }
}
