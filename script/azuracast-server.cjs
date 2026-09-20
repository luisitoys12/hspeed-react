const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8005;
const USER_MUSIC_DIR = 'C:\\Users\\LuisSandoval\\Music\\Qobuz';
const FALLBACK_MP3 = path.resolve(__dirname, 'sample-radio-track.mp3');

// 1. Escanear e indexar música real del usuario
function scanMusicLibrary(dir) {
  const list = [];
  if (!fs.existsSync(dir)) return list;

  function traverse(curr) {
    try {
      const items = fs.readdirSync(curr, { withFileTypes: true });
      for (const item of items) {
        const fullPath = path.join(curr, item.name);
        if (item.isDirectory()) {
          traverse(fullPath);
        } else if (item.isFile() && item.name.toLowerCase().endsWith('.mp3')) {
          const rawName = path.parse(item.name).name;
          const parts = rawName.split(' - ');
          const artist = parts.length > 1 ? parts[0].trim() : 'HabboSpeed Radio';
          const title = parts.length > 1 ? parts.slice(1).join(' - ').trim() : rawName;
          const album = path.basename(path.dirname(fullPath));
          const size = fs.statSync(fullPath).size;

          // Duración estimada para MP3 ~ 128-320kbps
          const estimatedDuration = Math.max(60, Math.min(600, Math.floor(size / (192 * 1024 / 8))));

          list.push({
            id: 'song_' + (list.length + 1),
            artist,
            title,
            album,
            fullPath,
            size,
            duration: estimatedDuration,
            art: 'https://images.habbo.com/c_images/album1584/ACH_VipClub' + ((list.length % 5) + 1) + '.gif'
          });
        }
      }
    } catch (err) {
      console.warn(`[AzuraCast] Aviso leyendo ${curr}:`, err.message);
    }
  }

  traverse(dir);
  return list;
}

let playlist = scanMusicLibrary(USER_MUSIC_DIR);

if (playlist.length === 0 && fs.existsSync(FALLBACK_MP3)) {
  console.log('[AzuraCast] No se encontró la carpeta Qobuz, usando track de muestra...');
  playlist.push({
    id: 'sample_1',
    artist: 'HabboSpeed Star',
    title: 'SoundHelix Live Stream',
    album: 'HabboSpeed Hits 2026',
    fullPath: FALLBACK_MP3,
    size: fs.statSync(FALLBACK_MP3).size,
    duration: 240,
    art: 'https://images.habbo.com/c_images/album1584/ADM.gif'
  });
}

// Mezclar aleatoriamente la lista de reproducción
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
shuffle(playlist);

console.log(`[AzuraCast] Total de canciones cargadas desde tu PC: ${playlist.length}`);

// 2. Estado en Vivo del Emisor
let currentIndex = 0;
let currentListeners = 145;
let songStartedAt = Math.floor(Date.now() / 1000);
const songHistory = [];

function getCurrentSong() {
  return playlist[currentIndex] || playlist[0];
}

function nextSong() {
  const prev = getCurrentSong();
  songHistory.unshift({
    sh_id: 2000 + songHistory.length,
    played_at: songStartedAt,
    duration: prev.duration,
    song: {
      title: prev.title,
      artist: prev.artist,
      album: prev.album,
      art: prev.art
    }
  });

  if (songHistory.length > 10) songHistory.pop();

  currentIndex = (currentIndex + 1) % playlist.length;
  songStartedAt = Math.floor(Date.now() / 1000);
  currentListeners = 135 + Math.floor(Math.random() * 25);

  const next = getCurrentSong();
  console.log(`[AzuraCast] 🎵 Sonando ahora: "${next.artist} - ${next.title}" (${currentListeners} oyentes en vivo)`);
  loadCurrentTrackBuffer();
}

// Cargar archivo actual en memoria para streaming fluido
let currentTrackBuffer = null;
let currentFileOffset = 0;

function loadCurrentTrackBuffer() {
  const song = getCurrentSong();
  try {
    currentTrackBuffer = fs.readFileSync(song.fullPath);
    currentFileOffset = 0;
    console.log(`[AzuraCast] Pista cargada: ${song.title} (${(currentTrackBuffer.length / 1024 / 1024).toFixed(2)} MB)`);
  } catch (err) {
    console.error(`[AzuraCast] Error leyendo archivo de música ${song.fullPath}:`, err.message);
    if (fs.existsSync(FALLBACK_MP3)) {
      currentTrackBuffer = fs.readFileSync(FALLBACK_MP3);
      currentFileOffset = 0;
    }
  }
}

loadCurrentTrackBuffer();

// 3. API NowPlaying en formato idéntico a AzuraCast
function getNowPlayingData() {
  const current = getCurrentSong();
  const nowSec = Math.floor(Date.now() / 1000);
  const elapsed = Math.max(0, nowSec - songStartedAt);
  const remaining = Math.max(0, current.duration - elapsed);

  return {
    station: {
      id: 1,
      name: "HabboSpeed Radio AzuraCast",
      shortcode: "habbospeed",
      description: "Transmitiendo tu colección local de Qobuz",
      listen_url: `http://127.0.0.1:${PORT}/listen/habboradio/radio.mp3`
    },
    listeners: {
      current: currentListeners,
      unique: currentListeners - 7,
      total: currentListeners
    },
    live: {
      is_live: true,
      streamer_name: "ser03z-51",
      broadcast_start: Math.floor(Date.now() / 1000) - 3600
    },
    now_playing: {
      elapsed: elapsed,
      remaining: remaining,
      duration: current.duration,
      song: {
        id: current.id,
        title: current.title,
        artist: current.artist,
        album: current.album,
        art: current.art,
        genre: "Pop / Hits / Latino"
      }
    },
    song_history: songHistory.length > 0 ? songHistory : [
      {
        sh_id: 1001,
        played_at: Math.floor(Date.now() / 1000) - 200,
        duration: 195,
        song: {
          title: "BOCA A BOCA",
          artist: "3am",
          album: "BOCA A BOCA (2026)",
          art: "https://images.habbo.com/c_images/album1584/ACH_VipClub1.gif"
        }
      },
      {
        sh_id: 1002,
        played_at: Math.floor(Date.now() / 1000) - 400,
        duration: 185,
        song: {
          title: "Así",
          artist: "Abraham Mateo",
          album: "Así (2026)",
          art: "https://images.habbo.com/c_images/album1584/ADM.gif"
        }
      }
    ],
    is_online: true
  };
}

// 4. Clientes de Streaming de Audio Conectados
const streamClients = new Set();
const CHUNK_SIZE = 16384; // 16 KB por segundo (~128 kbps)

setInterval(() => {
  if (!currentTrackBuffer || streamClients.size === 0) return;

  const nextOffset = currentFileOffset + CHUNK_SIZE;

  // Si la pista actual terminó, pasar a la siguiente
  if (nextOffset >= currentTrackBuffer.length) {
    const remainingPart = currentTrackBuffer.subarray(currentFileOffset);
    for (const client of streamClients) {
      try { client.write(remainingPart); } catch { streamClients.delete(client); }
    }
    nextSong();
    return;
  }

  const chunk = currentTrackBuffer.subarray(currentFileOffset, nextOffset);
  currentFileOffset = nextOffset;

  for (const client of streamClients) {
    try {
      client.write(chunk);
    } catch {
      streamClients.delete(client);
    }
  }
}, 1000);

// Rotar automáticamente si transcurre la duración de la canción
setInterval(() => {
  const current = getCurrentSong();
  const elapsed = Math.floor(Date.now() / 1000) - songStartedAt;
  if (elapsed >= current.duration) {
    nextSong();
  }
}, 5000);

const server = http.createServer((req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = req.url;

  // 1. AzuraCast NowPlaying Endpoints
  if (url === '/api/nowplaying' || url.startsWith('/api/nowplaying/') || url.includes('/nowplaying')) {
    const data = getNowPlayingData();
    const responsePayload = url === '/api/nowplaying' ? [data] : data;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(responsePayload));
    return;
  }

  // 2. Audio Streaming Endpoints (/listen/habboradio/radio.mp3, /radio.mp3, etc.)
  if (url.startsWith('/listen/') || url.endsWith('.mp3')) {
    console.log(`[AzuraCast] Sintonizador conectado desde: ${req.socket.remoteAddress}`);
    res.writeHead(200, {
      'Content-Type': 'audio/mpeg',
      'Transfer-Encoding': 'chunked',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache, no-store',
      'icy-name': 'HabboSpeed Radio Live (Tu Música)',
      'icy-genre': 'Pop / Hits / Qobuz Collection',
      'icy-br': '128'
    });

    // Enviar ráfaga inicial para inicio instantáneo
    if (currentTrackBuffer) {
      const burstSize = Math.min(65536, currentTrackBuffer.length);
      const start = Math.max(0, currentFileOffset - burstSize);
      res.write(currentTrackBuffer.subarray(start, currentFileOffset));
    }

    streamClients.add(res);

    req.on('close', () => {
      streamClients.delete(res);
      console.log(`[AzuraCast] Sintonizador desconectado. Oyentes conectados: ${streamClients.size}`);
    });
    return;
  }

  // Info general
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: 'AzuraCast Local Music Station Online',
    port: PORT,
    total_songs_indexed: playlist.length,
    current_song: getCurrentSong().title
  }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`📡 Servidor AzuraCast Conectado a tu Música de Qobuz`);
  console.log(`   - Canciones indexadas: ${playlist.length}`);
  console.log(`   - API NowPlaying: http://127.0.0.1:${PORT}/api/nowplaying/1`);
  console.log(`   - Audio Streaming: http://127.0.0.1:${PORT}/listen/habboradio/radio.mp3`);
  console.log(`====================================================`);
});
