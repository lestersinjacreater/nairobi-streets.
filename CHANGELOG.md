# Changelog

Every code change, newest first. Add an entry here with each change.

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
