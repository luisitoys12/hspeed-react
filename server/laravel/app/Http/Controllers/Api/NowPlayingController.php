<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Cache;

class NowPlayingController extends Controller
{
    public function show()
    {
        $data = Cache::remember('nowplaying', 15, function () {
            return [
                'now_playing' => [
                    'song' => [
                        'title' => 'Wulf - All Things Under The Sun',
                        'artist' => 'Wulf',
                    ],
                ],
                'listeners' => ['current' => rand(20, 80)],
                'live' => [
                    'is_live' => false,
                    'streamer_name' => null,
                ],
                'station' => [
                    'listen_url' => env('RADIO_LISTEN_URL'),
                ],
                'song_history' => collect(range(1, 5))->map(function () {
                    return [
                        'song' => [
                            'title' => ['Wulf - All Things Under The Sun', 'DJ Demo Track', 'Radio Default'][array_rand(['Wulf - All Things Under The Sun', 'DJ Demo Track', 'Radio Default'])],
                            'artist' => ['Wulf', 'DJ Speedy', 'AutoDJ'][array_rand(['Wulf', 'DJ Speedy', 'AutoDJ'])],
                        ],
                    ];
                })->toArray(),
            ];
        });

        return response()->json($data);
    }

    public function djPanel()
    {
        return response()->json([
            'currentDj' => 'AutoDJ',
            'nextDj' => 'DJ_Speedy',
            'isLive' => false,
        ]);
    }

    public function rankings()
    {
        return response()->json([
            'topListeners' => [
                ['id' => 1, 'displayName' => 'AdminHS', 'value' => 45],
                ['id' => 2, 'displayName' => 'DJ_Speedy', 'value' => 38],
                ['id' => 3, 'displayName' => 'HabboFan', 'value' => 32],
            ],
            'topDJs' => [
                ['id' => 1, 'displayName' => 'DJ_Speedy', 'value' => 120],
                ['id' => 2, 'displayName' => 'DJ_Loco', 'value' => 95],
                ['id' => 3, 'displayName' => 'DJ_RockStar', 'value' => 87],
            ],
            'topPoints' => [
                ['id' => 1, 'displayName' => 'AdminHS', 'value' => 5000],
                ['id' => 2, 'displayName' => 'DJ_Speedy', 'value' => 3200],
                ['id' => 3, 'displayName' => 'DJ_Loco', 'value' => 2800],
            ],
            'staff' => [
                ['id' => 1, 'displayName' => 'AdminHS', 'role' => 'admin'],
                ['id' => 2, 'displayName' => 'DJ_Speedy', 'role' => 'dj'],
            ],
        ]);
    }
}
