import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserMongoRepository } from './repositories/mongo-user.repository';

import { AppConfigModule } from 'src/config/config.module';
import { TokenMongoRepository } from './repositories/mongo-token.repository';
import { CommonModule } from 'src/common/common.module';
@Module({
  imports: [AppConfigModule, CommonModule],
  providers: [
    UserService,
    UserMongoRepository,
    { provide: 'USER_REPOSITORY', useClass: UserMongoRepository },

    TokenMongoRepository,
    { provide: 'TOKEN_REPOSITORY', useClass: TokenMongoRepository },
  ],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
