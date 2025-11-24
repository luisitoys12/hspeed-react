import mongoose, { Document, Schema } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  server: string;
  date: string;
  time: string;
  roomName: string;
  roomOwner: string;
  host: string;
  imageUrl: string;
  imageHint: string;
  createdAt: Date;
}

const eventSchema = new Schema<IEvent>({
  title: {
    type: String,
    required: true
  },
  server: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  roomName: {
    type: String,
    required: true
  },
  roomOwner: {
    type: String,
    required: true
  },
  host: {
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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model<IEvent>('Event', eventSchema);
