import mongoose, { Document, Schema } from 'mongoose';

export interface IConfig extends Document {
  radioService: 'azuracast' | 'zenofm';
  apiUrl: string;
  listenUrl: string;
  homePlayerBgUrl?: string;
  homePlayerListenersBadgeUrl?: string;
  homePlayerDjSetUrl?: string;
  discordWebhookUrls?: {
    news?: string;
    events?: string;
    requests?: string;
    onAir?: string;
    nextDj?: string;
    song?: string;
  };
  slideshow: Array<{
    title: string;
    subtitle: string;
    imageUrl: string;
    imageHint: string;
    cta?: {
      text: string;
      href: string;
    };
  }>;
}

const configSchema = new Schema<IConfig>({
  radioService: {
    type: String,
    enum: ['azuracast', 'zenofm'],
    default: 'azuracast'
  },
  apiUrl: {
    type: String,
    required: true
  },
  listenUrl: {
    type: String,
    required: true
  },
  homePlayerBgUrl: String,
  homePlayerListenersBadgeUrl: String,
  homePlayerDjSetUrl: String,
  discordWebhookUrls: {
    news: String,
    events: String,
    requests: String,
    onAir: String,
    nextDj: String,
    song: String
  },
  slideshow: [{
    title: String,
    subtitle: String,
    imageUrl: String,
    imageHint: String,
    cta: {
      text: String,
      href: String
    }
  }]
});

export default mongoose.model<IConfig>('Config', configSchema);
