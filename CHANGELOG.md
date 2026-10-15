# Changelog

Every code change, newest first. Add an entry here with each change.

## 2026-10-15 (loadout and 33 guns)
- **A Loadout screen with 33 guns, and a see-through three-gun card in the game** (new `src/arsenal.js`, `tools/arsenal.test.mjs`; changed `src/weapons.js`, `src/player.js`, `src/players.js`, `src/main.js`, `src/touch.js`, `src/hud.js`, `style.css`, `sw.js`, `README.md`, `docs/play-store-listing.md`)
  - **The armoury:** 33 guns in seven types. Pistols (Revolver, Quill 9, M1911, Stapler), SMGs (MAC-10, Tommy Gun, Pencil SMG, Highlighter PDW), assault rifles (Rifle, AK-47, M16, M4, FAL, G3, Ballpoint AR, Marker Carbine), shotguns (Shotgun, Sawed-Off, Auto-12, Combat Shotgun), snipers (Sniper, Dragunov SVD, Mosin, M82), LMGs (M31, M249, M60, MG42, PKM) and the four rotary guns. All stats live in one plain-data file, `src/arsenal.js`. The older guns keep exactly their old numbers; the 24 new ones are first-pass numbers.
  - **Models:** the new guns share one builder that shapes the model from each gun's data (receiver, handguard, barrel, stock, magazine style, sight, bolt, bipod), so a pistol, an AK, an M249 and a Mosin all look different.
  - **LOADOUT button on the main menu:** every gun as a card with stat bars (damage, rate, magazine, range, aim) and a filter by type. Tap a slot, then a gun; picking a gun that is already in another slot swaps them. RESET restores rifle, shotgun, sniper. Your three guns are saved on the device.
  - **The in-game card is transparent and holds only your three guns** (it used to list every weapon on a tinted card). Keys 1 to 3, the mouse wheel and the SWAP button cycle just those three; 4 and 5 are the katana and gloves; the melee button is unchanged. On phones the card is now three tappable chips under the health bar (a gun in your hands is underlined), and the extra PREV button from the rotary-gun update was removed.
  - **Online:** a weapon is now identified by its position in the arsenal, so other players see and hear every gun you carry. The first ten positions are frozen in the old order and new guns are only ever added on the end, so older versions still show the original guns (and a rifle for anything they do not know). `tools/arsenal.test.mjs` guards this order.
  - **Fixes along the way:** automatic guns now keep their exact fire rate between frames; the touch kill feed and wave message moved out of the way of the chips.
  - **Checked:** all 33 guns were built, fired and reloaded with no errors; clicking through LOADOUT (pick, swap, filter, reset, done) saved and applied; the card shows three rows on a transparent background; keys 1 to 3 and tapping the chips switch guns; another online browser saw an AK-47, a minigun and a Mosin with no errors; touch layout re-audited at 640x360, 844x390 and 960x540 (clean at the last two; at 640x360, a stress screen with every HUD item on grazes the grenade icons). 9 automatic tests pass.
  - **Not done:** changing the loadout from the pause menu or lobby (only from the main menu), a preview of each gun's model on its card, and balance by real play.

## 2026-10-15 (rotary guns)
- **Four new rotary machine guns: M134 Minigun, GAU-19, Yak-B 12.7 and GShG-7.62** (`src/weapons.js`, `src/player.js`, `src/input.js`, `src/players.js`, `src/enemies.js`, `src/audio.js`, `src/main.js`, `src/touch.js`, `src/hud.js`, `style.css`, `README.md`, `docs/play-store-listing.md`)
  - Weapons 7 to 10 (keys 7, 8, 9, 0). Each spins its barrels up while fire is held (0.45 to 1.3 seconds), then fires fast: M134 30 a second (200-round belt, 9 damage), GAU-19 22 a second (120 rounds, 15 damage, heavy 12.7 mm), Yak-B 36 a second (150 rounds, 12 damage, the slowest to spin) and GShG-7.62 28 a second (100 rounds, 8 damage, the quickest to spin and lightest to carry). Damage against other players is lower, and all four lose damage over distance.
  - Heavy to carry: no sprinting while the barrels are spinning, and your walk slows to 45 to 65 percent at full spin. Spread is wide and each has a long reload (3 to 5 seconds).
  - Four first-person models with a spinning ring of six barrels, a motor housing, and a belt box (M134), round drum (GAU-19 and GShG) or green ammo can (Yak-B). A deep short gunshot sound, plus a whirr that rises in pitch as the barrels spin up.
  - Built to spare phones: sound, smoke and sparks play on every 2nd to 4th shot, and these guns eject no shells. The fire rate is kept exact between frames (30, 22, 36 and 28 shots a second at 60 fps).
  - Online: other players see a rotary gun in your hands, hear it, and see its tracers. They are on the end of the weapon list, so the older weapon numbers do not change.
  - Touch: a new PREV button beside SWAP, since there are now ten weapons to cycle through. The hint text was narrowed so it clears the new button. Layout re-audited at 640x360, 844x390 and 960x540: no overlaps, nothing off-screen, no tap target under 44 px.
  - Checked in the game: spin-up delays of 0.67, 0.87, 1.25 and 0.43 s, fire rates of 30.3, 22.3, 36.4 and 28 shots a second, magazines and reloads, empty-magazine handling, keys 7 to 0, and another online browser seeing each gun with no errors.
  - Not tested: how it feels at real frame rates on a phone, and the balance (the numbers are a first pass).

## 2026-10-15 (M31)
- **The machine gun is now the M31** (it was briefly named AM31 by mistake) (`src/weapons.js`, `src/main.js`, `src/hud.js`, `README.md`, `docs/play-store-listing.md`)
  - New name in the weapon list, ammo readout, kill feed, help screen, README and store listing. Slot 6, stats, model and sounds are unchanged. Internally it is still called `machinegun`, so weapon ids and online messages stay compatible.
  - "M31" is the name only: it is our own original design, not a copy of any real gun.

## 2026-10-15
- **New weapon: the machine gun** (`src/weapons.js`, `src/player.js`, `src/input.js`, `src/players.js`, `src/enemies.js`, `src/audio.js`, `src/main.js`, `src/hud.js`, `README.md`, `docs/play-store-listing.md`)
  - A belt-fed LMG in slot 6 (press 6, or cycle with the wheel or the SWAP button). 100-round belt (200 in reserve, 400 max), about 15 shots a second at 60 fps, 14 damage (12 against players), headshots x2.
  - Its trade-offs: a wide spread that grows as you fire, heavy recoil, a 3.3 second reload, and damage that fades from 22 m out (to half at 58 m). It wins close and mid range; the rifle is better when you need to aim.
  - New first-person model (heavy vented barrel, top rail, bipod, belt box that drops away on reload), a short low gunshot sound, tracers and a "MACHINE GUN" kill-feed name.
  - Online: other players see the machine gun in your hands and hear it. It is the sixth weapon on the end of the list, so the weapon numbers of the other guns, and what players on older versions see, do not change (an older version shows it as a rifle).
  - Checked: 6 weapons load, key 6 and key 1 switch, the magazine drops by shots fired and refills on reload, real touch-fire damages enemies, and a second online browser sees weapon 6 with no errors.
  - Not tuned by play: the numbers are a first pass. Tell me if it feels too strong or too weak.

## 2026-10-14 (asset links)
- **Site-to-app link filled in** (`.well-known/assetlinks.json`, `play/twa-manifest.json`, `docs/PLAY_STORE.md`)
  - `assetlinks.json` now holds the app's package name, `app.vercel.nairobi_streets.twa`, and the SHA-256 fingerprint of the signing key PWABuilder generated. This is what lets the installed app open the game full screen without an address bar.
  - `play/twa-manifest.json` uses the same package name so the files agree.
  - Still to add after the first upload to Google Play: the second fingerprint from Play Console under Setup > App signing, in the same list.

## 2026-10-14 (live address)
- **Play Store files now point at the live site, https://nairobi-streets.vercel.app** (`play/twa-manifest.json`, `docs/PLAY_STORE.md`, `docs/play-store-listing.md`)
  - Host, icon, manifest and scope addresses in the Android app settings; website and privacy policy lines in the store listing; example addresses in the guide.
  - Not checked live: this environment cannot reach the site, so open `/privacy.html` and `/.well-known/assetlinks.json` on it yourself.
  - Still to fill later: the signing key fingerprint in `.well-known/assetlinks.json`, which only exists after the app is built.

## 2026-10-14 (touch layout audit)
- **Audit of the whole touch layout, and fixes for what it found** (`style.css`, `src/touch.js`)
  - Method: a script builds the busiest possible screen (score, combo, modifier, timer, kill feed, tip, wave message, boss bar, gauge, scoreboard, ranking list) at 8 phone sizes (640x360 to 1024x600), in solo and online states, and checks every HUD block and button against every other one, plus off-screen items, tap sizes and menu scrolling.
  - Kill feed: it ran under the HOOK, SLASH and NADE buttons. Now it sits just left of the buttons, three lines at most.
  - Combo text: it landed on the minimap. Now it sits just right of the minimap, under the score, and shrinks on small screens.
  - Tap sizes: 8 buttons were under 44 px (pause 32, reload and swap 36, grenade and slash 38, slide 40). Every touch button is now at least 44 px.
  - Pause button: the bigger size touched the wave readout, so the top-right readout now keeps clear of it.
  - Timer: the long "TIMER STARTS WHEN A PLAYER JOINS" line ran across the health bar. It now wraps into a narrow column on touch.
  - Scoreboard: ten players ran off the bottom of the screen and sat under the buttons. It now sits between the left and right thumbs, is smaller, and scrolls if needed.
  - Weapon name: moved slightly down so it no longer touches the health bar.
  - Online ranking list: slightly smaller text so four rows clear the buttons.
  - Notches: touch controls and HUD now respect the device safe area (`env(safe-area-inset-*)`), so nothing sits under a camera cutout or rounded corner.
  - Result: at 844x390 and 640x360, solo and online, no HUD block overlaps a button, nothing is off-screen and no tap target is under 44 px. Menus were checked and scroll on phones. Remaining overlaps are tiny line-box touches between stacked text lines (for example wave and modifier). Keyboard and controller layouts are unchanged.

## 2026-10-14 (tip text fix)
- **Hint text ("Hold HOOK to reel...") no longer overlaps other HUD on touch screens** (`style.css`)
  - The tip sat just under the top HUD and just above the big wave message, so it ran into "enemies left", the timer or the "WAVE" message depending on the phone size.
  - In touch mode it now sits in the quiet strip at the bottom centre, above the boss bar and the grapple gauge, with text that scales to the screen (13 to 18 px).
  - Also fixed the boss bar from the last fix: its inner bar was wider than its box and ran under the SLIDE button on small phones. It is now sized to its box (28% of the screen width), and the earlier overlap test was changed to measure the bar itself.
  - Checked at 844x390, 960x540, 932x430 and 640x360, with a tip, the boss bar, the gauge and the wave message all showing: no overlaps with any button or HUD block.
  - Keyboard and controller layouts are unchanged.

## 2026-10-14 (grapple bar fix)
- **The grapple stamina bar (the tall gauge on the left) no longer sits on the left fire button on touch screens** (`style.css`, `src/hud.js`)
  - That gauge is the "focus meter": it shows grapple stamina in online matches and the katana charge in solo. On phones it overlapped the left FIRE button and the minimap label.
  - In touch mode it is now a short horizontal bar at the bottom left, next to the boss bar's space. `hud.js` now also sets a `--f` CSS variable with the fill level so the horizontal bar can fill sideways.
  - The boss bar was narrowed a little (30% of the width) to leave room on very small phones. Checked at 844x390, 960x540 and 640x360: no overlaps with any button or HUD block, with and without the boss bar showing.
  - Keyboard and controller layouts are unchanged.

## 2026-10-14 (boss bar fix)
- **Boss health bar no longer overlaps the HP and ammo readout on touch screens** (`style.css`)
  - On phones the HUD keeps health and ammo across the top, which is where the boss bar used to sit. In touch mode the bar now goes at the bottom centre, between the left fire button and the right-hand buttons.
  - Checked at two phone sizes: the bar overlaps no button and no HUD block. Keyboard and controller layouts are unchanged.

## 2026-10-14 (store screenshots)
- **Play Store screenshots** (`docs/screenshots/`, `docs/play-store-listing.md`)
  - Four 1920 x 1080 PNGs (no transparency, under 3 MB each) from the real game with touch controls showing: `01-firefight`, `02-sniper-scope`, `03-rooftop-fight`, `04-online-lobby`.
  - Taken in a headless browser at phone size; the online lobby uses two test browsers.

## 2026-10-14 (privacy details)
- **Privacy policy filled in** (`privacy.html`, `docs/play-store-listing.md`, `docs/PLAY_STORE.md`)
  - Maker name, contact email and host (Vercel) added to the privacy page; the contact email is also in the listing doc. The email is now public on the page.
  - Still to fill later: the website and final privacy policy address in the listing doc, once the game has a live address.

## 2026-10-14 (feature graphic)
- **Play Store feature graphic** (`docs/feature-graphic.svg`, `docs/feature-graphic-1024x500.png`, `docs/play-store-listing.md`)
  - 1024 x 500 PNG (no transparency) in the game's ballpoint-on-notebook-paper style: the Pen & Pin title with a red push pin, the tagline, and a rooftop scene with a player swinging on the grapple and lining up an enemy doodle.
  - The SVG is the editable source. Checklist in the listing doc updated.

## 2026-10-14 (Play Store prep)
- **Privacy policy and Play Store packaging files** (`privacy.html`, `play/twa-manifest.json`, `.well-known/assetlinks.json`, `docs/PLAY_STORE.md`, `docs/play-store-listing.md`, `index.html`, `install.html`, `sw.js`, `.gitignore`, `.dockerignore`, `README.md`)
  - `privacy.html`: a plain-language policy written from what the game really does (no accounts, ads or analytics; settings stay on the device; online play shares your display name and network address with other players and uses a matchmaking server, STUN servers and a relay). Three highlighted placeholders to fill in: your name or company, contact email, and web host.
  - `play/twa-manifest.json`: settings for building the Android app with Bubblewrap (package id `com.penandpin.game` is a placeholder, host needs replacing).
  - `.well-known/assetlinks.json`: placeholder for the site-to-app link that hides the browser bar; needs the signing key fingerprint.
  - `docs/PLAY_STORE.md`: step-by-step guide from account to release, with the Data safety and content rating answers.
  - `docs/play-store-listing.md`: ready-to-paste app name, short and full description, release notes.
  - Privacy policy linked from the welcome screen and install page; added to the offline cache list.
  - Signing keys and build output (`*.keystore`, `*.jks`, `*.aab`, `*.apk`) are git-ignored; `play/` and `docs/` are left out of the Docker image.

## 2026-10-14 (rename)
- **Game renamed from Doodle District to Pen & Pin; the map is now Pen & Pin Central** (`index.html`, `install.html`, `manifest.webmanifest`, `sw.js`, `src/main.js`, `src/level.js`, `src/net.js`, `README.md`, `Dockerfile`, `icons/icon.svg`)
  - New name on the welcome screen, main menu, page titles, install page, installed app name, README, Dockerfile comment and icon comment.
  - The map is called PEN & PIN CENTRAL (map screen and menu).
  - Online lobby ids now start with `penandpin-` (they used `doodledistrict-`), so players on an old cached version cannot join new lobbies until they refresh.
  - The offline cache is now `pen-and-pin-v1`, so phones fetch a fresh copy.
  - Kept as they were: saved settings keys (`doodle_*`, so players keep their settings), the other maps' names (Doodle Nairobi and so on, which are off the menu) and the older changelog entries below.

## 2026-10-14 (online play fix)
- **Online connections now work across mobile data and strict networks** (`net-config.js`, `src/net.js`, `index.html`, `sw.js`, `README.md`)
  - Found: lobby, join and match start all work (tested with two browsers on a local PeerJS server), but players were only given STUN, with no relay. Behind mobile carrier or strict wifi NAT, WebRTC cannot connect without a relay, so joins failed.
  - New `net-config.js` holds relay (TURN) servers, defaulting to the free public Open Relay demo servers, and an optional own matchmaking server.
  - Join and quick-play waits are a little longer, since a relayed connection takes longer to set up.
  - `net-config.js` added to the offline cache list.

## 2026-10-14 (welcome screen)
- **Welcome screen is now the first thing people see** (`index.html`)
  - Two choices: DOWNLOAD FOR ANDROID or PLAY IN BROWSER.
  - Download: on Chrome for Android it opens the install prompt straight away; otherwise it shows the install steps, plus a QR code when opened on a computer.
  - Skipped when the game is already installed, or after a choice in the same browser session. `#play` on the address skips it too.

## 2026-10-14 (install link)
- **Main menu now links to the QR install page** (`src/main.js`, `style.css`)
  - New GET THE APP button next to VIEW MAP opens `install.html`.
  - VIEW MAP subtitle no longer mentions the real CBD, since District is the only map.

## 2026-10-14 (install page)
- **QR code page so people can get the game on Android** (`install.html`, `vendor/qrcode/`, `sw.js`, `README.md`)
  - New `install.html`: a QR code that opens the game, three install steps for Chrome on Android, and an "Install on this phone" button where Chrome offers it.
  - The code points at the folder the page is served from; the address can be edited on the page or set with `?url=`.
  - Warns when opened from localhost, since a phone cannot reach that.
  - Added the qrcode-generator library (MIT, v1.4.4) under `vendor/qrcode/`, and both new files to the offline cache list.

## 2026-10-14 (District upgrade)
- **Doodle District is now the one map, with mobile-shooter-style cover** (`src/level.js`, `src/main.js`)
  - Menu offers only Doodle District and it is the default. Nairobi, Mexico and the Depot map are still in the code, just off the menu.
  - Match arena: the empty field now has a painted centre zone with a flag and four barriers to fight over.
  - Match arena: a middle band of containers, barriers, wrecked cars and crates, mirrored on both sides, to break up long sight lines.
  - Match arena: a south yard with stacked containers, wrecks and barriers around a clear middle lane, plus a few more health pickups.
  - Fixed a health pickup that was stuck inside a crate in the east warehouse.

## 2026-10-14 (map)
- **New map: Doodle Depot, a Call of Duty Mobile-inspired container yard** (`src/level.js`, `src/main.js`, `README.md`)
  - Small, mirrored map so both ends are fair: three lanes, a central tower with stairs on both sides and a roof perch.
  - Two warehouses open to the middle with side doors and climbable roofs; stacked containers, barriers and crates for cover.
  - Two gantry cranes and stacked-container tops give the grapple hook plenty to bite.
  - Match spawns at both ends and on the roofs; solo enemies come from the corners and lane ends.
  - It is now the first map on the menu and the default. Nairobi, District and the others are still there.

## 2026-10-14
- **Sniper scope looks more like a real sniper view** (`style.css`, `src/hud.js`, `src/weapons.js`)
  - Reticle now has mil-dot tick marks along the crosshair.
  - Darker blue vignette around the edge of the lens.
  - Firing the sniper while scoped jolts the sight picture down and then settles it (`scopeKick()` in the HUD).
- **Touch controls reworked to a mobile-shooter layout** (`src/touch.js`, `style.css`, `src/hud.js`)
  - Big FIRE button under the right thumb; a second, smaller FIRE button on the left above the thumbstick.
  - AIM is now a SCOPE button that toggles: tap to aim, tap again to let go (it used to be hold).
  - JUMP and SLIDE moved to the bottom-right corner; RELOAD and SWAP sit beside the fire button.
  - NADE, SLASH and HOOK sit above the fire button; DASH appears above them when the katana gauge is lit.
  - Help screen text updated for the new buttons.
  - Fixed a class-name clash: the button uses `.ads`, because `.scope` is the sniper-scope overlay.
  - Added this changelog.

## 2026-09-26
- Installable web app (PWA) with touch controls for phones.
- Minimap: building outlines, only the markers that matter.
- HUD cleanup: graphite ink, paper halo, weapon card, clear tips.
- Every surface is shaded: light hatch on lit walls, seamless hatch spacing.
- Colour rules and distance-weighted ink lines.
- OpenStreetMap pipeline for Doodle Nairobi with a rotated street grid.

## 2026-09-20
- First attempt at the Nairobi map.

## 2026-09-16
- Initial game, language fix, bombs, boxing gloves, cars, planes, a map, and deployment setup.
- Final Copilot pass.
