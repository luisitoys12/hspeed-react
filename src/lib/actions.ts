
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
import { db } from './firebase';
import { ref, push, serverTimestamp } from 'firebase/database';


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
      // Here you could also save the request to a database
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


const contactFormSchema = z.object({
  name: z.string().min(2, "El nombre es requerido."),
  email: z.string().email("El email no es válido."),
  message: z.string().min(10, "El mensaje debe tener al menos 10 caracteres."),
});

export async function submitContactForm(formData: FormData) {
    const validatedFields = contactFormSchema.safeParse({
        name: formData.get('name'),
        email: formData.get('email'),
        message: formData.get('message'),
    });

    if (!validatedFields.success) {
        return { success: false, message: "Por favor, revisa los campos del formulario." };
    }

    try {
        const messagesRef = ref(db, 'contact-messages');
        await push(messagesRef, {
            ...validatedFields.data,
            timestamp: serverTimestamp(),
            read: false,
        });
        return { success: true, message: "¡Tu mensaje ha sido enviado con éxito!" };
    } catch (error) {
        console.error("Error saving contact message:", error);
        return { success: false, message: "No se pudo enviar tu mensaje. Inténtalo de nuevo más tarde." };
    }
}
