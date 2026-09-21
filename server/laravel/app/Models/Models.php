<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class News extends Model
{
    use HasFactory;
    protected $fillable = ['title', 'summary', 'content', 'image_url', 'image_hint', 'category', 'date', 'reactions', 'author_id'];
    protected $casts = ['reactions' => 'array', 'created_at' => 'datetime'];
}

class Event extends Model
{
    use HasFactory;
    protected $fillable = ['title', 'server', 'date', 'time', 'room_name', 'room_owner', 'host', 'image_url', 'image_hint'];
}

class Schedule extends Model
{
    use HasFactory;
    protected $fillable = ['day', 'start_time', 'end_time', 'show_name', 'dj_name'];
}

class ForumCategory extends Model
{
    use HasFactory;
    protected $fillable = ['name', 'description', 'sort_order'];
    public $timestamps = false;
}

class ForumThread extends Model
{
    use HasFactory;
    protected $fillable = ['category_id', 'title', 'author_id', 'author_name', 'is_pinned', 'is_locked', 'views'];
}

class ForumPost extends Model
{
    use HasFactory;
    protected $fillable = ['thread_id', 'author_id', 'author_name', 'content'];
}

class MarketplaceItem extends Model
{
    use HasFactory;
    protected $fillable = ['name', 'classname', 'revision', 'icon_url', 'market_data'];
    protected $casts = ['market_data' => 'array'];
}

class Badge extends Model
{
    use HasFactory;
    protected $fillable = ['code', 'name', 'description', 'url_habbo', 'category'];
}

class Config extends Model
{
    use HasFactory;
    protected $fillable = ['radio_service', 'api_url', 'listen_url', 'home_player_bg_url', 'slideshow', 'discord_webhooks'];
    protected $casts = ['slideshow' => 'array', 'discord_webhooks' => 'array'];
}

class User extends Model
{
    use HasFactory;
    protected $fillable = ['email', 'password_hash', 'display_name', 'habbo_username', 'avatar_url', 'role', 'approved', 'speed_points'];
}

class Request extends Model
{
    use HasFactory;
    protected $fillable = ['type', 'details', 'user_name'];
}
