
'use server';

import {
  fetchLatestNews,
  FetchLatestNewsInput,
  FetchLatestNewsOutput
} from '@/ai/flows/fetch-latest-news';
import { generateHabboName, GenerateHabboNameInput, GenerateHabboNameOutput } from '@/ai/flows/generate-habbo-name';

import { z } from 'zod';
import { db } from './firebase';
import { ref, push, serverTimestamp, runTransaction, get } from 'firebase/database';


const requestFormSchema = z.object({
  requestType: z.enum(["saludo", "grito", "concurso", "cancion", "declaracion"]),
  authorName: z.string().optional(),
  // Fields for each type
  saludoTo: z.string().optional(),
  saludoMessage: z.string().optional(),
  gritoMessage: z.string().optional(),
  concursoName: z.string().optional(),
  concursoAnswer: z.string().optional(),
  cancionName: z.string().optional(),
  declaracionTo: z.string().optional(),
  declaracionMessage: z.string().optional(),
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
  const authorNameValue = formData.get('authorName');

  if (!authorNameValue) {
    return {
      message: 'Debes iniciar sesión para enviar una petición.',
      isSuccess: false,
      isError: true,
    };
  }

  const validatedFields = requestFormSchema.safeParse({
    requestType: formData.get('requestType'),
    authorName: authorNameValue,
    saludoTo: formData.get('saludoTo'),
    saludoMessage: formData.get('saludoMessage'),
    gritoMessage: formData.get('gritoMessage'),
    concursoName: formData.get('concursoName'),
    concursoAnswer: formData.get('concursoAnswer'),
    cancionName: formData.get('cancionName'),
    declaracionTo: formData.get('declaracionTo'),
    declaracionMessage: formData.get('declaracionMessage'),
  });

  if (!validatedFields.success) {
    return {
      message: validatedFields.error.errors[0].message,
      isSuccess: false,
      isError: true,
    };
  }

  try {
    const { authorName, requestType, ...details } = validatedFields.data;
    
    // Constructing a readable details string for the DJ
    let detailsString = '';
    switch(requestType) {
        case 'saludo': detailsString = `Para: ${details.saludoTo} - Mensaje: ${details.saludoMessage}`; break;
        case 'grito': detailsString = `Mensaje: ${details.gritoMessage}`; break;
        case 'concurso': detailsString = `Concurso: ${details.concursoName} - Respuesta: ${details.concursoAnswer}`; break;
        case 'cancion': detailsString = `Canción: ${details.cancionName}`; break;
        case 'declaracion': detailsString = `Para: ${details.declaracionTo} - Mensaje: ${details.declaracionMessage}`; break;
    }

    const requestsRef = ref(db, 'userRequests');
    await push(requestsRef, {
      type: requestType,
      details: detailsString,
      user: authorName || 'Anónimo',
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
