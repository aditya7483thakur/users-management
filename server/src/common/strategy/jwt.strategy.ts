import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { UserService } from 'src/domains/user/user.service';
import { AppConfigService } from 'src/config/config.service';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly appConfigService: AppConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: appConfigService.jwtSecret,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    const { jti, sub, themeId } = payload;
    const user = await this.userModel.findById(sub);
    if (!user) throw new UnauthorizedException('User no longer exists');

    if (!user.jwt.includes(jti)) {
      throw new UnauthorizedException('Token is no longer valid');
    }

    return { sub, jti, themeId };
  }
}
