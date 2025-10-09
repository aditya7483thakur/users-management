// src/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
      passReqToCallback: true, // <-- important
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    const authHeader = req.headers['authorization'] as string | undefined;
    const token = authHeader?.split(' ')[1]; // Bearer <token>

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    const user = await this.userModel.findById(payload.sub);
    if (!user) throw new UnauthorizedException('User no longer exists');

    if (!user.jwt.includes(token)) {
      throw new UnauthorizedException('Token is no longer valid');
    }

    return { sub: payload.sub };
  }
}
