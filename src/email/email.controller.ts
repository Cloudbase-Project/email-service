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
} from '@nestjs/common';
import { OwnerGuard } from 'src/config/guards/ownerGuard';
import { ValidationException } from '../utils/exception/ValidationException';
import { emailService } from './email.service';

@Controller('email')
export class emailController {
  private readonly logger = new Logger('authController');

  constructor(private readonly emailService: emailService) {}

  @Get()
  getHello(): string {
    return 'hello world';
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
