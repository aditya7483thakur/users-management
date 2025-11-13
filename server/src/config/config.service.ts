import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: NestConfigService) {}

  // ✅ Application Port
  get port(): number {
    return this.configService.get<number>('appConfig.port', 5000);
  }

  // ✅ MongoDB URI
  get mongoUri(): string {
    return this.configService.get<string>('appConfig.mongo_uri', '');
  }

  // ✅ JWT Secret
  get jwtSecret(): string {
    return this.configService.get<string>('appConfig.jwt_secret', '');
  }

  // ✅ Brevo API Key
  get brevoApiKey(): string {
    return this.configService.get<string>('appConfig.brevo_api', '');
  }

  // ✅ Frontend URL
  get frontendUrl(): string {
    return this.configService.get<string>('appConfig.frontend_url', '');
  }

  // ✅ Environment (development / production)
  get nodeEnv(): string {
    return this.configService.get<string>('appConfig.node_env', 'development');
  }

  // ✅ JWT Expiration Time
  get jwtExpiresIn(): string {
    return this.configService.get<string>('appConfig.expires_in', '7d');
  }
}
