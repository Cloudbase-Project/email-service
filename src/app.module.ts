import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health/health.controller';
import { authModule } from './auth/auth.module';
import { AdminModule } from '@adminjs/nestjs';
import AdminJS from 'adminjs';
import { Database, Resource } from '@adminjs/mongoose';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { configModule } from './config/config.module';
import { emailModule } from './email/email.module';

console.log('AdminJSMongoose : ', Database, Resource);

AdminJS.registerAdapter({ Database, Resource });

@Module({
  imports: [
    ConfigModule.forRoot(), // for loading env variables
    TerminusModule, // for healthchecks
    MongooseModule.forRoot(process.env.MONGODB_URI), // orm

    // AdminModule.createAdminAsync({
    //   inject: [getModelToken('User')],
    //   imports: [userModule],
    //   useFactory: (userModel: Model<User>) => ({
    //     adminJsOptions: {
    //       rootPath: '/admin',
    //       resources: [{ resource: userModel }],
    //     },
    //   }),
    // }),

    // AdminModule.createAdminAsync({
    //   imports: [TypegooseSchemasModule],
    //   inject: [get]
    //   adminJsOptions: {
    //     rootPath: '/admin',
    //     resources: [],
    //   },
    // }),

    emailModule, // your resource
    authModule,
    configModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
