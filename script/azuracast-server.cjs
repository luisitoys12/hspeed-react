const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8005;
const USER_MUSIC_DIR = 'C:\\Users\\LuisSandoval\\Music\\Qobuz';
const FALLBACK_MP3 = path.resolve(__dirname, 'sample-radio-track.mp3');

// Helper para encontrar el primer frame MPEG (salta encabezados ID3v2 y carátulas pesadas)
function findMpegFrameOffset(buf) {
  let start = 0;
  if (buf.length > 10 && buf.subarray(0, 3).toString() === 'ID3') {
    const id3Size = (buf[6] << 21) | (buf[7] << 14) | (buf[8] << 7) | buf[9];
    start = id3Size + 10;
  }
  for (let i = start; i < buf.length - 1; i++) {
    if (buf[i] === 0xff && (buf[i + 1] & 0xe0) === 0xe0) {
      return i;
    }
  }
  return 0; // Fallback al inicio si no se detecta
}

// 1. Indexar biblioteca de música real de Qobuz
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
          // Estimar duración basada en bitrate 320 kbps (40 KB/s)
          const estimatedDuration = Math.max(90, Math.min(480, Math.floor(size / 40000)));

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

// Mezclar canciones aleatoriamente al inicio
for (let i = playlist.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [playlist[i], playlist[j]] = [playlist[j], playlist[i]];
}

console.log(`[AzuraCast] Biblioteca cargada: ${playlist.length} canciones reales desde ${USER_MUSIC_DIR}`);

// 2. Cache en memoria de canciones con audio MPEG limpio
const songCache = new Map();

function getPreparedSong(song) {
  if (songCache.has(song.fullPath)) {
    return songCache.get(song.fullPath);
  }
  try {
    const rawBuf = fs.readFileSync(song.fullPath);
    const mpegOffset = findMpegFrameOffset(rawBuf);
    const audioBuf = rawBuf.subarray(mpegOffset);

    // Evitar que el cache supere 8 canciones en RAM (~60MB)
    if (songCache.size > 8) {
      const firstKey = songCache.keys().next().value;
      songCache.delete(firstKey);
    }

    const prepared = {
      rawBuf,
      mpegOffset,
      audioBuf,
      length: audioBuf.length
    };
    songCache.set(song.fullPath, prepared);
    return prepared;
  } catch (err) {
    console.error(`[AzuraCast] Error cargando ${song.fullPath}:`, err.message);
    return null;
  }
}

// 3. Emisión Global Sincronizada
let globalSongIndex = 0;
let songStartedAt = Math.floor(Date.now() / 1000);
let currentGlobalOffset = 0;
const songHistory = [];

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
  currentGlobalOffset = 0;

  const next = getCurrentSong();
  console.log(`[AzuraCast] 🎵 Emisión en curso: "${next.artist} - ${next.title}" | Oyentes conectados: ${activeClients.size}`);
}

// 4. Clientes de Streaming Conectados (Oyentes reales)
const activeClients = new Map(); // res -> { offset }

// API NowPlaying estándar AzuraCast (Contador REAL de oyentes y tema REAL)
function getNowPlayingData() {
  const current = getCurrentSong();
  const nowSec = Math.floor(Date.now() / 1000);
  const elapsed = Math.max(0, nowSec - songStartedAt);
  const remaining = Math.max(0, current.duration - elapsed);
  const realListeners = activeClients.size;

  return {
    station: {
      id: 1,
      name: "HabboSpeed Radio AzuraCast",
      shortcode: "habbospeed",
      description: "Transmitiendo tu colección local de Qobuz",
      listen_url: "https://springer-shoulder-paintings-town.trycloudflare.com/listen/habboradio/radio.mp3"
    },
    listeners: {
      current: realListeners,
      unique: realListeners,
      total: realListeners
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

// 5. Ciclo de bombeo de audio (40 KB/s continuo a 320 kbps)
// 10240 bytes cada 250ms = 40.960 bytes/s
const CHUNK_SIZE = 10240;

setInterval(() => {
  const song = getCurrentSong();
  const prep = getPreparedSong(song);

  if (!prep || prep.length === 0) {
    advanceGlobalSong();
    return;
  }

  // Avanzar offset global
  currentGlobalOffset += CHUNK_SIZE;
  if (currentGlobalOffset >= prep.length) {
    advanceGlobalSong();
    return;
  }

  // Si no hay oyentes conectados, solo avanzamos el reloj global
  if (activeClients.size === 0) return;

  for (const [res, state] of activeClients.entries()) {
    try {
      const nextOffset = state.offset + CHUNK_SIZE;
      if (nextOffset >= prep.length) {
        if (state.offset < prep.length) {
          res.write(prep.audioBuf.subarray(state.offset));
        }
        state.offset = 0;
      } else {
        res.write(prep.audioBuf.subarray(state.offset, nextOffset));
        state.offset = nextOffset;
      }
    } catch {
      activeClients.delete(res);
      console.log(`[AzuraCast] Oyente desconectado por error de socket. Total oyentes reales: ${activeClients.size}`);
    }
  }
}, 250);

// Rotación por tiempo si el archivo terminó
setInterval(() => {
  const cur = getCurrentSong();
  const elapsed = Math.floor(Date.now() / 1000) - songStartedAt;
  if (elapsed >= cur.duration) {
    advanceGlobalSong();
  }
}, 5000);

// 6. Servidor HTTP
const server = http.createServer((req, res) => {
  // CORS universal
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = req.url.split('?')[0];

  // Endpoints NowPlaying AzuraCast
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

  // Endpoint de Streaming de Audio MP3
  if (url.startsWith('/listen/') || url.endsWith('.mp3')) {
    console.log(`[AzuraCast] 🎧 Nuevo oyente conectado desde ${req.socket.remoteAddress}. Oyentes ahora: ${activeClients.size + 1}`);

    res.writeHead(200, {
      'Content-Type': 'audio/mpeg',
      'Transfer-Encoding': 'chunked',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Accel-Buffering': 'no',
      'icy-name': 'HabboSpeed Radio Live',
      'icy-genre': 'Pop / Hits / Latino',
      'icy-br': '320'
    });

    const song = getCurrentSong();
    const prep = getPreparedSong(song);

    // Ráfaga inicial inmediata de 256 KB de frames MPEG puros (permite que Chromium/Safari/móvil inicien readyState=4 al instante)
    let initialOffset = 0;
    if (prep) {
      const burstSize = Math.min(262144, prep.length);
      res.write(prep.audioBuf.subarray(0, burstSize));
      initialOffset = burstSize;
    }

    activeClients.set(res, { offset: initialOffset });

    req.on('close', () => {
      activeClients.delete(res);
      console.log(`[AzuraCast] 🎧 Oyente desconectado. Oyentes ahora: ${activeClients.size}`);
    });
    return;
  }

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: 'AzuraCast Online',
    listeners: activeClients.size,
    current_song: getCurrentSong().artist + ' - ' + getCurrentSong().title
  }));
});

server.listen(PORT, '0.0.0.0', () => {
  const cur = getCurrentSong();
  console.log(`====================================================`);
  console.log(`📡 Servidor AzuraCast Conectado a tu Música Local`);
  console.log(`   - Canciones indexadas: ${playlist.length}`);
  console.log(`   - Tema en emisión: ${cur.artist} - ${cur.title}`);
  console.log(`   - Oyentes reales: ${activeClients.size}`);
  console.log(`   - API NowPlaying: http://127.0.0.1:${PORT}/api/nowplaying/1`);
  console.log(`   - Audio Streaming: http://127.0.0.1:${PORT}/listen/habboradio/radio.mp3`);
  console.log(`====================================================`);
});
