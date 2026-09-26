# Doodle District

A first-person survival shooter drawn in blue ballpoint on lined notebook paper. Grapple across
rooftops and canyons, slice bullets back at the doodles that fired them, lob grenades, and see how
many waves you can survive. Play alone, survive with friends, or fight them.

Everything you see is generated in code with three.js. There are no models, textures or sound
files: the paper, the ink outlines, the hatching, the enemies and the music are all procedural, including the 8-bit themes, one per map (toggle them in settings or with M).

## Running it

It is a static site, so any web server works. Locally:

```bash
python3 serve.py 8910
```

then open http://127.0.0.1:8910. On Vercel (or any static host) just deploy the folder as is.

## On a phone

The game is an installable web app. Put it on any HTTPS host (Vercel, GitHub Pages), open it in
Chrome on Android and choose **Install app** (or **Add to Home screen**). It then opens full screen and
sideways with its own icon, and starts offline too (online matches still need a connection). Touch
controls appear on the first tap: a thumbstick on the left (push it all the way to sprint), drag on
the right to look, and buttons for fire, aim, hook, jump, slide, slash, reload, grenade and weapon
swap; DASH appears when the katana gauge is lit. A paired Bluetooth controller works as well.

`sw.js` lists every file the game loads so it can be cached for offline play; after adding a file,
add it there too (`node --test tools/pwa.test.mjs` checks the list).

## Modes

- **Solo**: survive the waves. Bosses every fifth wave, checkpoints unlock at wave 5, 10, 15...
- **Free for all**: up to ten players, first to 20 kills, with a ten minute cap shown on screen that starts once a second player is in. Anyone in the lobby can start. After the death cam a press of any button brings you back with a two second shield; two and a half minutes without input gets you kicked, with a one-click rejoin. Health
  regenerates after a few seconds out of combat (not while sprinting), so only ammo drops in.

Multiplayer is peer-to-peer over WebRTC (PeerJS), so it works from a static host with no game
server. Under PLAY ONLINE you can Quick Play (joins an open public lobby, or opens one for you),
create a public or private lobby, or join a friend's lobby with their five letter code. People can
join a match already in progress. The host's browser keeps score; each player runs their own body.

## Controls

| Action | Mouse + keyboard | PS5 controller |
| --- | --- | --- |
| Move / look / sprint | WASD, mouse, Shift | L stick, R stick, L3 |
| Fire / slash | LMB | R2 |
| Aim / block (katana) | RMB | L2 |
| Jump, wall jump, double jump | Space | ✕ |
| Slide, air dash | C / Ctrl (X, Alt) | ○ |
| Grapple (hold to reel) | Q / E | L1 |
| Quick katana slash | F | R1 |
| Reload | R | □ |
| Grenade (hold to throw further) | G | R3 or d-pad up |
| Katana dash (gauge lit) | both mouse buttons or X | L2 + R2 |
| Weapons | 1-4 / wheel | △, d-pad |
| Scoreboard (online) | Tab | Create |
| Menu | Esc | Options |

On-screen hints follow whichever device you touched last.

## Weapons and gear

Rifle, shotgun, sniper (with scope) and a katana. Holding block with the katana parries
some incoming bullets and returns a share of them. Katana kills charge a gauge; when it is lit you
can dash to a marked enemy and execute it (solo only). Grenades bounce, then go off in a thick orange blast that scorches the paper; holding the
button winds up a longer throw and shows the arc. The grapple runs on breath: hanging drains it,
landing refills it, and a slash through someone's rope cuts it. Against other players a raised katana parries
slashes and turns some bullets aside, and the guns use their own damage table; the sniper still erases in one shot.

## Maps

- **Doodle District**: streets, rooftops and fire escapes, with grapple rings on the high spots. Solo
  plays the tight original block. A match opens it up: a ring of empty street, walls, a ribbed dome
  that cannot be hooked, an open field in the middle crossed by a ruler bridge, a few pads hung from
  the dome, and slow paper planes you can hook and ride (the solo planes too).
- **Doodle Mexico**: a sun-baked pueblo. A plaza with a fountain and a giant sombrero floating over it,
  a bandstand where three mariachis never stop playing, a church with a bell tower you can climb and
  a domed second tower, adobe houses with roof stairs, papel picado strung across the square, a
  market of striped stalls and hanging piñatas, a taco cart, cacti and mesas all around. Pots, crates,
  barrels, cacti and piñatas all break under bullets, blades and blasts; piñatas drop tacos, which are
  the health pickups here. The map plays its own mariachi waltz.

Pick the map on the main menu for solo; the host picks it in the lobby for a match, and everyone
starts in a different spot.

### Doodle Nairobi from OpenStreetMap

The Nairobi map can be generated from real OpenStreetMap data for the CBD (Node 18+ and curl):

```bash
node tools/osm/fetch.mjs     # downloads the CBD from the Overpass API into tools/osm/nairobi-cbd.osm.json
node tools/osm/build.mjs     # writes src/nairobi-data.js
node --test tools/osm/pipeline.test.mjs
```

The game only collides axis-aligned boxes, so the build finds the angle of the street grid and turns
the city until the streets run along the page. Nearly straight streets are snapped into single
strips, diagonal ones (Uhuru Highway) become chunky steps, and each building footprint is cut into a
few boxes at its real height (from `height` or `building:levels`). The city is compressed to about
8 m per square across and 3.5 m per square up, and streets are widened so there is room to fight.
Landmarks recognised by name (KICC, Jamia Mosque, City Market, the Kenyatta statue) get their own
drawings; spawns, snipers, grapple rings, pickups and matatus are placed from the geometry. The
settings are at the top of `tools/osm/pipeline.mjs`, and `--angle <deg>` overrides the grid angle.
While `src/nairobi-data.js` exports `null` the game uses the older hand-placed layout. VIEW MAP on
the main menu shows the result from above with street names. Map data © OpenStreetMap contributors, ODbL.

## Enemies

Grunts, rushers, bombers, snipers with dodgeable lasers, flyers, heavies and shield bearers. Bosses
rotate: The Doodler, The Eraser and The Inkblot, each with its own moves.

## How the look works

The scene renders to a buffer holding shade, an ink id and view-space normals plus a float depth.
A post pass draws outlines from an inverse-depth Laplacian, adds surface-following hatching, paper
grain, ruled lines and the red margin. Wobble is static so nothing flickers.
