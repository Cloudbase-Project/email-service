import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigDocument } from './entities/config.entity';
import { ApplicationException } from 'src/utils/exception/ApplicationException';
import { createConfigDTO } from './dtos/createConfig.dto';

@Injectable()
export class configService {
  private readonly logger = new Logger('userService');

  constructor(
    @InjectModel('Config')
    private readonly configModel: Model<ConfigDocument>,
  ) {}

  async createConfig(createConfigDTO: createConfigDTO) {
    const config = await this.configModel.create({
      enabled: true,
      projectId: createConfigDTO.projectId,
      owner: createConfigDTO.owner,
    });

    return config;
  }

  async toggleService(projectId: string, ownerId: string) {
    const config = await this.configModel.findOne({
      projectId: projectId,
      owner: ownerId,
    });
    if (!config) {
      throw new ApplicationException('invalid projectid', 400);
    }
    config.enabled = !config.enabled;
    await config.save();
    return config;
  }
}
