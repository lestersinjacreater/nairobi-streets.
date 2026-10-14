# Changelog

Every code change, newest first. Add an entry here with each change.

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
