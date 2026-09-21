<?php

// Laravel + HSpeed V1 - Server Entry Point
// This file serves as the PHP-FPM entry point for the Laravel backend

// Load environment
$dotenv = __DIR__ . '/.env';
if (file_exists($dotenv)) {
    $lines = file($dotenv, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        if (strpos($line, '=') === false) continue;
        [$name, $value] = explode('=', $line, 2);
        putenv(trim($name) . '=' . trim($value));
    }
}

// Handle preflight CORS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    http_response_code(200);
    exit;
}

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Simple routing for HSpeed API
$requestUri = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];

// Remove query string
$requestUri = strtok($requestUri, '?');

// API Routes
$routes = [
    'GET' => [
        '/api/health' => 'health',
        '/api/nowplaying' => 'nowplaying',
        '/api/dj-panel' => 'djPanel',
        '/api/schedule' => 'schedule',
        '/api/events' => 'events',
        '/api/news' => 'news',
        '/api/config' => 'config',
        '/api/polls' => 'polls',
        '/api/badges' => 'badges',
        '/api/marketplace' => 'marketplace',
        '/api/rankings' => 'rankings',
        '/api/forum/categories' => 'forumCategories',
        '/api/habbo/furni' => 'habboFurni',
    ],
];

$key = $method . ' ' . $requestUri;

// Health check
if ($requestUri === '/api/health') {
    echo json_encode([
        'status' => 'ok',
        'db' => 'up',
        'uptime' => round(microtime(true) - $_SERVER['REQUEST_TIME_FLOAT'], 2),
    ]);
    exit;
}

// Now Playing
if ($requestUri === '/api/nowplaying') {
    echo json_encode([
        'now_playing' => [
            'song' => ['title' => 'Wulf - All Things Under The Sun', 'artist' => 'Wulf'],
        ],
        'listeners' => ['current' => rand(20, 80)],
        'live' => ['is_live' => false, 'streamer_name' => null],
        'station' => ['listen_url' => getenv('RADIO_LISTEN_URL')],
        'song_history' => [],
    ]);
    exit;
}

// DJ Panel
if ($requestUri === '/api/dj-panel') {
    echo json_encode([
        'currentDj' => 'AutoDJ',
        'nextDj' => 'DJ_Speedy',
        'isLive' => false,
    ]);
    exit;
}

// Rankings
if ($requestUri === '/api/rankings') {
    echo json_encode([
        'topListeners' => [
            ['id' => 1, 'displayName' => 'AdminHS', 'value' => 45],
            ['id' => 2, 'displayName' => 'DJ_Speedy', 'value' => 38],
        ],
        'topDJs' => [
            ['id' => 1, 'displayName' => 'DJ_Speedy', 'value' => 120],
        ],
        'topPoints' => [
            ['id' => 1, 'displayName' => 'AdminHS', 'value' => 5000],
        ],
        'staff' => [
            ['id' => 1, 'displayName' => 'AdminHS', 'role' => 'admin'],
        ],
    ]);
    exit;
}

// Config
if ($requestUri === '/api/config') {
    echo json_encode([
        'maintenanceMode' => false,
        'slideshow' => [
            ['image' => 'https://images.habbo.com/c_images/reception/rec_background_beach.png', 'title' => '¡Bienvenidos a HSpeed V1!'],
            ['image' => 'https://images.habbo.com/c_images/reception/rec_background_habboween.png', 'title' => '¡Radio 24/7!'],
        ],
        'listenUrl' => getenv('RADIO_LISTEN_URL'),
    ]);
    exit;
}

// Schedule
if ($requestUri === '/api/schedule') {
    echo json_encode([
        ['day' => 'Monday', 'startTime' => '01:00', 'endTime' => '03:00', 'showName' => 'Morning Show', 'djName' => 'DJ_Speedy'],
        ['day' => 'Tuesday', 'startTime' => '02:00', 'endTime' => '04:00', 'showName' => 'Night Session', 'djName' => 'DJ_Loco'],
    ]);
    exit;
}

// Events
if ($requestUri === '/api/events') {
    echo json_encode([
        ['id' => 1, 'title' => 'Gran Fiesta HSpeed', 'server' => 'Habbo.es', 'date' => '20/09/2026', 'time' => '20:00', 'roomName' => '[HS] Main Stage'],
    ]);
    exit;
}

// News
if ($requestUri === '/api/news') {
    echo json_encode([
        ['id' => 1, 'title' => 'HSpeed V1 Nueva Generación', 'summary' => 'La nueva era de HSpeed ha llegado.', 'category' => 'Actualizaciones', 'date' => '20/09/2026'],
    ]);
    exit;
}

// Badges
if (preg_match('#^/api/badges(?:/(\w+))?$#', $requestUri, $matches)) {
    echo json_encode([
        ['code' => 'ADM', 'name' => 'Administrador', 'description' => 'Placa de administrador'],
        ['code' => 'ES992', 'name' => 'Micrófono de Oro', 'description' => 'DJ estrella'],
    ]);
    exit;
}

// Habbo Furni
if ($requestUri === '/api/habbo/furni') {
    echo json_encode([
        ['name' => 'Trono de Habbo', 'classname' => 'throne', 'revision' => 231, 'iconUrl' => 'https://images.habbo.com/dcr/hof_furni/231/throne_icon.png'],
    ]);
    exit;
}

// Forum Categories
if ($requestUri === '/api/forum/categories') {
    echo json_encode([
        ['id' => 1, 'name' => 'General', 'description' => 'Foro general'],
    ]);
    exit;
}

// 404
http_response_code(404);
echo json_encode(['error' => 'Route not found', 'path' => $requestUri]);
