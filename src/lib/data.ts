import type { LucideIcon } from 'lucide-react';

export const djInfo = {
    name: 'DJ-Pixel',
    habboName: 'PixelMaster',
    avatarUrl: 'https://www.habbo.com/habbo-imaging/avatarimage?user=PixelMaster&action=std&direction=2&head_direction=2&gesture=sml&size=l',
    roles: ['Head DJ', 'Event Manager'],
};

export const schedule = [
    { day: 'Monday', time: '18:00 - 20:00', show: 'Pixel Pop Party', dj: 'DJ-Pixel' },
    { day: 'Tuesday', time: '20:00 - 22:00', show: 'Retro Rewind', dj: 'DJ Glitch' },
    { day: 'Wednesday', time: '19:00 - 21:00', show: 'Wavey Wednesday', dj: 'MC Flow' },
    { day: 'Thursday', time: '21:00 - 23:00', show: 'Throwback Thursday', dj: 'DJ-Pixel' },
    { day: 'Friday', time: '20:00 - 00:00', show: 'Friday Night Fuse', dj: 'All Stars' },
    { day: 'Saturday', time: '16:00 - 18:00', show: 'The Habbo Hot 20', dj: 'DJ Glitch' },
    { day: 'Sunday', time: '14:00 - 16:00', show: 'Chillout Session', dj: 'MC Flow' },
];

export const habboProfile = {
    name: 'PixelMaster',
    motto: 'Building worlds, one block at a time.',
    registrationDate: '2010-01-15',
    rewards: 125,
    badges: [
        { id: '1', name: 'Hotel Veteran', imageUrl: 'https://picsum.photos/seed/badge1/50/50', imageHint: 'medal icon' },
        { id: '2', name: 'Room Builder', imageUrl: 'https://picsum.photos/seed/badge2/50/50', imageHint: 'hammer icon' },
        { id: '3', name: 'Top Trader', imageUrl: 'https://picsum.photos/seed/badge3/50/50', imageHint: 'coin icon' },
        { id: '4', name: 'Game Master', imageUrl: 'https://picsum.photos/seed/badge4/50/50', imageHint: 'joystick icon' },
        { id: '5', name: 'Social Butterfly', imageUrl: 'https://picsum.photos/seed/badge5/50/50', imageHint: 'butterfly icon' },
    ],
    rooms: [
        { id: '1', name: 'Pixel Palace', imageUrl: 'https://picsum.photos/seed/room1/200/150', imageHint: 'castle interior' },
        { id: '2', name: 'Neon Arcade', imageUrl: 'https://picsum.photos/seed/room2/200/150', imageHint: 'arcade room' },
        { id: '3', name: 'Zen Garden', imageUrl: 'https://picsum.photos/seed/room3/200/150', imageHint: 'zen garden' },
    ],
};

export const newsArticles = [
    {
        id: '1',
        title: 'New "Cyberpunk" Furni Line Released!',
        summary: 'A brand new line of futuristic furni has dropped in the catalog. Get your hands on these neon-drenched items now!',
        imageUrl: 'https://picsum.photos/seed/news1/600/400',
        imageHint: 'cyberpunk city',
        category: 'FURNI',
        date: '2024-07-20',
    },
    {
        id: '2',
        title: 'Guide: Mastering the "Wobble Squabble" Game',
        summary: 'Struggling to get that top score? Our comprehensive guide breaks down the best strategies to become a Wobble Squabble champion.',
        imageUrl: 'https://picsum.photos/seed/news2/600/400',
        imageHint: 'game strategy',
        category: 'GUIDE',
        date: '2024-07-18',
    },
    {
        id: '3',
        title: 'Community Spotlight: The Art of Room Building',
        summary: 'We interviewed three of the most talented room builders in the community to get their tips on creating stunning spaces.',
        imageUrl: 'https://picsum.photos/seed/news3/600/400',
        imageHint: 'interior design',
        category: 'COMMUNITY',
        date: '2024-07-15',
    },
    {
        id: '4',
        title: 'Analysis: The Habbo Economy in 2024',
        summary: 'An in-depth look at the current state of the Habbo marketplace, trading trends, and the value of rare items.',
        imageUrl: 'https://picsum.photos/seed/news4/600/400',
        imageHint: 'stock market',
        category: 'ANALYSIS',
        date: '2024-07-12',
    }
];
