# Changelog

Every code change, newest first. Add an entry here with each change.

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
