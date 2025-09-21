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
};

export type NewsArticleFormValues = Omit<NewsArticle, 'id'>;
