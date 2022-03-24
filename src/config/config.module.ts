import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { authModule } from 'src/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Config, ConfigSchema } from 'src/config/entities/config.entity';
import { configService } from './config.service';
import { configController } from './config.controller';
import Utils from './utils/utils';
import { Template, TemplateSchema } from './entities/template.entity';
import { emailModule } from 'src/email/email.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Config.name, schema: ConfigSchema },
      { name: Template.name, schema: TemplateSchema },
    ]),
    forwardRef(() => emailModule),
    forwardRef(() => authModule),
  ],
  controllers: [configController],
  providers: [configService, Utils, Config],
  exports: [Config],
})
export class configModule {}
