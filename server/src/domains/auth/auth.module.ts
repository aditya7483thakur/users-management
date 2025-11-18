import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { ThemeModule } from '../theme/theme.module';
import { CommonModule } from 'src/common/common.module';
import { AppConfigModule } from 'src/config/config.module';
import { TokenMongoRepository } from './repositories/mongo-token.repository';
import { UserMongoRepository } from './repositories/mongo-user.repository';
import { Model } from 'mongoose';
import { ThemeDocument } from 'src/common/schemas/theme.schema';
import { MongoRepository } from 'src/infra/database/mongo.repository';
import { getModelToken } from '@nestjs/mongoose';

@Module({
  imports: [UserModule, CommonModule, AppConfigModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenMongoRepository,
    { provide: 'TOKEN_REPOSITORY', useClass: TokenMongoRepository },
    UserMongoRepository,
    { provide: 'USER_REPOSITORY', useClass: UserMongoRepository },

    {
      provide: 'THEME_REPOSITORY',
      useFactory: (themeModel: Model<ThemeDocument>) =>
        new MongoRepository(themeModel),
      inject: [getModelToken('Theme')],
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
