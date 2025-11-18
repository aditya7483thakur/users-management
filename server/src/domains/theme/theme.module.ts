import { Module } from '@nestjs/common';
import { ThemeService } from './theme.service';
import { ThemeController } from './theme.controller';
import { ThemeMongoRepository } from './repositories/mongo-theme.repository';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [ThemeController],
  providers: [
    ThemeService,
    {
      provide: 'THEME_REPOSITORY',
      useClass: ThemeMongoRepository,
    },
  ],
  exports: [ThemeService],
})
export class ThemeModule {}
