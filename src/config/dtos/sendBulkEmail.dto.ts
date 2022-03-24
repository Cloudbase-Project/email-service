import { IsArray, IsString } from 'class-validator';

export class sendBulkEmailDTO {
  @IsArray()
  emails: string[];

  @IsString()
  templateId: string;

  @IsString()
  subject: string;

  @IsString()
  text: string;
}
