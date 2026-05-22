import { pool } from "../server/db.js";
import { news, chatMessages, users } from "../shared/schema.js";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, desc } from "drizzle-orm";

const db = drizzle(pool);

async function main() {
  console.log("Connecting to database to update news and chat...");
  
  // 1. Update existing News Article with better image, title and content
  const allNews = await db.select().from(news);
  console.log(`Found ${allNews.length} news articles.`);
  
  if (allNews.length > 0) {
    await db.update(news)
      .set({ 
        imageUrl: "https://images.habbo.com/web_images/habbo-web-articles/lpromo_gen15_15.png",
        title: "¡Novedades en HabboSpeed! Mejoras visuales y Herramientas",
        summary: "Hemos actualizado nuestro fansite con un diseño más amigable para tus ojos y una nueva calculadora de tradeos.",
        content: "<p>¡Hola a todos los sintonizadores y visitantes de <strong>HabboSpeed</strong>!</p><p>Siguiendo las sugerencias de la comunidad, hemos realizado las siguientes mejoras:</p><ul><li><strong>Nuevo diseño 'Obsidiana Lapis':</strong> Hemos reemplazado los colores de alto contraste que lastimaban la vista por un diseño oscuro, relajante y moderno (colores pizarra, lavanda y turquesa) ideal para largas horas de navegación.</li><li><strong>Calculadora de Tradeos (Mercadillo):</strong> ¡Con la nueva actualización de la API de Habbo, añadimos una sección totalmente funcional en <em>Herramientas</em> para que calcules fácilmente los impuestos y ganancias en el mercadillo del hotel! Calcula la publicación y el 1% de manera precisa para que no pierdas ni un solo crédito.</li><li><strong>Chat en Vivo Optimizado:</strong> Ahora nuestro sistema de chat es más rápido y estable.</li></ul><p>¡Gracias por acompañarnos y sigan sintonizando nuestra radio en directo!</p>",
      })
      .where(eq(news.id, allNews[0].id));
    console.log(`Updated news article ${allNews[0].id}`);
  }

  // 2. Add Live Chat welcome message
  console.log("Adding staff welcome message to live chat...");
  
  // get max id to bypass sequence issue if any
  const maxChat = await db.select().from(chatMessages).orderBy(desc(chatMessages.id)).limit(1);
  const nextChatId = maxChat.length > 0 ? maxChat[0].id + 1 : 1;

  await db.insert(chatMessages).values({
    id: nextChatId,
    userId: null,
    userName: "HabboSpeed Staff",
    habboUsername: "Staff",
    message: "¡Hola bienvenido a HabboSpeed tu fansite favorita! Mejoramos para ti, revisa el articulo en noticias con todas las novedades.",
  });
  console.log("Chat message inserted.");

  console.log("Database update complete!");
  process.exit(0);
}

main().catch(err => {
  console.error("Error updating database:", err);
  process.exit(1);
});
