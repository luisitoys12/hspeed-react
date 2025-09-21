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
  songRequest: z.string().min(3, 'La petición debe tener al menos 3 caracteres.'),
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
        message: "¡Tu petición de canción ha sido enviada y aprobada! La pondremos pronto.",
        isSuccess: true,
        isError: false,
      };
    } else {
      return {
        message: `Tu petición no fue aprobada. Razón: ${result.reason}`,
        isSuccess: false,
        isError: true,
      };
    }
  } catch (error) {
    return {
      message: 'Ocurrió un error con la IA. Por favor, inténtalo de nuevo más tarde.',
      isSuccess: false,
      isError: true,
    };
  }
}

export async function getLatestNews(input: FetchLatestNewsInput): Promise<FetchLatestNewsOutput> {
  try {
    const news = await fetchLatestNews(input);
    return news;
  } catch (e) {
    console.error("Failed to fetch latest news", e);
    return { newsSummary: "Lo sentimos, no pudimos obtener las últimas noticias en este momento." }
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
    return { success: true, message: "¡Tu mensaje ha sido enviado con éxito!" };
}