const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8005;
const USER_MUSIC_DIR = 'C:\\Users\\LuisSandoval\\Music\\Qobuz';
const FALLBACK_MP3 = path.resolve(__dirname, 'sample-radio-track.mp3');

// 1. Indexar biblioteca de música
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
          const estimatedDuration = Math.max(60, Math.min(600, Math.floor(size / (320 * 1024 / 8))));

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

// Mezclar canciones
for (let i = playlist.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [playlist[i], playlist[j]] = [playlist[j], playlist[i]];
}

console.log(`[AzuraCast] Total de canciones cargadas desde tu PC: ${playlist.length}`);

// 2. Estado Global de Emisión
let globalSongIndex = 0;
let songStartedAt = Math.floor(Date.now() / 1000);
let currentListeners = 145;
const songHistory = [];

// Cache de buffers de audio en memoria (cargar bajo demanda)
const bufferCache = new Map();
function getSongBuffer(song) {
  if (bufferCache.has(song.fullPath)) {
    return bufferCache.get(song.fullPath);
  }
  try {
    const buf = fs.readFileSync(song.fullPath);
    // Limitar cache a 10 archivos para no saturar memoria
    if (bufferCache.size > 10) {
      const firstKey = bufferCache.keys().next().value;
      bufferCache.delete(firstKey);
    }
    bufferCache.set(song.fullPath, buf);
    return buf;
  } catch (err) {
    console.error(`[AzuraCast] Error leyendo canción ${song.fullPath}:`, err.message);
    return null;
  }
}

function getCurrentSong() {
  return playlist[globalSongIndex] || playlist[0];
}

function advanceGlobalSong() {
  const prev = getCurrentSong();
  songHistory.unshift({
    sh_id: 3000 + songHistory.length,
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

  globalSongIndex = (globalSongIndex + 1) % playlist.length;
  songStartedAt = Math.floor(Date.now() / 1000);
  currentListeners = 140 + Math.floor(Math.random() * 20);

  const next = getCurrentSong();
  console.log(`[AzuraCast] 🎵 Emisión en curso: "${next.artist} - ${next.title}" (${currentListeners} oyentes)`);
}

// Rotación global según duración
setInterval(() => {
  const cur = getCurrentSong();
  const elapsed = Math.floor(Date.now() / 1000) - songStartedAt;
  if (elapsed >= cur.duration) {
    advanceGlobalSong();
  }
}, 5000);

// 3. API NowPlaying estándar AzuraCast
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
      listen_url: "https://relation-roots-jim-empirical.trycloudflare.com/listen/habboradio/radio.mp3"
    },
    listeners: {
      current: currentListeners,
      unique: currentListeners - 6,
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
    song_history: songHistory,
    is_online: true
  };
}

// 4. Clientes de Streaming de Audio Conectados (Flujo Contiguo Garantizado)
const activeClients = new Map(); // res -> { songIndex, offset }

// Pump: cada 250ms enviamos 10 KB por cliente (40 KB/s = 320 kbps reales sin cortes)
const CHUNK_SIZE = 10240;

setInterval(() => {
  if (activeClients.size === 0) return;

  for (const [res, state] of activeClients.entries()) {
    try {
      const song = playlist[state.songIndex] || getCurrentSong();
      const buf = getSongBuffer(song);

      if (!buf) {
        state.songIndex = (state.songIndex + 1) % playlist.length;
        state.offset = 0;
        continue;
      }

      const nextOffset = state.offset + CHUNK_SIZE;

      if (nextOffset >= buf.length) {
        // Enviar resto de la canción
        if (state.offset < buf.length) {
          res.write(buf.subarray(state.offset));
        }
        // Pasar inmediatamente al inicio de la siguiente canción
        state.songIndex = (state.songIndex + 1) % playlist.length;
        state.offset = 0;
      } else {
        res.write(buf.subarray(state.offset, nextOffset));
        state.offset = nextOffset;
      }
    } catch {
      activeClients.delete(res);
    }
  }
}, 250);

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

  const url = req.url.split('?')[0];

  // 1. AzuraCast NowPlaying Endpoints
  if (url === '/api/nowplaying' || url.startsWith('/api/nowplaying/') || url.includes('/nowplaying')) {
    const data = getNowPlayingData();
    const responsePayload = url === '/api/nowplaying' ? [data] : data;
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.end(JSON.stringify(responsePayload));
    return;
  }

  // 2. Audio Streaming Endpoint
  if (url.startsWith('/listen/') || url.endsWith('.mp3')) {
    console.log(`[AzuraCast] Nuevo oyente conectado desde ${req.socket.remoteAddress}`);
    res.writeHead(200, {
      'Content-Type': 'audio/mpeg',
      'Transfer-Encoding': 'chunked',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'icy-name': 'HabboSpeed Radio Live (Tu Música)',
      'icy-genre': 'Pop / Hits / Latino',
      'icy-br': '320'
    });

    const currentSong = getCurrentSong();
    const buf = getSongBuffer(currentSong);

    // Enviar ráfaga inicial de 64 KB desde el byte 0 (incluye ID3 y encabezado MPEG limpio)
    let initialOffset = 0;
    if (buf) {
      const burstSize = Math.min(65536, buf.length);
      res.write(buf.subarray(0, burstSize));
      initialOffset = burstSize;
    }

    activeClients.set(res, { songIndex: globalSongIndex, offset: initialOffset });

    req.on('close', () => {
      activeClients.delete(res);
      console.log(`[AzuraCast] Oyente desconectado. Conectados activos: ${activeClients.size}`);
    });
    return;
  }

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'AzuraCast Online', port: PORT }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`📡 Servidor AzuraCast Conectado a tu Música Local`);
  console.log(`   - Canciones indexadas: ${playlist.length}`);
  console.log(`   - API NowPlaying: http://127.0.0.1:${PORT}/api/nowplaying/1`);
  console.log(`   - Audio Streaming: http://127.0.0.1:${PORT}/listen/habboradio/radio.mp3`);
  console.log(`====================================================`);
});
