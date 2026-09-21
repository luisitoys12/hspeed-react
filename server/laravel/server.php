<?php

$app = require_once __DIR__ . '/vendor/autoload.php';

$app = new Illuminate\Foundation\Application(
    dirname(__DIR__)
);

// Register service providers
$app->register(Illuminate\Database\DatabaseServiceProvider::class);
$app->register(Illuminate\Routing\RoutingServiceProvider::class);
$app->register(Illuminate\Cache\CacheServiceProvider::class);
$app->register(Illuminate\Session\SessionServiceProvider::class);
$app->register(Illuminate\Encryption\EncryptionServiceProvider::class);
$app->register(Illuminate\Validation\ValidationServiceProvider::class);

// Load configuration
$app->instance('config', new Illuminate\Config\Repository(require __DIR__ . '/config/app.php'));

// Register routes
require __DIR__ . '/routes/api.php';

// Handle request
$request = Illuminate\Http\Request::capture();
$response = $app->dispatch($request);
$response->send();
