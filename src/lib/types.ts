export type ScheduleItem = {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  show: string;
  dj: string;
};

export type ScheduleFormValues = Omit<ScheduleItem, 'id'>;

export type NewsArticle = {
  id: string;
  title: string;
  summary: string;
  content: string;
  imageUrl: string;
  imageHint: string;
  category: string;
  date: string;
  reactions?: { [key: string]: number };
};

export type NewsArticleFormValues = Omit<NewsArticle, 'id'>;

export type Comment = {
  id: string;
  articleId?: string; // articleId is not always present, e.g. when fetching comments for an article
  authorUid: string;
  authorName: string;
  comment: string;
  timestamp: number;
};

export type EventItem = {
  id: string;
  title: string;
  server: string;
  date: string;
  time: string;
  roomName: string;
  roomOwner: string;
  host: string;
  imageUrl: string;
  imageHint: string;
};

export type EventFormValues = Omit<EventItem, 'id'>;

export interface Poll {
  id: string;
  title: string;
  options: { [key: string]: { name: string; votes: number } };
  isActive: boolean;
  createdAt: number;
}

export interface PollOption {
  id: string;
  name: string;
  votes: number;
}
