<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\NewsController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\ScheduleController;
use App\Http\Controllers\Api\ForumController;
use App\Http\Controllers\Api\MarketplaceController;
use App\Http\Controllers\Api\BadgeController;
use App\Http\Controllers\Api\ConfigController;
use App\Http\Controllers\Api\NowPlayingController;
use App\Http\Controllers\Api\RequestController;
use App\Http\Controllers\Api\WallController;
use App\Http\Controllers\Api\NotificationController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| HSpeed V1 API Routes - Laravel + React Architecture
|
*/

// Public routes
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'db' => 'up',
        'uptime' => round(microtime(true) - $_SERVER['REQUEST_TIME_FLOAT'], 2),
    ]);
});

// Auth routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::get('/auth/me', [AuthController::class, 'me'])->middleware('auth:sanctum');

// News
Route::get('/news', [NewsController::class, 'index']);
Route::get('/news/{id}', [NewsController::class, 'show']);
Route::post('/news', [NewsController::class, 'store'])->middleware('auth:sanctum');
Route::put('/news/{id}', [NewsController::class, 'update'])->middleware('auth:sanctum');
Route::delete('/news/{id}', [NewsController::class, 'destroy'])->middleware('auth:sanctum');

// Events
Route::get('/events', [EventController::class, 'index']);
Route::get('/events/{id}', [EventController::class, 'show']);
Route::post('/events', [EventController::class, 'store'])->middleware('auth:sanctum');
Route::put('/events/{id}', [EventController::class, 'update'])->middleware('auth:sanctum');
Route::delete('/events/{id}', [EventController::class, 'destroy'])->middleware('auth:sanctum');

// Schedule
Route::get('/schedule', [ScheduleController::class, 'index']);
Route::post('/schedule', [ScheduleController::class, 'store'])->middleware('auth:sanctum');
Route::put('/schedule/{id}', [ScheduleController::class, 'update'])->middleware('auth:sanctum');
Route::delete('/schedule/{id}', [ScheduleController::class, 'destroy'])->middleware('auth:sanctum');

// Forum
Route::get('/forum/categories', [ForumController::class, 'categories']);
Route::get('/forum/categories/{id}/threads', [ForumController::class, 'threads']);
Route::get('/forum/threads/{id}', [ForumController::class, 'thread']);
Route::post('/forum/threads', [ForumController::class, 'createThread'])->middleware('auth:sanctum');
Route::get('/forum/threads/{id}/posts', [ForumController::class, 'posts']);
Route::post('/forum/posts', [ForumController::class, 'createPost'])->middleware('auth:sanctum');
Route::post('/forum/categories', [ForumController::class, 'createCategory'])->middleware('auth:sanctum');

// Marketplace
Route::get('/marketplace', [MarketplaceController::class, 'index']);
Route::get('/marketplace/{className}', [MarketplaceController::class, 'show']);

// Badges
Route::get('/badges', [BadgeController::class, 'index']);
Route::get('/badges/{hotel}', [BadgeController::class, 'badgesByHotel']);

// Config
Route::get('/config', [ConfigController::class, 'show']);
Route::put('/config', [ConfigController::class, 'update'])->middleware('auth:sanctum');

// Now Playing (Radio)
Route::get('/nowplaying', [NowPlayingController::class, 'show']);
Route::get('/dj-panel', [NowPlayingController::class, 'djPanel']);
Route::post('/requests', [RequestController::class, 'store'])->middleware('auth:sanctum');
Route::get('/requests', [RequestController::class, 'index']);

// Wall
Route::get('/wall/{userId}', [WallController::class, 'show']);
Route::post('/wall/{userId}', [WallController::class, 'store'])->middleware('auth:sanctum');
Route::delete('/wall/{id}', [WallController::class, 'destroy'])->middleware('auth:sanctum');

// Notifications
Route::get('/notifications', [NotificationController::class, 'index'])->middleware('auth:sanctum');
Route::put('/notifications/read-all', [NotificationController::class, 'readAll'])->middleware('auth:sanctum');
Route::put('/notifications/{id}/read', [NotificationController::class, 'read'])->middleware('auth:sanctum');

// User Profile
Route::get('/profile/{username}', [AuthController::class, 'profile']);
Route::get('/users/{username}/rooms', [AuthController::class, 'rooms']);
Route::get('/users/{username}/groups', [AuthController::class, 'groups']);
Route::get('/users/{username}/origins', [AuthController::class, 'origins']);

// Habbo API Proxy
Route::get('/habbo/user/{username}', [AuthController::class, 'habboUser']);
Route::get('/habbo/badges/{hotel}', [BadgeController::class, 'habboBadges']);
Route::get('/habbo/marketplace/{item}', [MarketplaceController::class, 'marketplaceHistory']);
Route::get('/habbo/furni', [MarketplaceController::class, 'furniCatalog']);
Route::get('/habbo/figureparts', [AuthController::class, 'figureParts']);

// Comments
Route::get('/comments/article/{articleId}', [ForumController::class, 'comments']);
Route::post('/comments', [ForumController::class, 'createComment'])->middleware('auth:sanctum');
Route::delete('/comments/{id}', [ForumController::class, 'deleteComment'])->middleware('auth:sanctum');

// Polls
Route::get('/polls', [ForumController::class, 'polls']);
Route::post('/polls', [ForumController::class, 'createPoll'])->middleware('auth:sanctum');
Route::put('/polls/{id}', [ForumController::class, 'updatePoll'])->middleware('auth:sanctum');

// Rankings
Route::get('/rankings', [NowPlayingController::class, 'rankings']);

// Messages
Route::get('/messages/unread', [NotificationController::class, 'unread'])->middleware('auth:sanctum');
