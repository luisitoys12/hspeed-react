# HabboSpeed - Fansite Habbo Completa

## Stack
- Frontend: Vite + React 18 + Tailwind CSS v3 + shadcn/ui
- Backend: Express + Drizzle ORM + PostgreSQL (Supabase)
- Auth: JWT + bcrypt (via Express backend)
- Radio: Azuracast/ZenoFM API integration

## Theme
Dark Habbo-inspired: deep navy/purple background, purple accent (#7c3aed), pixel art touches.
HSL values for index.css:
- Background: 224 71% 4%
- Card: 220 70% 10%
- Primary: 262 84% 54% (purple)
- Secondary: 215 28% 17%
- Foreground: 213 31% 91%

## Database Tables (Drizzle schema)

### users
- id (serial pk), email, password_hash, display_name, habbo_username, avatar_url, role (admin/dj/user/pending), approved (boolean), speed_points (int), created_at

### news
- id (serial pk), title, summary, content, image_url, image_hint, category, date, reactions (jsonb), author_id (fk users), created_at

### events
- id (serial pk), title, server, date, time, room_name, room_owner, host, image_url, image_hint, created_at

### schedule
- id (serial pk), day, start_time, end_time, show_name, dj_name

### comments
- id (serial pk), article_id (fk news), author_id (fk users), author_name, content, created_at

### polls
- id (serial pk), title, options (jsonb array), is_active, created_at

### config
- id (serial pk), radio_service, api_url, listen_url, home_player_bg_url, slideshow (jsonb), discord_webhooks (jsonb)

### forum_categories
- id, name, description, sort_order

### forum_threads
- id, category_id (fk), title, author_id (fk users), author_name, is_pinned, is_locked, views, created_at

### forum_posts  
- id, thread_id (fk), author_id (fk users), author_name, content, created_at

### marketplace_items
- id, item_name, class_name, hotel, current_price, avg_price, price_history (jsonb), image_url, last_updated

### badge_collection
- id, code, name, description, hotel, category, image_url, discovered_at

### requests (song/shoutout)
- id, type (saludo/grito/concurso/cancion/declaracion), details, user_name, created_at

### team_members
- id, display_name, habbo_username, role, motto, joined_at

## Pages

### Public
1. Home (/) - Hero slideshow, radio player, latest badges, news, events, alliances
2. News (/news) - News list + detail (/news/:id)
3. Events (/events) - Upcoming events
4. Schedule (/schedule) - DJ schedule grid
5. Team (/team) - Team members grid
6. Community (/community) - Hub with links to sub-sections
7. Badge Browser (/badges) - Full badge search/explorer with Habbo API
8. Marketplace (/marketplace) - Furni price tracker
9. Imager (/imager) - Habbo avatar generator with options
10. Forum (/forum) - Category list, thread list, thread view
11. Contact (/contact) - Contact form
12. Login/Register (/login, /register)
13. Profile (/profile/:username)

### Admin Panel
14. Dashboard (/panel) - Stats overview
15. News Manager (/panel/news)
16. Events Manager (/panel/events)
17. Schedule Manager (/panel/schedule)
18. Users Manager (/panel/users)
19. Config (/panel/config)
20. Forum Moderation (/panel/forum)

## External APIs Used
- Habbo Profile: https://www.habbo.es/api/public/users?name={USERNAME}
- Habbo Avatar: https://www.habbo.es/habbo-imaging/avatarimage?user={USERNAME}&size=b
- Latest Badges: https://www.habboassets.com/api/v1/badges?hotel={hotel}&limit=20
- Marketplace: https://habboapi.site/api/market/history?classname={item}&hotel=es
- Badge Emotions: https://api.habboemotion.com/public/badges/new
