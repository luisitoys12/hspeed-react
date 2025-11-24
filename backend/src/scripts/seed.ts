import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import News from '../models/News';
import Schedule from '../models/Schedule';
import Event from '../models/Event';
import Config from '../models/Config';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hspeed');
    console.log('MongoDB Connected for seeding...');

    await User.deleteMany({});
    await News.deleteMany({});
    await Schedule.deleteMany({});
    await Event.deleteMany({});
    await Config.deleteMany({});

    const adminUser = await User.create({
      email: 'admin@hspeed.com',
      password: 'admin123',
      displayName: 'Admin',
      role: 'Admin',
      approved: true,
      speedPoints: 1000
    });

    const djUser = await User.create({
      email: 'dj@hspeed.com',
      password: 'dj123456',
      displayName: 'DJ-Pixel',
      role: 'DJ',
      approved: true,
      speedPoints: 500
    });

    console.log('✅ Users created');

    await News.create([
      {
        title: '¡Sol, Arena y Pixeles! Llega el Evento de Verano',
        summary: 'Descubre los nuevos furnis de verano y participa en los eventos playeros para ganar premios.',
        content: '¡El verano ha llegado a Habbo y con él una nueva oleada de furnis playeros! No te pierdas la nueva colección que incluye desde tablas de surf hasta castillos de arena. Además, cada día habrá juegos y eventos especiales en la playa del hotel. ¡Participa para ganar placas exclusivas!',
        imageUrl: 'https://picsum.photos/seed/summerhabbo/600/400',
        imageHint: 'habbo beach',
        category: 'EVENTO',
        date: '2024-07-15',
        reactions: new Map([['❤️', 10], ['🎉', 5]])
      },
      {
        title: 'Arranca la Copa Habbospeed con Partidos de Infarto',
        summary: 'Resumen de la primera jornada: sorpresas, goles y mucho fútbol.',
        content: 'La primera jornada de la Copa Habbospeed estuvo llena de sorpresas. El equipo "Los Furas" demostró su poderío ofensivo, mientras que "Defensores" se mantiene como el equipo a vencer. ¡No te pierdas el resumen de los partidos!',
        imageUrl: 'https://picsum.photos/seed/copajornada1/600/400',
        imageHint: 'soccer field',
        category: 'COPA',
        date: '2024-11-05'
      }
    ]);

    console.log('✅ News created');

    await Schedule.create([
      {
        day: 'Lunes',
        startTime: '14:00',
        endTime: '16:00',
        show: 'Tardes de Pop',
        dj: 'DJ-Pixel'
      },
      {
        day: 'Martes',
        startTime: '18:00',
        endTime: '20:00',
        show: 'Noches Electrónicas',
        dj: 'DJ-Frank'
      },
      {
        day: 'Miércoles',
        startTime: '15:00',
        endTime: '17:00',
        show: 'Reggaeton Mix',
        dj: 'DJ-Maria'
      }
    ]);

    console.log('✅ Schedule created');

    await Event.create([
      {
        title: 'BANZAI RACING',
        server: 'Habbo (ES)',
        date: '2025-09-21',
        time: '16:00',
        roomName: 'Banzai Racing R🌩️ [💜] HABBOTICOS',
        roomOwner: 'JayAngel',
        host: 'Habboticos',
        imageUrl: 'https://picsum.photos/seed/banzairacing/600/400',
        imageHint: 'racing game'
      },
      {
        title: 'Fiesta de Verano',
        server: 'Habbo (ES)',
        date: '2025-08-15',
        time: '20:00',
        roomName: 'Playa Habbospeed',
        roomOwner: 'estacionkusfm',
        host: 'Habbospeed Team',
        imageUrl: 'https://picsum.photos/seed/summerparty/600/400',
        imageHint: 'beach party'
      }
    ]);

    console.log('✅ Events created');

    await Config.create({
      radioService: 'azuracast',
      apiUrl: 'https://radio.kusmedios.lat/api/nowplaying/ekus-fm',
      listenUrl: 'http://radio.kusmedios.lat/listen/ekus-fm/radio.mp3',
      slideshow: [
        {
          title: '¡Bienvenidos a Ekus FM!',
          subtitle: 'La radio #1 para la comunidad de Habbo.es. Música, eventos y diversión 24/7.',
          imageUrl: 'https://picsum.photos/seed/habboparty/1200/400',
          imageHint: 'habbo party',
          cta: {
            text: 'Ver Horarios',
            href: '/schedule'
          }
        }
      ]
    });

    console.log('✅ Config created');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📝 Login credentials:');
    console.log('Admin: admin@hspeed.com / admin123');
    console.log('DJ: dj@hspeed.com / dj123456');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
