# HabboSpeed Redesign Spec

## Reference Images Analysis
1. **HabboFans** (image 1): Blue bg, horizontal nav top, main content with big banner + sidebar with "Recientes" and "Estadísticas", grid of content, footer with links
2. **HabboRadio** (image 2): Dark theme with colorful top bar, DJ avatar large with "CURRENT DJ" + "CURRENT SONG" in radio bar, hero banner with message board, sidebar cards "Join our team!", "Welcome by habboradio", "Newest Clothes" carousel, "Newest Badges" grid, main news cards with images
3. **RubyXD** (image 3): Dark theme, big hero banner with game art, "Portal de Noticias" grid below with thumbnail cards

## Key Design Elements to Adopt
- **Radio Bar**: Full-width bar below nav showing DJ avatar (large), current song, listeners count, volume controls — like HabboRadio's top bar
- **HomePage Layout**: 2-column layout (main + sidebar) like HabboRadio/HabboFans
- **Sidebar**: Stats section, "Join our team" card, recent items
- **News Cards**: Larger image thumbnails with title overlay, like RubyXD's portal
- **Newest Badges Section**: Grid of badge images like HabboRadio (3x3 or 4x3 grid)
- **DJ Avatar must always show**: Even when not live, show "AutoDJ" or default avatar

## Bugs to Fix

### 1. Badges not showing in marquee
The API returns `{ badges: [...] }` but the code does `Array.isArray(d) ? d : (d.data || [])` — should be `d.badges || d.data || []`

### 2. Marketplace not working properly
The API returns an array with marketplace data inside `[0].marketData.history`. The current code expects a flat structure. Need to parse the nested structure:
- `data[0].FurniName` for item name
- `data[0].marketData.history` for price history (format: [price, amount, total, offers, timestamp])
- `data[0].marketData.averagePrice` for avg price

### 3. Radio Player DJ avatar
The DJ avatar currently only shows when `djName` is returned from nowplaying API. Since the radio URL is example.com, no data returns. Fix: Always show a DJ section with fallback "AutoDJ" avatar.

## File Changes Required

### client/src/pages/HomePage.tsx — FULL REWRITE
Design inspired by HabboRadio + HabboFans + RubyXD:
- Full-width Radio Bar below nav (separate component already exists but need dedicated radio bar)
- Hero banner (keep existing but improve)
- 2-column layout: Main (news grid with large image cards) + Sidebar (stats, events, polls, tools, team CTA)
- "Últimas Placas" section with actual badge grid (not just marquee)
- "Portal de Noticias" header style like RubyXD

### client/src/components/FloatingRadioPlayer.tsx — UPDATE
- Always show DJ avatar (use "AutoDJ" fallback with default Habbo avatar)
- Make the player more prominent when inside the radio bar
- Show current song info even if no API data

### client/src/pages/BadgesPage.tsx — FIX
- Fix API response parsing: use `d.badges` field

### client/src/pages/MarketplacePage.tsx — FIX  
- Fix API response parsing for the nested structure
- Parse history array format [price, amount, total, offers, timestamp]
- Show item image from Habbo

### client/src/components/TopNavBar.tsx — UPDATE
- Add a dedicated Radio Bar below the nav (full width, shows DJ info + player)

## Supabase Connection
Already connected and working. DB host: aws-0-us-west-2.pooler.supabase.com
