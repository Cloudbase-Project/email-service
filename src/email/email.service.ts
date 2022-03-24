import { Injectable } from '@nestjs/common';
import { JWT } from 'src/auth/utils/token';
import { Templates } from './utils/Templates';
import Mail from 'nodemailer/lib/mailer';
import * as nodemailer from 'nodemailer';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigDocument } from 'src/config/entities/config.entity';
import { TemplateDocument } from 'src/config/entities/template.entity';
import { ApplicationException } from 'src/utils/exception/ApplicationException';
import { createTemplateDTO } from 'src/config/dtos/createTemplate.dto';
import { sendBulkEmailDTO } from 'src/config/dtos/sendBulkEmail.dto';

@Injectable()
export class emailService {
  public transporter: Mail;

  constructor(
    public Jwt: JWT,
    public Templates: Templates,
    @InjectModel('User')
    private readonly configModel: Model<ConfigDocument>,
    @InjectModel('Template')
    private readonly templateModel: Model<TemplateDocument>,
  ) {
    this.transporter = nodemailer.createTransport({
      host: process.env.AWS_SERVER_HOST,
      secure: true,
      auth: {
        user: process.env.AWS_SMTP_USERNAME,
        pass: process.env.AWS_SMTP_PASSWORD,
      },
    });
  }

  async createTemplate(
    createTemplateDTO: createTemplateDTO,
    projectId: string,
    ownerId: string,
  ) {
    const config = await this.configModel.findOne({
      owner: ownerId,
      projectId: projectId,
    });

    if (!config) {
      throw new ApplicationException(
        'Invalid projectId or you dont have access to this project',
        400,
      );
    }

    const template = await this.templateModel.create({
      template: createTemplateDTO.template,
      name: createTemplateDTO.name,
    });

    config.templates.push(template);
    await config.save();
    return { config: config };
  }

  async getTemplates(projectId: string, ownerId: string) {
    const config = await this.configModel.findOne({
      owner: ownerId,
      projectId: projectId,
    });

    if (!config) {
      throw new ApplicationException(
        'Invalid projectId or you dont have access to this project',
        400,
      );
    }

    return config;
  }

  async sendBulkEmail(
    sendBulkEmailDTO: sendBulkEmailDTO,
    projectId: string,
    ownerId: string,
  ) {
    // const config = await thi

    const { emails, templateId, subject, text } = sendBulkEmailDTO;

    const config = await this.configModel.findOne({
      owner: ownerId,
      projectId: projectId,
    });

    if (!config) {
      throw new ApplicationException(
        'Invalid projectId or you dont have access to this project',
        400,
      );
    }

    const template = await this.templateModel.findById(templateId);

    for (const emailId of emails) {
      this.transporter.sendMail({
        from: process.env.SENDER_EMAIL,
        to: emailId,
        subject: subject,
        text: text,
        html: template.template,
      });
    }

    return { message: 'email sent' };
  }
}
