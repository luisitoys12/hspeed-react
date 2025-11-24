
'use server';

import {
  fetchLatestNews,
  FetchLatestNewsInput,
  FetchLatestNewsOutput
} from '@/ai/flows/fetch-latest-news';
import { generateHabboName, GenerateHabboNameInput, GenerateHabboNameOutput } from '@/ai/flows/generate-habbo-name';

import { z } from 'zod';


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

// Webhook function deprecated - implement in backend if needed
async function sendWebhook(type: string, data: any) {
    console.log('Webhook deprecated:', type, data);
}


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

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const response = await fetch(`${API_URL}/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: requestType,
        details: details,
        user: username
      })
    });

    if (!response.ok) {
      throw new Error('Error al enviar la petición');
    }

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
        // TODO: Implement contact form API endpoint
        console.log('Contact form submission:', validatedFields.data);
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
  // This function is deprecated - use commentsApi from @/lib/api instead
  return { success: false, message: "Esta función ha sido migrada a la nueva API" };
}

export async function addReaction(articleId: string, reaction: string, authorUid: string) {
  // This function is deprecated - implement in backend API if needed
  return { success: false, message: 'Esta función ha sido migrada a la nueva API' };
}

// Deprecated functions below - kept for compatibility
async function addReactionOld(articleId: string, reaction: string, authorUid: string) {
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

const awardVoteSchema = z.object({
  categoryId: z.string(),
  nomineeId: z.string(),
  userId: z.string(),
});

export async function submitAwardVote(data: z.infer<typeof awardVoteSchema>) {
    // This function is deprecated - implement in backend API if needed
    return { success: false, message: "Esta función ha sido migrada a la nueva API" };
}


// --- Notification Actions ---
import { google } from 'googleapis';

async function getAccessToken() {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);
    const jwtClient = new google.auth.JWT(
        serviceAccount.client_email,
        undefined,
        serviceAccount.private_key,
        ['https://www.googleapis.com/auth/firebase.messaging'],
        undefined
    );
    const tokens = await jwtClient.authorize();
    if (!tokens.access_token) {
        throw new Error('Failed to get access token');
    }
    return tokens.access_token;
}

const notificationSchema = z.object({
  title: z.string().min(3),
  body: z.string().min(10),
  url: z.string().url().optional().or(z.literal('')),
});

export async function submitNotification(formData: FormData) {
  // This function is deprecated - implement push notifications in backend if needed
  return { success: false, message: "Esta función ha sido migrada a la nueva API" };
}

// Deprecated notification function
async function submitNotificationOld(formData: FormData) {
  const validatedFields = notificationSchema.safeParse({
    title: formData.get('title'),
    body: formData.get('body'),
    url: formData.get('url'),
  });

  if (!validatedFields.success) {
    return { success: false, message: 'Datos de notificación no válidos.' };
  }
  
  try {
    const { title, body, url } = validatedFields.data;
    if (!tokensSnapshot.exists()) {
      return { success: false, message: 'No hay usuarios suscritos a las notificaciones.' };
    }
    const tokens = Object.keys(tokensSnapshot.val());

    const accessToken = await getAccessToken();
    const fcmEndpoint = `https://fcm.googleapis.com/v1/projects/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/messages:send`;
    
    const message = {
        message: {
            notification: {
                title,
                body,
            },
            webpush: {
                fcm_options: {
                   link: url || 'https://hspeed-react.netlify.app/',
                },
            },
            // The token to send to. This will be different for each user.
            // For batch sending, you would iterate and send multiple requests.
            // For simplicity, we are sending to the first token here. A robust implementation would handle multiple tokens.
            token: tokens[0] 
        },
    };

    const response = await fetch(fcmEndpoint, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("FCM Send Error:", errorData);
        throw new Error(`Error al enviar notificación: ${response.statusText}`);
    }

    return {
      success: true,
      message: `Notificación enviada con éxito a ${tokens.length} dispositivo(s).`,
    };

  } catch (error: any) {
    console.error('Notification submission error:', error);
    return { success: false, message: error.message || 'Error al procesar la solicitud de notificación.' };
  }
}

export async function addLikeToDj(userId: string, djName: string) {
    // This function is deprecated - implement in backend API if needed
    return { success: false, message: "Esta función ha sido migrada a la nueva API" };
}

export { sendWebhook };
