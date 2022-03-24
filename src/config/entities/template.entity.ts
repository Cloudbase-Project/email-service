import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TemplateDocument = Template & Document;

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
export class Template {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  template: string;
}

export const TemplateSchema = SchemaFactory.createForClass(Template);
