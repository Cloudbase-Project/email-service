import {
  Controller,
  Get,
  HttpCode,
  Logger,
  UseGuards,
  Inject,
  Param,
  Query,
  Post,
  Body,
  ValidationPipe,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { ApiHeader } from '@nestjs/swagger';
import { OwnerGuard } from './guards/ownerGuard';
import { configService } from './config.service';
import { createConfigDTO } from './dtos/createConfig.dto';
import { ValidationException } from 'src/utils/exception/ValidationException';

// @ApiHeader({ name: 'Authorization', required: true })
@Controller('config')
export class configController {
  private readonly logger = new Logger('configController');

  constructor(
    private readonly configService: configService,
    @Inject(REQUEST) private readonly req: Request,
  ) {}

  @Get('/:projectId/users') // route
  @ApiHeader({ name: 'Authorization', required: true })
  @UseGuards(OwnerGuard)
  @HttpCode(200) // Return type
  viewUsers(
    @Param('projectId') projectId: string,
    @Query('per_page') per_page: string,
    @Query('page') page: string,
  ) {
    return this.configService.viewUsers(
      this.req.ownerId,
      projectId,
      per_page,
      page,
    );
  }

  // internal route
  @Post('/')
  @HttpCode(201)
  createConfig(
    @Body(
      new ValidationPipe({
        exceptionFactory: ValidationException.throwValidationException,
        forbidNonWhitelisted: true, // Add validation options here.
        whitelist: true,
      }),
    )
    createConfigDTO: createConfigDTO,
  ) {
    return this.configService.createConfig(createConfigDTO);
  }

  @Post('/')
  @HttpCode(200)
  @UseGuards(OwnerGuard)
  toggleService(@Param('projectId') projectId: string) {
    return this.configService.toggleService(projectId, this.req.ownerId);
  }
}
