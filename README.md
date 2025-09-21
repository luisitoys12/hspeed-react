# Ekus FM - Sitio de Fans de Habbo

Bienvenido al repositorio oficial de **Ekus FM**, una moderna aplicación web para la fansite de radio de Habbo.es. Este proyecto está construido con un enfoque *headless* y en tiempo real, utilizando **Next.js** para el frontend y **Firebase** como el backend principal para la gestión de contenido, autenticación y datos dinámicos.

## ✨ Descripción General

Ekus FM no es solo un sitio web, sino una plataforma dinámica donde los administradores pueden gestionar el contenido en vivo sin necesidad de editar código. Desde las noticias y los horarios de los DJs hasta las salas destacadas y las alianzas, todo se controla desde un panel de administración centralizado que se comunica directamente con **Firebase Realtime Database**.

### Stack Tecnológico

- **Framework:** Next.js (con App Router y Server Components)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS y ShadCN/UI para componentes.
- **Backend y Base de Datos:** Firebase (Realtime Database, Authentication).
- **Inteligencia Artificial:** Google AI (Gemini) a través de Genkit para funcionalidades como la validación de peticiones de canciones.
- **Alojamiento:** Netlify

---

## 🔥 Funcionalidades Implementadas

La plataforma ya cuenta con un robusto conjunto de características gestionadas casi en su totalidad a través de Firebase:

- **Gestión de Contenido Dinámico:**
  - **Carrusel Principal:** Administra las diapositivas de la página de inicio desde la base de datos.
  - **Noticias y Guías:** Un completo CRUD para crear, editar y eliminar artículos que se muestran en el sitio.
  - **Horarios de Radio:** Gestiona la programación semanal de los DJs.
  - **Equipo de la Fansite:** Añade y elimina miembros del equipo.
  - **Alianzas Oficiales y Salas Destacadas:** Controla qué salas y fansites aliadas se muestran en la página principal.

- **Panel de Administración (`/panel`):**
  - **Acceso Restringido:** Solo los usuarios con UID de administrador pueden acceder.
  - **Control Centralizado:** Puntos de entrada para gestionar noticias, horarios, equipo y configuración general del sitio.

- **Interactividad para Usuarios:**
  - **Autenticación de Usuarios:** Sistema de registro e inicio de sesión con Firebase Auth.
  - **Sistema de Comentarios:** Los usuarios registrados pueden comentar en las noticias, mostrando su avatar de Habbo.
  - **Reserva de Horarios para DJs:** Una parrilla interactiva donde los DJs pueden reservar sus turnos, con un sistema de borrado semanal para administradores.

- **Integración con IA (Genkit):**
  - **Validación de Peticiones de Canciones:** Una IA analiza las peticiones de los usuarios para asegurar que sean apropiadas para la radio.

---

## 🚀 Próximas Actualizaciones (Hoja de Ruta)

El proyecto está en constante evolución. Estas son algunas de las ideas y funcionalidades planeadas para el futuro:

- **Perfiles de Usuario Públicos:**
  - Cada usuario registrado tendrá una página de perfil personal.
  - Mostrará su avatar de Habbo, placas, logros y comentarios realizados en el sitio.

- **Gamificación y Logros Internos:**
  - Sistema de puntos y logros por participar en el sitio (comentar, escuchar, etc.).
  - Un ranking de usuarios basado en su actividad en Ekus FM.

- **Mejoras en el Panel de Administración:**
  - Un dashboard con estadísticas básicas (ej. número de comentarios, usuarios registrados).
  - Un editor de texto enriquecido (WYSIWYG) para la creación de noticias.

- **Integración Social Más Profunda:**
  - Notificaciones en tiempo real (ej. cuando un DJ inicia una transmisión).
  - Posibilidad de reaccionar a las noticias y comentarios.

---

## 🛠️ Cómo Empezar (Para Desarrolladores)

Si quieres contribuir o ejecutar el proyecto en tu máquina local, sigue estos pasos:

1.  **Clona el Repositorio:**
    ```bash
    git clone https://github.com/luisitoys12/hspeed-react.git
    cd hspeed-react
    ```

2.  **Instala las Dependencias:**
    ```bash
    npm install
    ```

3.  **Configura las Variables de Entorno:**
    - Crea un archivo `.env` en la raíz del proyecto.
    - Configura tu proyecto de Firebase y añade las credenciales al archivo `src/lib/firebase.ts`.
    - Añade tu clave de API de Google AI al archivo `.env`:
      ```
      GEMINI_API_KEY="TU_API_KEY_AQUI"
      ```

4.  **Importa la Estructura de Datos a Firebase:**
    - Ve a tu Realtime Database en la consola de Firebase.
    - Importa el archivo `firebase-rtdb-structure.json` para tener todos los nodos y datos de ejemplo necesarios.

5.  **Ejecuta el Servidor de Desarrollo:**
    ```bash
    npm run dev
    ```
    La aplicación estará disponible en `http://localhost:9002`.

¡Gracias por tu interés en Ekus FM!
