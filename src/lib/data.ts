// In a real application, this data would come from the Habbo API.
// We are simulating the API responses here.
import { db } from './firebase';
import { ref, get, query, orderByChild, equalTo } from 'firebase/database';
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
            name: 'Habbospeed',
            motto: 'Error al cargar el equipo',
            roles: ['Fansite'],
            avatarUrl: `https://www.habbo.es/habbo-imaging/avatarimage?user=estacionkusfm&direction=2&head_direction=3&size=l`,
            online: true,
        }];
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
