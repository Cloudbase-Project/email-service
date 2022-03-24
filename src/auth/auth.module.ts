import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { authController } from './auth.controller';
import { authService } from './auth.service';
import { Password } from './utils/password';
import { JWT } from './utils/token';
import { AuthGuard } from './guards/authGuard';
import { GoogleOAuth } from './utils/GoogleOAuth';
import { MongooseModule } from '@nestjs/mongoose';
import { emailModule } from 'src/email/email.module';
import { configModule } from 'src/config/config.module';
import { Config, ConfigSchema } from 'src/config/entities/config.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Config.name, schema: ConfigSchema }]),
    ConfigModule,
    forwardRef(() => configModule),
    forwardRef(() => emailModule),
  ],
  controllers: [authController],
  providers: [authService, Password, AuthGuard, GoogleOAuth, JWT],
  exports: [JWT, AuthGuard],
})
export class authModule {}
