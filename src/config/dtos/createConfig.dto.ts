import { IsString } from 'class-validator';

export class createConfigDTO {
  @IsString()
  owner: string;

  @IsString()
  projectId: string;
}
