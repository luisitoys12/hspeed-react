
'use server';

import {
  fetchLatestNews,
  FetchLatestNewsInput,
  FetchLatestNewsOutput
} from '@/ai/flows/fetch-latest-news';
import { generateHabboName, GenerateHabboNameInput, GenerateHabboNameOutput } from '@/ai/flows/generate-habbo-name';

import { z } from 'zod';
import { db, firebaseConfig } from './firebase';
import { ref, push, serverTimestamp, runTransaction, get, remove } from 'firebase/database';


const requestFormSchema = z.object({
  username: z.string().min(2, 'Tu nombre es requerido.'),
  requestType: z.enum(["saludo", "grito", "concurso", "cancion", "declaracion"], {
      required_error: "Debes seleccionar un tipo de petición."
  }),
  details: z.string().min(5, "El detalle de la petición es muy corto."),
});


type RequestFormState = {
  message: string;
  isSuccess: boolean;
  isError: boolean;
};

export async function submitRequest(
  prevState: RequestFormState,
  formData: FormData
): Promise<RequestFormState> {

  const validatedFields = requestFormSchema.safeParse({
    username: formData.get('username'),
    requestType: formData.get('requestType'),
    details: formData.get('details'),
  });

  if (!validatedFields.success) {
    return {
      message: validatedFields.error.errors[0].message,
      isSuccess: false,
      isError: true,
    };
  }

  try {
    const { requestType, username, details } = validatedFields.data;

    const requestsRef = ref(db, 'userRequests');
    await push(requestsRef, {
      type: requestType,
      details: details,
      user: username,
      timestamp: serverTimestamp(),
    });

    return {
      message: "¡Tu petición ha sido enviada! Gracias por participar.",
      isSuccess: true,
      isError: false,
    };

  } catch (error) {
    console.error("Error submitting request:", error);
    return {
      message: 'Ocurrió un error al enviar tu petición. Por favor, inténtalo de nuevo.',
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

const commentFormSchema = z.object({
  comment: z.string().min(3, "El comentario debe tener al menos 3 caracteres.").max(500, "El comentario no puede exceder los 500 caracteres."),
  authorUid: z.string(),
  authorName: z.string(),
  articleId: z.string(),
});

export async function submitComment(formData: FormData) {
  const validatedFields = commentFormSchema.safeParse({
    comment: formData.get('comment'),
    authorUid: formData.get('authorUid'),
    authorName: formData.get('authorName'),
    articleId: formData.get('articleId'),
  });

  if (!validatedFields.success) {
    return { success: false, message: "Datos del comentario inválidos." };
  }
  
  if (!validatedFields.data.authorUid) {
      return { success: false, message: "Debes iniciar sesión para comentar." };
  }

  try {
    const { articleId, ...commentData } = validatedFields.data;
    const commentsRef = ref(db, `comments/${articleId}`);
    await push(commentsRef, {
      ...commentData,
      timestamp: serverTimestamp(),
    });
    return { success: true, message: "Comentario añadido." };
  } catch (error) {
    console.error("Error saving comment:", error);
    return { success: false, message: "No se pudo añadir tu comentario. Inténtalo más tarde." };
  }
}

export async function addReaction(articleId: string, reaction: string, authorUid: string) {
  if (!authorUid) {
    return { success: false, message: 'Debes iniciar sesión para reaccionar.' };
  }

  const allowedReactions = ['❤️', '🎉', '🤔', '👍'];
  if (!allowedReactions.includes(reaction)) {
    return { success: false, message: 'Reacción no válida.' };
  }

  try {
    const reactionRef = ref(db, `news/${articleId}/reactions/${reaction}`);
    const userReactionRef = ref(db, `userReactions/${authorUid}/${articleId}`);

    const snapshot = await get(userReactionRef);
    const previousReaction = snapshot.val();

    await runTransaction(userReactionRef, (currentReaction) => {
        if (currentReaction === reaction) {
            return null; // User is removing their reaction
        }
        return reaction; // User is adding or changing reaction
    });
    
    // Atomically update counts
    if (previousReaction && previousReaction !== reaction) {
      // Decrement the count of the previous reaction
      const prevReactionRef = ref(db, `news/${articleId}/reactions/${previousReaction}`);
      await runTransaction(prevReactionRef, (currentCount) => (currentCount || 0) - 1);
    }
    
    // Increment the new reaction or decrement if it was removed
    await runTransaction(reactionRef, (currentCount) => {
        const userClickedSameReaction = previousReaction === reaction;
        if (userClickedSameReaction) {
            return (currentCount || 1) - 1; // Decrement
        }
        return (currentCount || 0) + 1; // Increment
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error adding reaction:', error);
    return { success: false, message: 'No se pudo registrar tu reacción.' };
  }
}

// Name Generator Action
const nameGeneratorSchema = z.object({
  keyword: z.string().min(2, "La palabra clave debe tener al menos 2 caracteres."),
});

type NameGeneratorState = {
  names: string[];
  error?: string;
}

export async function generateNamesAction(prevState: NameGeneratorState, formData: FormData): Promise<NameGeneratorState> {
  const validatedFields = nameGeneratorSchema.safeParse({
    keyword: formData.get('keyword'),
  });

  if (!validatedFields.success) {
    return { names: [], error: validatedFields.error.errors[0].message };
  }

  try {
    const result = await generateHabboName({ keyword: validatedFields.data.keyword });
    return { names: result.names || [] };
  } catch (error) {
    console.error("Name generation failed:", error);
    return { names: [], error: "La IA no pudo generar nombres. Inténtalo de nuevo." };
  }
}

// --- Notification Actions ---

const notificationSchema = z.object({
  title: z.string().min(3),
  body: z.string().min(10),
  url: z.string().url().optional().or(z.literal('')),
});

export async function submitNotification(formData: FormData) {
  'use server';
  const validatedFields = notificationSchema.safeParse({
    title: formData.get('title'),
    body: formData.get('body'),
    url: formData.get('url'),
  });

  if (!validatedFields.success) {
    return { success: false, message: 'Datos de notificación no válidos.' };
  }

  try {
    // This is a placeholder for the actual server-side logic
    // In a real scenario, you'd use the Firebase Admin SDK here.
    console.log("Simulating notification sending...");
    const tokensSnapshot = await get(ref(db, 'fcmTokens'));
    if (!tokensSnapshot.exists()) {
      return { success: false, message: 'No hay usuarios suscritos a las notificaciones.' };
    }
    const tokens = Object.keys(tokensSnapshot.val());

    console.log(`Found ${tokens.length} tokens.`, validatedFields.data);
    
    // The fetch to FCM would happen here.
    // Since client-side SDK cannot get the required access token, we will simulate success.

    return {
      success: true,
      message: `Notificación enviada (simulado) a ${tokens.length} dispositivo(s).`,
    };

  } catch (error) {
    console.error('Notification submission error:', error);
    return { success: false, message: 'Error al procesar la solicitud de notificación.' };
  }
}
