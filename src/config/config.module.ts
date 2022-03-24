import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { authModule } from 'src/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Config, ConfigSchema } from 'src/config/entities/config.entity';
import { configService } from './config.service';
import { configController } from './config.controller';
import { User, UserSchema } from 'src/user/entities/user.entity';
import { userModule } from 'src/user/user.module';
import Utils from './utils/utils';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Config.name, schema: ConfigSchema },
      { name: User.name, schema: UserSchema },
    ]),
    forwardRef(() => userModule),
    forwardRef(() => authModule),
  ],
  controllers: [configController],
  providers: [configService, Utils, Config],
  exports: [Config],
})
export class configModule {}
