import mongoose, { Document, Schema } from 'mongoose';

export interface ISchedule extends Document {
  day: string;
  startTime: string;
  endTime: string;
  show: string;
  dj: string;
}

const scheduleSchema = new Schema<ISchedule>({
  day: {
    type: String,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  show: {
    type: String,
    required: true
  },
  dj: {
    type: String,
    required: true
  }
});

export default mongoose.model<ISchedule>('Schedule', scheduleSchema);
