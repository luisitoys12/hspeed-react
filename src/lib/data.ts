// In a real application, this data would come from the Habbo API.
// We are simulating the API responses here.
import { db } from './firebase';
import { ref, get } from 'firebase/database';
import { NewsArticle } from './types';


export async function getTeamMembers() {
    try {
        const teamRef = ref(db, 'team');
        const snapshot = await get(teamRef);
        
        if (!snapshot.exists()) {
            console.log("No team members found in Firebase.");
            return [];
        }

        const teamData = snapshot.val();
        const teamConfig = Object.keys(teamData).map(name => ({
            name: name,
            roles: teamData[name].roles || ['Miembro'],
        }));

        const memberPromises = teamConfig.map(async (memberConfig) => {
            try {
                // Using a short revalidation time to keep online status somewhat fresh
                const response = await fetch(`https://www.habbo.es/api/public/users?name=${memberConfig.name}`, { next: { revalidate: 300 } });
                if (!response.ok) {
                    return {
                        name: memberConfig.name,
                        motto: 'Lema no disponible',
                        roles: memberConfig.roles,
                        avatarUrl: `https://www.habbo.es/habbo-imaging/avatarimage?user=${memberConfig.name}&direction=2&head_direction=3&size=l`,
                        online: false,
                    };
                }
                const data = await response.json();
                return {
                    name: data.name,
                    motto: data.motto,
                    roles: memberConfig.roles,
                    avatarUrl: `https://www.habbo.es/habbo-imaging/avatarimage?user=${data.name}&direction=2&head_direction=3&size=l`,
                    online: data.online,
                };
            } catch (apiError) {
                console.error(`Failed to fetch Habbo data for ${memberConfig.name}:`, apiError);
                return {
                    name: memberConfig.name,
                    motto: 'Error al cargar desde API',
                    roles: memberConfig.roles,
                    avatarUrl: `https://www.habbo.es/habbo-imaging/avatarimage?user=${memberConfig.name}&direction=2&head_direction=3&size=l`,
                    online: false,
                };
            }
        });

        const members = await Promise.all(memberPromises);
        return members;
    } catch (error) {
        console.error("Failed to fetch team members from Firebase:", error);
        // Return a default member to avoid empty team page on DB error
        return [{
            name: 'Ekus FM',
            motto: 'Error al cargar el equipo',
            roles: ['Fansite'],
            avatarUrl: `https://www.habbo.es/habbo-imaging/avatarimage?user=estacionkusfm&direction=2&head_direction=3&size=l`,
            online: true,
        }];
    }
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

export async function getNewsArticles(): Promise<NewsArticle[]> {
    try {
        const newsRef = ref(db, 'news');
        const snapshot = await get(newsRef);
        
        if (!snapshot.exists()) {
            console.log("No news articles found in Firebase.");
            return [];
        }

        const newsData = snapshot.val();
        const articlesArray = Object.keys(newsData).map(key => ({
            id: key,
            ...newsData[key]
        }));
        
        // Sort by date descending
        return articlesArray.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    } catch (error) {
        console.error("Failed to fetch news from Firebase:", error);
        return [];
    }
}

export async function getLeaderboardData() {
  try {
    const teamRef = ref(db, 'team');
    const snapshot = await get(teamRef);

    if (!snapshot.exists()) return [];

    const teamData = snapshot.val();
    const usersToFetch = Object.keys(teamData);

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

    const users = (await Promise.all(userPromises)).filter((user): user is { name: string; achievementScore: number } => user !== null && typeof user.achievementScore === 'number');
    
    // Sort users by achievement score in descending order
    return users.sort((a, b) => b.achievementScore - a.achievementScore);
  } catch (dbError) {
      console.error("Failed to fetch team for leaderboard:", dbError);
      return [];
  }
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
