// In a real application, this data would come from the Habbo API.
// We are simulating the API responses here.

type HabboUser = {
    name: string;
    motto: string;
    online: boolean;
    // ... and other fields from the API
};

export const djInfo = {
    name: 'hspeed',
    habboName: 'hspeed',
    avatarUrl: 'https://www.habbo.es/habbo-imaging/avatarimage?user=hspeed&action=std&direction=2&head_direction=2&gesture=sml&size=l&headonly=1',
    roles: ['AutoDJ'],
};

const teamConfig = [
    { name: 'magnituder', roles: ['Administrador'] },
    { name: 'ser03z-51', roles: ['Coordinador'] },
    { name: 'djluisalegre', roles: ['Coordinador'] },
];

export async function getTeamMembers() {
    try {
        const memberPromises = teamConfig.map(async (memberConfig) => {
            const response = await fetch(`https://www.habbo.es/api/public/users?name=${memberConfig.name}`, { next: { revalidate: 300 } });
            if (!response.ok) {
                // Return a default state if the user is not found or API fails
                return {
                    name: memberConfig.name,
                    motto: 'Lema no disponible',
                    roles: memberConfig.roles,
                    avatarUrl: `https://www.habbo.es/habbo-imaging/avatarimage?user=${memberConfig.name}&direction=2&head_direction=3&size=l&headonly=1`,
                    online: false,
                };
            }
            const data = await response.json();
            return {
                name: data.name,
                motto: data.motto,
                roles: memberConfig.roles,
                avatarUrl: `https://www.habbo.es/habbo-imaging/avatarimage?user=${data.name}&direction=2&head_direction=3&size=l&headonly=1`,
                online: data.online,
            };
        });
        const members = await Promise.all(memberPromises);
        return members;
    } catch (error) {
        console.error("Failed to fetch team members from Habbo API:", error);
        // Return static data as a fallback
        return teamConfig.map(m => ({
             name: m.name,
             motto: 'Error al cargar',
             roles: m.roles,
             avatarUrl: `https://www.habbo.es/habbo-imaging/avatarimage?user=${m.name}&direction=2&head_direction=3&size=l&headonly=1`,
             online: false,
        }));
    }
}

export async function getSchedule() {
    return Promise.resolve([
        { day: 'Lunes', time: '18:00 - 20:00', show: 'Fiesta Pixel Pop', dj: 'PixelMaster' },
        { day: 'Martes', time: '20:00 - 22:00', show: 'Retro Rewind', dj: 'DJ Glitch' },
        { day: 'Miércoles', time: '19:00 - 21:00', show: 'Miércoles de Onda', dj: 'MC Flow' },
        { day: 'Jueves', time: '21:00 - 23:00', show: 'Jueves de Recuerdo', dj: 'PixelMaster' },
        { day: 'Viernes', time: '20:00 - 00:00', show: 'Fusión de Viernes por la Noche', dj: 'Todos los DJs' },
        { day: 'Sábado', time: '16:00 - 18:00', show: 'El Top 20 de Habbo', dj: 'DJ Glitch' },
        { day: 'Domingo', time: '14:00 - 16:00', show: 'Sesión de Chillout', dj: 'MC Flow' },
    ]);
}

export async function getHabboProfileData(username: string) {
    try {
        const userResponse = await fetch(`https://www.habbo.es/api/public/users?name=${username}`);
        if (!userResponse.ok) {
            const errorData = await userResponse.json().catch(() => null);
            const errorMessage = errorData?.error ? `Usuario no encontrado: ${errorData.error}` : 'Usuario no encontrado o la API no está disponible.';
            return { error: errorMessage };
        }
        const userData = await userResponse.json();

        const profileResponse = await fetch(`https://www.habbo.es/api/public/users/${userData.uniqueId}/profile`);
         if (!profileResponse.ok) {
            return { error: 'No se pudo cargar el perfil de este usuario.' };
        }
        const profileData = await profileResponse.json();

        return {
            name: userData.name,
            motto: userData.motto,
            registrationDate: userData.memberSince,
            rewards: profileData.achievementScore,
            badges: profileData.badges.slice(0, 5).map((badge: any) => ({
                id: badge.code,
                name: badge.name,
                imageUrl: `https://images.habbo.com/c_images/album1584/${badge.code}.gif`,
                imageHint: 'habbo badge', 
            })),
            rooms: profileData.rooms.slice(0, 3).map((room: any) => ({
                id: room.id,
                name: room.name,
                imageUrl: `https://www.habbo.com/habbo-imaging/room/${room.id}/thumbnail.png`,
                imageHint: 'habbo room',
            })),
            error: null,
        };

    } catch (error) {
        console.error("Failed to fetch Habbo profile data:", error);
        return { error: 'Ocurrió un error inesperado al buscar el perfil.' };
    }
}

export async function getActiveRooms() {
    const username = 'estacionkusfm';
    try {
        const userResponse = await fetch(`https://www.habbo.es/api/public/users?name=${username}`, { next: { revalidate: 600 } });
        if (!userResponse.ok) {
            throw new Error('User not found');
        }
        const userData = await userResponse.json();

        const profileResponse = await fetch(`https://www.habbo.es/api/public/users/${userData.uniqueId}/profile`, { next: { revalidate: 600 } });
        if (!profileResponse.ok) {
            throw new Error('Profile not found');
        }
        const profileData = await profileResponse.json();

        return profileData.rooms.slice(0, 3).map((room: any) => ({
            id: room.id,
            name: room.name,
            owner: username,
            imageUrl: `https://www.habbo.com/habbo-imaging/room/${room.id}/thumbnail.png`,
        }));
    } catch (error) {
        console.error("Failed to fetch active rooms:", error);
        return [];
    }
}


export async function getNewsArticles() {
    // In a real app, you would fetch this from Habbo's news API or RSS feed.
    return Promise.resolve([
        {
            id: '1',
            title: '¡Nueva línea de furnis "Cyberpunk" lanzada!',
            summary: 'Una nueva línea de furnis futuristas ha llegado al catálogo. ¡Consigue ya estos artículos bañados en neón!',
            imageUrl: 'https://picsum.photos/seed/news1/600/400',
            imageHint: 'cyberpunk city',
            category: 'FURNI',
            date: '2024-07-20',
        },
        {
            id: '2',
            title: 'Guía: Dominando el juego "Wobble Squabble"',
            summary: '¿Te cuesta conseguir la máxima puntuación? Nuestra completa guía desglosa las mejores estrategias para convertirte en un campeón.',
            imageUrl: 'https://picsum.photos/seed/news2/600/400',
            imageHint: 'game strategy',
            category: 'GUÍA',
            date: '2024-07-18',
        },
        {
            id: '3',
            title: 'Foco en la comunidad: El arte de construir salas',
            summary: 'Entrevistamos a tres de los constructores de salas más talentosos de la comunidad para que nos den sus consejos.',
            imageUrl: 'https://picsum.photos/seed/news3/600/400',
            imageHint: 'interior design',
            category: 'COMUNIDAD',
            date: '2024-07-15',
        },
        {
            id: '4',
            title: 'Análisis: La economía de Habbo en 2024',
            summary: 'Una mirada en profundidad al estado actual del mercado de Habbo, las tendencias de tradeo y el valor de los raros.',
            imageUrl: 'https://picsum.photos/seed/news4/600/400',
            imageHint: 'stock market',
            category: 'ANÁLISIS',
            date: '2024-07-12',
        }
    ]);
}

export async function getLeaderboardData() {
  const usersToFetch = teamConfig.map(member => member.name);
  
  const userPromises = usersToFetch.map(async (name) => {
    try {
      const userResponse = await fetch(`https://www.habbo.es/api/public/users?name=${name}`);
      if (!userResponse.ok) return null;
      const userData = await userResponse.json();
      
      const profileResponse = await fetch(`https://www.habbo.es/api/public/users/${userData.uniqueId}/profile`);
      if (!profileResponse.ok) return null;
      const profileData = await profileResponse.json();

      return {
        name: userData.name,
        achievementScore: profileData.achievementScore,
      };
    } catch (error) {
      console.error(`Failed to fetch leaderboard data for ${name}:`, error);
      return null;
    }
  });

  const users = (await Promise.all(userPromises)).filter(user => user && typeof user.achievementScore === 'number');
  
  // Sort users by achievement score in descending order
  // @ts-ignore
  return users.sort((a, b) => b.achievementScore - a.achievementScore);
}

export async function getMarketplaceMockData() {
  return Promise.resolve({
    popularItems: [
      { id: '1', name: 'Trono de Dragón', category: 'Raro', imageUrl: 'https://images.habbo.com/dcr/hof_furni/throne/throne.gif' },
      { id: '2', name: 'Sofá HC', category: 'HC', imageUrl: 'https://files.habboemotion.com/resources/images/furni/club_sofa.gif' },
      { id: '3', name: 'Ventilador Ocre', category: 'Raro', imageUrl: 'https://habbo.es/images/catalogue/icon_38.png' },
      { id: '4', name: 'Heladera Roja', category: 'Raro', imageUrl: 'https://habbo.es/images/catalogue/icon_14.png' },
      { id: '5', name: 'Almohadón', category: 'Común', imageUrl: 'https://images.habbo.com/c_images/catalogue/nets_petpillow_blu.gif'},
      { id: '6', name: 'Pato de Goma', category: 'Común', imageUrl: 'https://images.habbo.com/c_images/catalogue/nets_duck.gif' },
      { id: '7', name: 'Planta Monstruosa', category: 'Evento', imageUrl: 'https://images.habbo.com/c_images/catalogue/rare_monsterplant.gif' },
      { id: '8', name: 'Lámpara de Ámbar', category: 'Raro', imageUrl: 'https://habbo.es/images/catalogue/icon_31.png' },
    ],
    priceTrends: [
        { name: 'Créditos', price: '1.00 €', change: '+0.0%', imageUrl: 'https://images.habbo.com/c_images/catalogue/icon_7.png'},
        { name: 'Lingote de Oro', price: '50c', change: '+1.2%', imageUrl: 'https://images.habbo.com/c_images/catalogue/icon_121.png'},
        { name: 'Saco de Monedas', price: '20c', change: '-0.5%', imageUrl: 'https://images.habbo.com/c_images/catalogue/nets_purse.gif'},
    ],
  });
}
