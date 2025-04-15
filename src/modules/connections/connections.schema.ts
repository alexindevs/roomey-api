import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ConnectionDocument = HydratedDocument<Connection>;

@Schema()
export class Connection {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ required: true, type: String })
  socket_id: string;

  @Prop({ type: String, required: true })
  namespace: string;

  @Prop({ type: Boolean, default: true })
  is_active: boolean;

  @Prop({ type: Date, default: Date.now })
  connected_at: Date;

  @Prop({ type: Date })
  disconnected_at: Date;
}

export const ConnectionSchema = SchemaFactory.createForClass(Connection);
