import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  text: string;
  user: mongoose.Types.ObjectId;
  authorName: string;
  city: string;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema: Schema = new Schema({
  text: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: { type: String, required: true },
  city: { type: String, required: true, index: true }
}, { timestamps: true });

export default mongoose.model<IMessage>('Message', MessageSchema);
