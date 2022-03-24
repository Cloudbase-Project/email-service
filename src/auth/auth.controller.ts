import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  ValidationPipe,
  Logger,
  Query,
  Param,
} from '@nestjs/common';
import { ValidationException } from '../utils/exception/ValidationException';
import { ApiBody } from '@nestjs/swagger';
import { authService } from './auth.service';
import { registerUserDTO } from './dto/registerUser.dto';
import { loginUserDTO } from './dto/loginUser.dto';
import { googleLoginDTO } from './dto/googleLogin.dto';

@Controller('auth')
export class authController {
  private readonly logger = new Logger('authController');

  constructor(private readonly authService: authService) {}

  @Get()
  getHello(): string {
    return 'hello world';
  }
}
