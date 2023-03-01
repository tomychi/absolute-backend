import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { AuthDTO } from '../dto/auth.dto';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
);

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() { email, password }: AuthDTO) {
    const userValidate = await this.authService.validateUser(email, password);

    if (!userValidate) {
      throw new UnauthorizedException('Data not valid');
    }

    const jwt = await this.authService.generateJWT(userValidate);

    return jwt;
  }

  @Post('google')
  async google(@Body('token') token): Promise<AuthDTO> {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, given_name, family_name, picture } = ticket.getPayload();

    const user = await this.authService.validateUserGoogle(
      email,
      given_name,
      family_name,
      picture,
    );

    if (!user) {
      throw new UnauthorizedException('Data not valid');
    }

    const jwt = await this.authService.generateJWT(user);

    return jwt;
  }
}

/* 
{                                                                                                                                               
  iss: 'https://accounts.google.com',                                                                                                           
  nbf: 1677678119,                                                                                                                              
  aud: '133986511655-eljfgaaimgl9adjjv5g6eikbfekobfok.apps.googleusercontent.com',                                                              
  sub: '115548498640147067269',                                                                                                                 
  email: 'tomychi352@gmail.com',                                                                                                                
  email_verified: true,                                                                                                                         
  azp: '133986511655-eljfgaaimgl9adjjv5g6eikbfekobfok.apps.googleusercontent.com',                                                              
  name: 'Tomas Arcostanzo',                                                                                                                     
  picture: 'https://lh3.googleusercontent.com/a/AGNmyxaoCe1Ck8Gmhfkkmyr0WFuYRwEYlqHb-GSHwBoe=s96-c',                                            
  given_name: 'Tomas',                                                                                                                          
  family_name: 'Arcostanzo',                                                                                                                    
  iat: 1677678419,                                                                                                                              
  exp: 1677682019,                                                                                                                              
  jti: '88763555aef403e375f525494ffdc5bc10f9e451'                                                                                               
}         


*/
