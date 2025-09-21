'use server';

import {
  validateSongRequest,
  ValidateSongRequestInput,
  ValidateSongRequestOutput
} from '@/ai/flows/validate-song-request';
import {
  fetchLatestNews,
  FetchLatestNewsInput,
  FetchLatestNewsOutput
} from '@/ai/flows/fetch-latest-news';
import { z } from 'zod';

const songRequestFormSchema = z.object({
  songRequest: z.string().min(3, 'Song request must be at least 3 characters.'),
});

type SongRequestFormState = {
  message: string;
  isSuccess: boolean;
  isError: boolean;
};

export async function submitSongRequest(
  prevState: SongRequestFormState,
  formData: FormData
): Promise<SongRequestFormState> {
  const validatedFields = songRequestFormSchema.safeParse({
    songRequest: formData.get('songRequest'),
  });

  if (!validatedFields.success) {
    return {
      message: validatedFields.error.errors[0].message,
      isSuccess: false,
      isError: true,
    };
  }

  try {
    const input: ValidateSongRequestInput = {
      songRequest: validatedFields.data.songRequest,
    };
    const result: ValidateSongRequestOutput = await validateSongRequest(input);

    if (result.isValid) {
      return {
        message: "Your song request has been successfully submitted and approved! We'll play it soon.",
        isSuccess: true,
        isError: false,
      };
    } else {
      return {
        message: `Your request was not approved. Reason: ${result.reason}`,
        isSuccess: false,
        isError: true,
      };
    }
  } catch (error) {
    return {
      message: 'An AI-related error occurred. Please try again later.',
      isSuccess: false,
      isError: true,
    };
  }
}

export async function getLatestNews(input: FetchLatestNewsInput): Promise<FetchLatestNewsOutput> {
  try {
    // In a real app, you might add more logic or error handling here.
    const news = await fetchLatestNews(input);
    return news;
  } catch (e) {
    console.error("Failed to fetch latest news", e);
    return { newsSummary: "Sorry, we couldn't fetch the latest news at the moment." }
  }
}

// Placeholder for contact form
export async function submitContactForm(formData: FormData) {
    console.log("Contact form submitted with:", {
        name: formData.get('name'),
        email: formData.get('email'),
        message: formData.get('message'),
    });
    // In a real app, you would process this data (e.g., send an email, save to DB)
    return { success: true, message: "Your message has been sent successfully!" };
}
