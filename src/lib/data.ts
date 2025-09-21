
// In a real application, this data would come from the Habbo API.
// We are simulating the API responses here.

export const djInfo = {
    name: 'hspeed',
    habboName: 'hspeed',
    avatarUrl: 'https://www.habbo.es/habbo-imaging/avatarimage?user=hspeed&action=std&direction=2&head_direction=2&gesture=sml&size=l&headonly=1',
    roles: ['AutoDJ'],
};

export async function getTeamMembers() {
    return Promise.resolve([
        { 
            name: 'PixelMaster', 
            motto: 'Construyendo mundos, un bloque a la vez.', 
            roles: ['Head DJ', 'Manager de Eventos'],
            avatarUrl: 'https://www.habbo.es/habbo-imaging/avatarimage?user=PixelMaster&action=wav&direction=2&head_direction=3&gesture=sml&size=l&headonly=1'
        },
        { 
            name: 'DJ Glitch', 
            motto: 'Viviendo en el código, mezclando en las ondas.', 
            roles: ['DJ Residente', 'Técnico'],
            avatarUrl: 'https://www.habbo.es/habbo-imaging/avatarimage?user=DJ-Glitch&action=drk&direction=4&head_direction=2&gesture=sml&size=l&headonly=1'
        },
        { 
            name: 'MC Flow', 
            motto: 'Rimas y ritmos para el alma.', 
            roles: ['Anfitrión', 'Relaciones Públicas'],
            avatarUrl: 'https://www.habbo.es/habbo-imaging/avatarimage?user=MC-Flow&action=std&direction=3&head_direction=3&gesture=nrm&size=l&headonly=1'
        },
    ]);
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
    // In a real app, you would fetch this from:
    // `https://www.habbo.es/api/public/users?name=${username}`
    // And then other endpoints for badges, rooms, etc.
    return Promise.resolve({
        name: username,
        motto: 'Tu radio, tu comunidad.',
        registrationDate: '2024-01-01',
        rewards: 42,
        badges: [
            { id: '1', name: 'Placa Halloween 2024', imageUrl: 'https://picsum.photos/seed/badge1/50/50', imageHint: 'calabaza halloween' },
            { id: '2', name: 'Placa Radio Fan', imageUrl: 'https://picsum.photos/seed/badge2/50/50', imageHint: 'auriculares icono' },
            { id: '3', name: 'Placa Veterano', imageUrl: 'https://picsum.photos/seed/badge3/50/50', imageHint: 'medalla icono' },
            { id: '4', name: 'Placa Gamer', imageUrl: 'https://picsum.photos/seed/badge4/50/50', imageHint: 'joystick icono' },
            { id: '5', name: 'Placa Social', imageUrl: 'https://picsum.photos/seed/badge5/50/50', imageHint: 'burbuja de chat' },
        ],
        rooms: [
            { id: '1', name: 'Estudio Principal Ekus FM', imageUrl: 'https://picsum.photos/seed/room1/200/150', imageHint: 'estudio de radio' },
            { id: '2', name: 'Salón de Fiestas Halloween', imageUrl: 'https://picsum.photos/seed/room2/200/150', imageHint: 'fiesta de halloween' },
            { id: '3', name: 'Jardín Embrujado', imageUrl: 'https://picsum.photos/seed/room3/200/150', imageHint: 'jardín embrujado' },
        ],
    });
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
