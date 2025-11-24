import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  articleId: string;
  authorUid: mongoose.Types.ObjectId;
  authorName: string;
  comment: string;
  timestamp: Date;
}

const commentSchema = new Schema<IComment>({
  articleId: {
    type: String,
    required: true,
    index: true
  },
  authorUid: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorName: {
    type: String,
    required: true
  },
  comment: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 500
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model<IComment>('Comment', commentSchema);
