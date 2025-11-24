import mongoose, { Document, Schema } from 'mongoose';

export interface IRequest extends Document {
  type: 'saludo' | 'grito' | 'concurso' | 'cancion' | 'declaracion';
  details: string;
  user: string;
  timestamp: Date;
}

const requestSchema = new Schema<IRequest>({
  type: {
    type: String,
    enum: ['saludo', 'grito', 'concurso', 'cancion', 'declaracion'],
    required: true
  },
  details: {
    type: String,
    required: true,
    minlength: 5
  },
  user: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model<IRequest>('Request', requestSchema);
