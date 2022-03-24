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

  async sendBulkEmail(sendBulkEmailDTO: sendBulkEmailDTO) {
    // const config = await thi

    const { emails, template, subject, text } = sendBulkEmailDTO;

    for (const emailId of emails) {
      this.transporter.sendMail({
        from: process.env.SENDER_EMAIL,
        to: emailId,
        subject: subject,
        text: text,
        html: template,
      });
    }
  }

  async sendVerificationEmail({
    email,
    id,
    projectId,
  }: {
    email: string;
    id: string;
    projectId: string;
  }) {
    const token = this.Jwt.newToken<{
      email: string;
      id: string;
      fromEmail: boolean;
      projectId: string;
    }>({ email: email, id, fromEmail: true, projectId }, { expiresIn: '24h' });

    return this.transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: 'Message',
      text: 'Checking 123',
      html: this.Templates.verificationEmailTemplate({
        url: `${process.env.BACKEND_URL}/auth/verify?token=${token}`,
        site: 'www.hse.com',
        email,
      }),
    });
  }

  async sendResetPasswordEmail({
    email,
    id,
    projectId,
  }: {
    email: string;
    id: string;
    projectId: string;
  }) {
    const token = this.Jwt.newToken<{
      email: string;
      id: string;
      fromEmail: boolean;
      projectId: string;
    }>({ email: email, id, fromEmail: true, projectId }, { expiresIn: '24h' });

    return this.transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: 'Reset Password',
      text: 'Checking 123',
      html: this.Templates.resetPasswordTemplate({
        url: `${process.env.NEXTJS_URL}/auth/verify/password?token=${token}`,
        site: 'www.hse.com',
        email,
      }),
    });
  }
}
