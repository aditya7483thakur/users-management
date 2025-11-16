import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Theme, ThemeDocument } from 'src/domains/theme/schemas/theme.schema';
import { MongoRepository } from 'src/infra/database/mongo.repository';
import { ThemeRepository } from '../interfaces/theme.repository';
@Injectable()
export class ThemeMongoRepository
  extends MongoRepository<ThemeDocument>
  implements ThemeRepository
{
  constructor(
    @InjectModel(Theme.name) private readonly themeModel: Model<ThemeDocument>,
  ) {
    super(themeModel);
  }

  async addCustomTheme(
    themeId: string,
    name: string,
    hex: string,
  ): Promise<Theme> {
    const isValidHex = /^#([0-9A-F]{3}){1,2}$/i.test(hex);
    if (!isValidHex) throw new BadRequestException('Invalid hex color format');

    const themeDoc = await this.themeModel.findById(themeId).exec();
    if (!themeDoc) throw new NotFoundException('Theme not found');

    const exists = themeDoc.customThemes.some(
      (t) => t.name.toLowerCase() === name.toLowerCase(),
    );
    if (exists) throw new BadRequestException('Theme name already exists');

    themeDoc.customThemes.push({ name, hex });
    await themeDoc.save();

    return themeDoc;
  }

  async deleteCustomTheme(themeId: string, name: string): Promise<Theme> {
    const themeDoc = await this.themeModel.findById(themeId).exec();
    if (!themeDoc) throw new NotFoundException('Theme not found');

    const themeToDelete = themeDoc.customThemes.find(
      (t) => t.name.toLowerCase() === name.toLowerCase(),
    );
    if (!themeToDelete) throw new NotFoundException('Custom theme not found');

    themeDoc.customThemes = themeDoc.customThemes.filter(
      (t) => t.name.toLowerCase() !== name.toLowerCase(),
    );

    if (themeDoc.theme === themeToDelete.hex) {
      themeDoc.theme = '#ffffff';
    }

    await themeDoc.save();
    return themeDoc;
  }
}
