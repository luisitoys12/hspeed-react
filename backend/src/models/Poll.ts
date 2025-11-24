import mongoose, { Document, Schema } from 'mongoose';

export interface IPoll extends Document {
  title: string;
  options: Map<string, { name: string; votes: number }>;
  isActive: boolean;
  createdAt: Date;
}

const pollSchema = new Schema<IPoll>({
  title: {
    type: String,
    required: true
  },
  options: {
    type: Map,
    of: {
      name: String,
      votes: Number
    },
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model<IPoll>('Poll', pollSchema);
