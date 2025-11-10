import { Module } from '@nestjs/common';
import { ThemeService } from './theme.service';
import { ThemeController } from './theme.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Theme, ThemeSchema } from './schemas/theme.schema';
import { ThemeMongoRepository } from './repositories/mongo-theme.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Theme.name, schema: ThemeSchema }]),
  ],
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
