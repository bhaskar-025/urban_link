import mongoose, { Schema, Document } from 'mongoose';

export interface IComplaint extends Document {
  user: mongoose.Types.ObjectId;
  ticketId: string;
  title: string;
  description: string;
  timeOfOccurrence?: Date;
  location: {
    lat: number;
    lng: number;
    address: string;
    city: string;
    state: string;
  };
  administrativeWard?: string;
  images: string[];
  department: string;
  priority: string;
  status: string;
  duplicateFlag: boolean;
  aiScore?: number;
  upvotes: mongoose.Types.ObjectId[];
  downvotes: mongoose.Types.ObjectId[];
  statusUpdates: {
    status: string;
    message: string;
    timestamp: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const ComplaintSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  ticketId: { type: String, required: true, unique: true },
  title: { type: String, required: true, maxlength: 80 },
  description: { type: String, required: true, minlength: 20 },
  timeOfOccurrence: { type: Date },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true }
  },
  administrativeWard: { type: String, default: 'Unassigned' },
  images: [{ type: String }],
  department: { type: String, default: 'Unassigned' },
  priority: { type: String, default: 'Pending AI Analysis' },
  status: { type: String, default: 'Pending' },
  duplicateFlag: { type: Boolean, default: false },
  aiScore: { type: Number, default: 0 },
  upvotes: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
  downvotes: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
  statusUpdates: [{
    status: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model<IComplaint>('Complaint', ComplaintSchema);
