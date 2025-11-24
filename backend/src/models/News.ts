import mongoose, { Document, Schema } from 'mongoose';

export interface INews extends Document {
  title: string;
  summary: string;
  content: string;
  imageUrl: string;
  imageHint: string;
  category: string;
  date: string;
  reactions: Map<string, number>;
  createdAt: Date;
}

const newsSchema = new Schema<INews>({
  title: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  imageHint: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  reactions: {
    type: Map,
    of: Number,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model<INews>('News', newsSchema);
