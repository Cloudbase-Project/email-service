import { IsString } from 'class-validator';

export class createTemplateDTO {
  @IsString()
  template: string;

  @IsString()
  name: string;
}
