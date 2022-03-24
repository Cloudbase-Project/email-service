import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Template } from './template.entity';

export type ConfigDocument = Config & Document;

@Schema({
  timestamps: true, // adds createdAt and updatedAt fields automatically
  toJSON: {
    transform: (doc: any, ret) => {
      // Remove fields when converting to JSON.
      // Eg: Remove password fields etc.
      delete ret.__v;
    },
  },
})
export class Config {
  @Prop({ required: true })
  projectId: string;

  @Prop({ required: true })
  owner: string;

  @Prop({ required: true, default: false })
  enabled: boolean;

  @Prop({ required: true, default: false })
  templates: [Template];
}

export const ConfigSchema = SchemaFactory.createForClass(Config);
