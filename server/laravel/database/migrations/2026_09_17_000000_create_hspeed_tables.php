<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('news', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('summary')->nullable();
            $table->text('content')->nullable();
            $table->string('image_url')->nullable();
            $table->string('image_hint')->nullable();
            $table->string('category')->default('General');
            $table->string('date');
            $table->json('reactions')->nullable();
            $table->foreignId('author_id')->nullable()->constrained('users');
            $table->timestamps();
        });

        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('server')->nullable();
            $table->string('date');
            $table->string('time')->nullable();
            $table->string('room_name')->nullable();
            $table->string('room_owner')->nullable();
            $table->string('host')->nullable();
            $table->string('image_url')->nullable();
            $table->string('image_hint')->nullable();
            $table->timestamps();
        });

        Schema::create('schedule', function (Blueprint $table) {
            $table->id();
            $table->string('day');
            $table->time('start_time');
            $table->time('end_time');
            $table->string('show_name')->nullable();
            $table->string('dj_name')->nullable();
            $table->timestamps();
        });

        Schema::create('forum_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('forum_threads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('forum_categories');
            $table->string('title');
            $table->foreignId('author_id')->nullable()->constrained('users');
            $table->string('author_name')->nullable();
            $table->boolean('is_pinned')->default(false);
            $table->boolean('is_locked')->default(false);
            $table->integer('views')->default(0);
            $table->timestamps();
        });

        Schema::create('forum_posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('thread_id')->constrained('forum_threads');
            $table->foreignId('author_id')->nullable()->constrained('users');
            $table->string('author_name')->nullable();
            $table->text('content');
            $table->timestamps();
        });

        Schema::create('marketplace_items', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('classname')->nullable();
            $table->integer('revision')->default(0);
            $table->string('icon_url')->nullable();
            $table->json('market_data')->nullable();
            $table->timestamps();
        });

        Schema::create('badges', function (Blueprint $table) {
            $table->id();
            $table->string('code')->nullable();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('url_habbo')->nullable();
            $table->string('category')->nullable();
            $table->timestamps();
        });

        Schema::create('config', function (Blueprint $table) {
            $table->id();
            $table->string('radio_service')->nullable();
            $table->string('api_url')->nullable();
            $table->string('listen_url')->nullable();
            $table->string('home_player_bg_url')->nullable();
            $table->json('slideshow')->nullable();
            $table->json('discord_webhooks')->nullable();
            $table->timestamps();
        });

        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('email')->unique();
            $table->string('password_hash');
            $table->string('display_name')->nullable();
            $table->string('habbo_username')->nullable();
            $table->string('avatar_url')->nullable();
            $table->string('role')->default('user');
            $table->boolean('approved')->default(false);
            $table->integer('speed_points')->default(0);
            $table->timestamps();
        });

        Schema::create('requests', function (Blueprint $table) {
            $table->id();
            $table->string('type');
            $table->text('details');
            $table->string('user_name');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('requests');
        Schema::dropIfExists('users');
        Schema::dropIfExists('config');
        Schema::dropIfExists('badges');
        Schema::dropIfExists('marketplace_items');
        Schema::dropIfExists('forum_posts');
        Schema::dropIfExists('forum_threads');
        Schema::dropIfExists('forum_categories');
        Schema::dropIfExists('schedule');
        Schema::dropIfExists('events');
        Schema::dropIfExists('news');
    }
};
