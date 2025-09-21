import { config } from 'dotenv';
config();

import '@/ai/flows/fetch-latest-news.ts';
import '@/ai/flows/validate-song-request.ts';
import '@/ai/flows/generate-habbo-name';
