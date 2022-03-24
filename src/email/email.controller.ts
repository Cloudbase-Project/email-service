import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  ValidationPipe,
  Logger,
  Query,
  UseGuards,
  Param,
  Inject,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { registerUserDTO } from 'src/auth/dto/registerUser.dto';
import { createTemplateDTO } from 'src/config/dtos/createTemplate.dto';
import { OwnerGuard } from 'src/config/guards/ownerGuard';
import { ValidationException } from '../utils/exception/ValidationException';
import { emailService } from './email.service';
import { Request } from 'express';

@Controller('email')
export class emailController {
  private readonly logger = new Logger('authController');

  constructor(
    private readonly emailService: emailService,
    @Inject(REQUEST) private readonly req: Request,
  ) {}

  @Get()
  getHello(): string {
    return 'hello world';
  }

  @Post('/:projectId/template')
  @HttpCode(201) // Return type
  @UseGuards(OwnerGuard)
  createTemplate(
    @Body(
      new ValidationPipe({
        exceptionFactory: ValidationException.throwValidationException,
        forbidNonWhitelisted: true, // Add validation options here.
        whitelist: true,
      }),
    )
    createTemplateDTO: createTemplateDTO,
    @Param('projectId') projectId: string,
  ) {
    return this.emailService.createTemplate(
      createTemplateDTO,
      projectId,
      this.req.ownerId,
    );
  }

  @Post('/register') // route
  @HttpCode(201) // Return type
  @UseGuards(OwnerGuard)
  sendBulkEmail(
    @Body(
      new ValidationPipe({
        exceptionFactory: ValidationException.throwValidationException,
        forbidNonWhitelisted: true, // Add validation options here.
        whitelist: true,
      }),
    )
    sendBulkEmailDTO: sendBulkEmailDTO,
  ) {
    return this.emailService.sendBulkEmail(registerUserDTO);
  }
}
