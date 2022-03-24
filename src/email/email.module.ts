import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { authModule } from 'src/auth/auth.module';
import { Config, ConfigSchema } from 'src/config/entities/config.entity';
import { Template, TemplateSchema } from 'src/config/entities/template.entity';
import { emailService } from './email.service';
import { Templates } from './utils/Templates';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Config.name, schema: ConfigSchema },
      { name: Template.name, schema: TemplateSchema },
    ]),
    forwardRef(() => authModule),
  ],
  providers: [emailService, Templates],
  exports: [emailService],
})
export class emailModule {}
