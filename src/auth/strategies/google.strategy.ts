import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth2';
import { ConfigService } from '@nestjs/config';
import { Profile } from 'passport';
import { UsersService } from '../../users/services/users.service';
import { ROLES } from 'src/interfaces/roles';
import { AuthService } from '../services/auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('CLIENT_ID'),
      clientSecret: configService.get<string>('CLIENT_SECRET'),
      callbackURL: '/api/auth/google/redirect',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user: any, info?: any) => void,
  ) {
    try {
      // Buscar al usuario en la base de datos por su ID de Google
      const userId = await this.usersService.findUserById(profile.id);

      if (userId) {
        // Si el usuario ya existe, devolverlo
        const { accessToken, user } = await this.authService.generateJWT(
          userId,
        );
        done(null, { accessToken, user });
      } else {
        // Si el usuario no existe, crear un nuevo registro con la información de Google
        const { name, emails, photos } = profile;

        const newUser = await this.usersService.createUser({
          firstName: name.givenName,
          lastName: name.familyName,
          email: emails[0].value,
          image: photos[0].value,
          password: 'xd',
          address: 'direccion',
          role: ROLES.BASIC,
        });
        const { accessToken, user } = await this.authService.generateJWT(
          newUser,
        );

        done(null, { accessToken, user });
      }
    } catch (err) {
      done(err, false, 'Error al conectarse con google');
    }
  }
}
