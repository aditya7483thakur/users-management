import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { UserService } from 'src/domains/user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    const { jti, sub, themeId } = payload;
    const user = await this.userService.findById(sub);
    if (!user) throw new UnauthorizedException('User no longer exists');

    if (!user.jwt.includes(jti)) {
      throw new UnauthorizedException('Token is no longer valid');
    }

    return { sub, jti, themeId };
  }
}
