// The armoury: every gun in the game, as plain data (no three.js here, so the loadout screen and the tests can use it).
//
// ORDER MATTERS. The position of a weapon in ARSENAL is what is sent to other players online ("which gun is that
// player holding?"), so the first ten entries are frozen in the order older versions used, and new guns are only
// ever added on the END of the list. Never reorder or delete an entry.
//
// Each gun has: id, name, cls (the loadout filter), prop (the model other players see in your hands), sfx (the sound
// other players hear) and stats (everything weapons.js needs to make it behave). Hand-built guns have full `stats`;
// the newer ones are written as a short spec and expanded by expand() below.

export const CLASSES = ['Pistol', 'SMG', 'Assault rifle', 'Shotgun', 'Sniper', 'LMG', 'Rotary'];

// full stats for the guns that were built by hand (shell colours are names; weapons.js turns them into ink)
const RAW = {
  rifle: { name: 'RIFLE', hint: 'full auto · put the red dot on them', kind: 'rifle', magSize: 35, reserve: 175, maxReserve: 350, interval: 1 / 11, damage: 24, headMul: 2.6, pellets: 1, spread: 0.016, adsSpread: 0.0034, spreadKick: 0.009, spreadMax: 0.075, adsFov: 58, sight: [0, 0.12, -0.05, 0.3], camKick: [0.009, 0.0034], modelKick: [0.25, 0.3, 2.4, -3.2, 0.9, 1.2], fovKick: 1.2, reloadDur: 1.45, reloadType: 'mag', auto: true, falloff: null, tracer: 0.02, flashScale: 1, sound: 'shot', shell: [0.02, 'orange'], moveSpread: 0.0012, pvp: [19, 1.8, null]  },
  shotgun: { name: 'SHOTGUN', hint: 'pump action · devastating up close', kind: 'shotgun', magSize: 6, reserve: 36, maxReserve: 72, interval: 0.78, damage: 19, headMul: 1.8, pellets: 10, spread: 0.062, adsSpread: 0.034, spreadKick: 0, spreadMax: 0.1, adsFov: 68, sight: [0, 0.095, -1.0, 0.52], camKick: [0.05, 0.012], modelKick: [0.4, 0.6, 5, -9, 2, 3], fovKick: 4, reloadDur: 0.45, reloadType: 'shells', auto: false, falloff: [11, 32, 0.22], tracer: 0.014, flashScale: 1.9, sound: 'shotgunFire', shell: [0.035, 'red'], moveSpread: 0.0006, cycleDur: 0.45, pvp: [16, 1.6, [9, 26, 0.15]]  },
  sniper: { name: 'SNIPER', hint: 'bolt action · one shot, one erase', kind: 'sniper', scope: true, magSize: 5, reserve: 25, maxReserve: 50, interval: 0.2, damage: 150, headMul: 3, pellets: 1, spread: 0.075, adsSpread: 0.0004, spreadKick: 0.05, spreadMax: 0.14, adsFov: 20, sight: [0, 0.135, 0, 0.42], camKick: [0.055, 0.008], modelKick: [0.25, 0.8, 4.5, -11, 1.2, 2], fovKick: 4.5, reloadDur: 2.1, reloadType: 'mag', auto: false, falloff: null, tracer: 0.03, flashScale: 1.7, sound: 'sniperFire', shell: [0.03, 'orange'], moveSpread: 0.004, cycleDur: 0.85, pvp: [150, 1.5, null]  },
  machinegun: { name: 'M31', hint: 'machine gun · belt-fed, hold fire and hose them down', kind: 'machinegun', magSize: 100, reserve: 200, maxReserve: 400, interval: 1 / 16, damage: 14, headMul: 2.0, pellets: 1, spread: 0.028, adsSpread: 0.008, spreadKick: 0.0055, spreadMax: 0.11, adsFov: 62, sight: [0, 0.12, -0.05, 0.3], camKick: [0.0075, 0.0045], modelKick: [0.3, 0.35, 2.8, -3.6, 1.1, 1.4], fovKick: 1.0, reloadDur: 3.3, reloadType: 'mag', auto: true, falloff: [22, 58, 0.5], tracer: 0.022, flashScale: 1.15, sound: 'machineGun', shell: [0.02, 'orange'], moveSpread: 0.002, pvp: [12, 1.7, [18, 48, 0.4]]  },
  m134: { name: 'M134 MINIGUN', hint: 'rotary · 7.62 mm · spins up, then shreds', kind: 'm134', rotary: true, magSize: 200, reserve: 400, maxReserve: 600, interval: 1 / 30, damage: 9, headMul: 1.6, pellets: 1, spread: 0.045, adsSpread: 0.018, spreadKick: 0.002, spreadMax: 0.1, adsFov: 70, sight: [0, 0.14, -0.1, 0.32], camKick: [0.0035, 0.0025], modelKick: [0.12, 0.15, 1.2, -1.6, 0.5, 0.7], fovKick: 0.5, reloadDur: 4.2, reloadType: 'mag', auto: true, falloff: [28, 70, 0.5], tracer: 0.02, flashScale: 1.0, sound: 'minigunFire', shell: null, moveSpread: 0.0025, spinUp: 0.7, moveMul: 0.55, carry: true, fxEvery: 3, pvp: [6.5, 1.5, [22, 55, 0.4]]  },
  gau19: { name: 'GAU-19', hint: 'rotary · 12.7 mm · heavy rounds, slower spin', kind: 'gau19', rotary: true, magSize: 120, reserve: 240, maxReserve: 360, interval: 1 / 22, damage: 15, headMul: 1.7, pellets: 1, spread: 0.04, adsSpread: 0.016, spreadKick: 0.003, spreadMax: 0.095, adsFov: 70, sight: [0, 0.15, -0.1, 0.32], camKick: [0.005, 0.0032], modelKick: [0.18, 0.22, 1.8, -2.2, 0.7, 0.9], fovKick: 0.7, reloadDur: 4.6, reloadType: 'mag', auto: true, falloff: [30, 80, 0.5], tracer: 0.03, flashScale: 1.2, sound: 'minigunFire', shell: null, moveSpread: 0.0025, spinUp: 0.9, moveMul: 0.5, carry: true, fxEvery: 2, pvp: [10, 1.6, [24, 60, 0.4]]  },
  yakb: { name: 'YAK-B 12.7', hint: 'rotary · 12.7 mm · the fastest, and the slowest to spin', kind: 'yakb', rotary: true, magSize: 150, reserve: 300, maxReserve: 450, interval: 1 / 36, damage: 12, headMul: 1.6, pellets: 1, spread: 0.05, adsSpread: 0.02, spreadKick: 0.0022, spreadMax: 0.11, adsFov: 72, sight: [0, 0.15, -0.1, 0.32], camKick: [0.0042, 0.003], modelKick: [0.15, 0.2, 1.5, -2, 0.6, 0.8], fovKick: 0.6, reloadDur: 5.0, reloadType: 'mag', auto: true, falloff: [26, 66, 0.45], tracer: 0.028, flashScale: 1.15, sound: 'minigunFire', shell: null, moveSpread: 0.003, spinUp: 1.3, moveMul: 0.45, carry: true, fxEvery: 4, pvp: [8.5, 1.5, [22, 55, 0.4]]  },
  gshg: { name: 'GSHG-7.62', hint: 'rotary · 7.62 mm · light, quick to spin', kind: 'gshg', rotary: true, magSize: 100, reserve: 300, maxReserve: 400, interval: 1 / 28, damage: 8, headMul: 1.6, pellets: 1, spread: 0.042, adsSpread: 0.016, spreadKick: 0.002, spreadMax: 0.095, adsFov: 68, sight: [0, 0.14, -0.1, 0.3], camKick: [0.003, 0.0022], modelKick: [0.1, 0.13, 1.0, -1.4, 0.45, 0.6], fovKick: 0.45, reloadDur: 3.0, reloadType: 'mag', auto: true, falloff: [24, 62, 0.45], tracer: 0.019, flashScale: 0.95, sound: 'minigunFire', shell: null, moveSpread: 0.002, spinUp: 0.45, moveMul: 0.65, carry: true, fxEvery: 3, pvp: [6, 1.5, [20, 52, 0.4]]  },
  revolver: { name: 'REVOLVER', hint: 'hand cannon · headshots erase', kind: 'revolver', magSize: 6, reserve: 36, maxReserve: 72, interval: 0.3, damage: 62, headMul: 3, pellets: 1, spread: 0.006, adsSpread: 0.002, spreadKick: 0.02, spreadMax: 0.06, adsFov: 52, sight: [0, 0.08, -0.34, 0.42], camKick: [0.038, 0.007], modelKick: [0.3, 0.9, 3.2, -10, 1.5, 2.5], fovKick: 2.5, reloadDur: 1.9, reloadType: 'cylinder', auto: false, falloff: null, tracer: 0.026, flashScale: 1.35, sound: 'revolver', shell: null, moveSpread: 0.0015, pvp: [52, 2.9, [9, 34, 0.42]]  },
};

// a short spec becomes a full stats object. rate = shots a second (a semi-auto gun's best rate), dmg = per bullet or pellet,
// kick = how hard it climbs, spread = hip-fire cone (radians), range = [full damage until, none left by, minimum share].
function expand(s) {
  const auto = s.auto !== false, kick = s.kick ?? 0.009, res = s.res ?? s.mag * 5, head = s.head ?? 1.8;
  return {
    name: s.name, hint: s.hint || (auto ? 'full auto' : 'semi-auto'), kind: s.id, family: s.family, look: s.look, scope: !!s.scope,
    magSize: s.mag, reserve: res, maxReserve: res * 2, interval: 1 / s.rate, damage: s.dmg, headMul: head, pellets: s.pellets || 1,
    spread: s.spread, adsSpread: s.ads ?? s.spread * 0.22, spreadKick: s.sk ?? s.spread * (auto ? 0.45 : 0.9), spreadMax: s.spread * 4.5,
    adsFov: s.fov ?? 60, sight: s.sight ?? [0, 0.12, -0.05, 0.3], camKick: [kick, kick * 0.38],
    modelKick: [0.1 + kick * 18, 0.1 + kick * 22, 1 + kick * 180, -(1 + kick * 260), 0.4 + kick * 90, 0.5 + kick * 110], fovKick: 0.4 + kick * 90,
    reloadDur: s.reload, reloadType: 'mag', auto, falloff: s.range || null, tracer: s.tracer ?? 0.02, flashScale: s.flash ?? 1,
    sound: s.sound || 'shot', shell: s.noShell ? null : [s.shellSize ?? 0.02, 'orange'], moveSpread: s.mv ?? 0.0013,
    carry: auto, cycleDur: s.cycle, pvp: [s.pvp ?? s.dmg * 0.8, head, s.range ? [s.range[0] * 0.8, s.range[1] * 0.8, s.range[2]] : null],
  };
}

// the models: look = { len (receiver), guard, bar (barrel), br (barrel radius), stock, mag, magH, sight, grip, bolt, bipod, pos }
const PISTOL = { len: 0.26, guard: 0, bar: 0.16, br: 0.02, stock: 0, mag: 'grip', magH: 0.16, sight: 'iron', pos: [0.17, -0.19, -0.3] };
const SMG = { len: 0.4, guard: 0.14, bar: 0.18, br: 0.02, stock: 0.2, mag: 'stick', magH: 0.2, sight: 'dot' };
const AR = { len: 0.5, guard: 0.34, bar: 0.4, br: 0.018, stock: 0.3, mag: 'stick', magH: 0.2, sight: 'dot' };
const BR = { len: 0.5, guard: 0.3, bar: 0.46, br: 0.02, stock: 0.34, mag: 'box', magH: 0.18, sight: 'dot' };
const SG = { len: 0.46, guard: 0.3, bar: 0.5, br: 0.026, stock: 0.34, mag: 'box', magH: 0.1, sight: 'bead' };
const SNP = { len: 0.5, guard: 0.3, bar: 0.7, br: 0.02, stock: 0.4, mag: 'stick', magH: 0.14, sight: 'scope', bolt: true };
const LMG = { len: 0.6, guard: 0.4, bar: 0.5, br: 0.024, stock: 0.34, mag: 'box', magH: 0.24, sight: 'dot', bipod: true };

const SPECS = [
  // ---- pistols ----
  { id: 'quill9', name: 'QUILL 9', cls: 'Pistol', prop: 'pistol', family: 'pistol', hint: 'light 9 mm · quick and accurate', dmg: 20, rate: 8, mag: 15, spread: 0.012, ads: 0.004, kick: 0.012, reload: 1.2, auto: false, fov: 64, head: 2.2, look: PISTOL },
  { id: 'm1911', name: 'M1911', cls: 'Pistol', prop: 'pistol', family: 'pistol', hint: 'big .45 · slow, hard-hitting', dmg: 38, rate: 5, mag: 7, spread: 0.01, ads: 0.003, kick: 0.022, reload: 1.5, auto: false, fov: 62, head: 2.6, look: PISTOL, sound: 'revolver' },
  { id: 'stapler', name: 'STAPLER', cls: 'Pistol', prop: 'pistol', family: 'pistol', hint: 'machine pistol · empties in a blink', dmg: 10, rate: 18, mag: 25, spread: 0.03, ads: 0.012, kick: 0.006, reload: 1.5, fov: 64, range: [12, 32, 0.4], look: { ...PISTOL, bar: 0.2, mag: 'stick', magH: 0.2 } },
  // ---- SMGs ----
  { id: 'mac10', name: 'MAC-10', cls: 'SMG', prop: 'rifle', family: 'smg', hint: 'spits lead · wild at range', dmg: 9, rate: 20, mag: 32, spread: 0.036, ads: 0.014, kick: 0.006, reload: 1.6, fov: 64, range: [12, 34, 0.4], look: { ...SMG, stock: 0.08, bar: 0.12 } },
  { id: 'tommy', name: 'TOMMY GUN', cls: 'SMG', prop: 'rifle', family: 'smg', hint: 'drum-fed · steady and loud', dmg: 14, rate: 13, mag: 50, spread: 0.028, ads: 0.01, kick: 0.009, reload: 2.4, fov: 62, range: [16, 40, 0.5], look: { ...SMG, mag: 'drum', magH: 0.22, stock: 0.3, guard: 0.2 } },
  { id: 'pencil', name: 'PENCIL SMG', cls: 'SMG', prop: 'rifle', family: 'smg', hint: 'sharp and light', dmg: 11, rate: 16, mag: 30, spread: 0.026, ads: 0.009, kick: 0.007, reload: 1.5, fov: 62, range: [16, 40, 0.45], look: SMG },
  { id: 'highlighter', name: 'HIGHLIGHTER PDW', cls: 'SMG', prop: 'rifle', family: 'smg', hint: 'tight spray · reaches further', dmg: 12, rate: 15, mag: 40, spread: 0.02, ads: 0.007, kick: 0.007, reload: 1.8, fov: 60, range: [20, 48, 0.5], look: { ...SMG, len: 0.46, bar: 0.22, sight: 'dot' } },
  // ---- assault rifles ----
  { id: 'ak47', name: 'AK-47', cls: 'Assault rifle', prop: 'rifle', family: 'rifle', hint: 'hits hard · kicks harder', dmg: 29, rate: 9, mag: 30, spread: 0.02, ads: 0.005, kick: 0.014, reload: 1.8, fov: 58, look: { ...AR, mag: 'banana', magH: 0.24, sight: 'iron' } },
  { id: 'm16', name: 'M16', cls: 'Assault rifle', prop: 'rifle', family: 'rifle', hint: 'accurate and calm', dmg: 22, rate: 10.5, mag: 30, spread: 0.014, ads: 0.003, kick: 0.008, reload: 1.6, fov: 58, look: { ...AR, len: 0.5, bar: 0.5, guard: 0.34, sight: 'iron' } },
  { id: 'm4', name: 'M4', cls: 'Assault rifle', prop: 'rifle', family: 'rifle', hint: 'short, fast to aim, quick fire', dmg: 20, rate: 12, mag: 30, spread: 0.016, ads: 0.0035, kick: 0.007, reload: 1.5, fov: 56, look: { ...AR, bar: 0.3, guard: 0.28, stock: 0.26 } },
  { id: 'fal', name: 'FAL', cls: 'Assault rifle', prop: 'rifle', family: 'rifle', hint: 'battle rifle · one bullet at a time', dmg: 40, rate: 6, mag: 20, spread: 0.014, ads: 0.003, kick: 0.017, reload: 1.9, auto: false, fov: 54, head: 2.4, look: { ...BR, sight: 'iron' } },
  { id: 'g3', name: 'G3', cls: 'Assault rifle', prop: 'rifle', family: 'rifle', hint: 'heavy rounds · full auto', dmg: 33, rate: 7.5, mag: 20, spread: 0.019, ads: 0.0045, kick: 0.016, reload: 2.0, fov: 56, look: { ...BR, mag: 'stick', sight: 'iron' } },
  { id: 'ballpoint', name: 'BALLPOINT AR', cls: 'Assault rifle', prop: 'rifle', family: 'rifle', hint: 'the all-rounder', dmg: 23, rate: 11, mag: 36, spread: 0.016, ads: 0.0034, kick: 0.009, reload: 1.6, fov: 58, look: { ...AR, mag: 'box', magH: 0.2 } },
  { id: 'marker', name: 'MARKER CARBINE', cls: 'Assault rifle', prop: 'rifle', family: 'rifle', hint: 'compact · big magazine', dmg: 17, rate: 13, mag: 40, spread: 0.022, ads: 0.006, kick: 0.007, reload: 1.7, fov: 60, range: [24, 56, 0.5], look: { ...AR, bar: 0.26, guard: 0.24, stock: 0.22, mag: 'box' } },
  // ---- shotguns ----
  { id: 'sawedoff', name: 'SAWED-OFF', cls: 'Shotgun', prop: 'shotgun', family: 'shotgun', hint: 'two shells · brutal up close', dmg: 21, pellets: 9, rate: 3, mag: 2, res: 24, spread: 0.075, ads: 0.04, kick: 0.04, reload: 1.8, auto: false, fov: 68, head: 1.6, range: [7, 20, 0.15], look: { ...SG, bar: 0.26, guard: 0.1, stock: 0.2, len: 0.36 }, sound: 'shotgunFire', tracer: 0.014, flash: 1.8 },
  { id: 'auto12', name: 'AUTO-12', cls: 'Shotgun', prop: 'shotgun', family: 'shotgun', hint: 'full-auto shotgun', dmg: 11, pellets: 8, rate: 4.5, mag: 10, res: 40, spread: 0.06, ads: 0.034, kick: 0.025, reload: 2.7, fov: 66, head: 1.5, range: [9, 26, 0.2], look: { ...SG, mag: 'drum', magH: 0.14 }, sound: 'shotgunFire', tracer: 0.014, flash: 1.5 },
  { id: 'combat', name: 'COMBAT SHOTGUN', cls: 'Shotgun', prop: 'shotgun', family: 'shotgun', hint: 'eight shells, fast pump', dmg: 16, pellets: 9, rate: 2.4, mag: 8, res: 40, spread: 0.058, ads: 0.032, kick: 0.035, reload: 2.8, auto: false, fov: 66, head: 1.7, range: [10, 28, 0.18], look: { ...SG, len: 0.5, guard: 0.34 }, sound: 'shotgunFire', tracer: 0.014, flash: 1.6 },
  // ---- snipers ----
  { id: 'svd', name: 'DRAGUNOV SVD', cls: 'Sniper', prop: 'sniper', family: 'sniper', hint: 'semi-auto marksman rifle', dmg: 88, rate: 2.2, mag: 10, res: 50, spread: 0.07, ads: 0.0006, kick: 0.03, reload: 2.4, auto: false, scope: true, fov: 26, head: 2.6, sight: [0, 0.135, 0, 0.42], look: { ...SNP, bolt: false }, sound: 'sniperFire', tracer: 0.028, flash: 1.5, mv: 0.004 },
  { id: 'mosin', name: 'MOSIN', cls: 'Sniper', prop: 'sniper', family: 'sniper', hint: 'bolt action · iron sights', dmg: 130, rate: 1.1, mag: 5, res: 30, spread: 0.06, ads: 0.0012, kick: 0.05, reload: 2.6, auto: false, fov: 42, head: 2.8, cycle: 0.95, look: { ...SNP, sight: 'iron' }, sound: 'sniperFire', tracer: 0.028, flash: 1.6, pvp: 118 },
  { id: 'm82', name: 'M82', cls: 'Sniper', prop: 'sniper', family: 'sniper', hint: '.50 cal · one shot, one erase', dmg: 210, rate: 0.9, mag: 5, res: 20, spread: 0.09, ads: 0.0004, kick: 0.07, reload: 3.4, auto: false, scope: true, fov: 16, head: 2.0, cycle: 1.1, sight: [0, 0.135, 0, 0.42], look: { ...SNP, len: 0.56, bar: 0.8, br: 0.026 }, sound: 'sniperFire', tracer: 0.036, flash: 2.0, mv: 0.005, pvp: 140 },
  // ---- LMGs ----
  { id: 'm249', name: 'M249', cls: 'LMG', prop: 'machinegun', family: 'machinegun', hint: 'belt-fed squad gun', dmg: 18, rate: 13, mag: 150, res: 300, spread: 0.03, ads: 0.01, kick: 0.007, reload: 4.2, fov: 62, range: [24, 60, 0.5], look: LMG, sound: 'machineGun', tracer: 0.022, flash: 1.15, mv: 0.002 },
  { id: 'm60', name: 'M60', cls: 'LMG', prop: 'machinegun', family: 'machinegun', hint: 'slower, heavier hits', dmg: 25, rate: 9.5, mag: 100, res: 200, spread: 0.028, ads: 0.009, kick: 0.01, reload: 4.5, fov: 62, range: [26, 64, 0.5], look: { ...LMG, len: 0.64 }, sound: 'machineGun', tracer: 0.024, flash: 1.2, mv: 0.002 },
  { id: 'mg42', name: 'MG42', cls: 'LMG', prop: 'machinegun', family: 'machinegun', hint: 'the buzzsaw · huge fire rate', dmg: 14, rate: 20, mag: 120, res: 240, spread: 0.04, ads: 0.014, kick: 0.007, reload: 4.0, fov: 64, range: [20, 52, 0.45], look: { ...LMG, bar: 0.56, guard: 0.46 }, sound: 'machineGun', tracer: 0.02, flash: 1.1, mv: 0.0022 },
  { id: 'pkm', name: 'PKM', cls: 'LMG', prop: 'machinegun', family: 'machinegun', hint: 'reliable all-rounder', dmg: 22, rate: 11, mag: 100, res: 200, spread: 0.03, ads: 0.01, kick: 0.009, reload: 4.4, fov: 62, range: [24, 60, 0.5], look: { ...LMG, bipod: true }, sound: 'machineGun', tracer: 0.022, flash: 1.15, mv: 0.002 },
];

// the registry. The first ten are frozen (older versions of the game know these positions); only ever append below.
export const ARSENAL = [
  { id: 'rifle', name: 'RIFLE', cls: 'Assault rifle', prop: 'rifle', sfx: 'rifle' },
  { id: 'shotgun', name: 'SHOTGUN', cls: 'Shotgun', prop: 'shotgun', sfx: 'shotgun' },
  { id: 'sniper', name: 'SNIPER', cls: 'Sniper', prop: 'sniper', sfx: 'sniper' },
  { id: 'katana', name: 'KATANA', cls: 'Melee', prop: 'blade', melee: true },
  { id: 'boxing', name: 'BOXING GLOVES', cls: 'Melee', prop: 'boxing', melee: true },
  { id: 'machinegun', name: 'M31', cls: 'LMG', prop: 'machinegun', sfx: 'machinegun' },
  { id: 'm134', name: 'M134 MINIGUN', cls: 'Rotary', prop: 'rotary', sfx: 'm134' },
  { id: 'gau19', name: 'GAU-19', cls: 'Rotary', prop: 'rotary', sfx: 'm134' },
  { id: 'yakb', name: 'YAK-B 12.7', cls: 'Rotary', prop: 'rotary', sfx: 'm134' },
  { id: 'gshg', name: 'GSHG-7.62', cls: 'Rotary', prop: 'rotary', sfx: 'm134' },
  { id: 'revolver', name: 'REVOLVER', cls: 'Pistol', prop: 'pistol', sfx: 'pistol' },
  ...SPECS.map((s) => ({ id: s.id, name: s.name, cls: s.cls, prop: s.prop, sfx: s.family })),
];

// stats for every gun, by id
export const GUN_STATS = {};
for (const k of Object.keys(RAW)) { const a = ARSENAL.find((x) => x.id === k); GUN_STATS[k] = { ...RAW[k], family: a.sfx === 'm134' ? 'rotary' : a.sfx, cls: a.cls, prop: a.prop }; }
for (const s of SPECS) GUN_STATS[s.id] = { ...expand(s), cls: s.cls, prop: s.prop };

export const ARSENAL_INDEX = Object.fromEntries(ARSENAL.map((a, i) => [a.id, i]));
export const ARSENAL_BY_ID = Object.fromEntries(ARSENAL.map((a) => [a.id, a]));
export const GUN_IDS = ARSENAL.filter((a) => !a.melee).map((a) => a.id);

// ---- the loadout: three guns, saved on this device ----
export const DEFAULT_LOADOUT = ['rifle', 'shotgun', 'sniper'];
const KEY = 'penandpin_loadout';
export function loadLoadout() {
  try { const a = JSON.parse(localStorage.getItem(KEY)); if (Array.isArray(a) && a.length === 3 && a.every((id) => GUN_STATS[id]) && new Set(a).size === 3) return a; } catch (e) { /* no saved loadout */ }
  return [...DEFAULT_LOADOUT];
}
export function saveLoadout(ids) { try { localStorage.setItem(KEY, JSON.stringify(ids)); } catch (e) { /* storage off: the loadout lasts until the page closes */ } }

// ---- stat bars for the loadout screen: each 0 to 100, scaled across the whole armoury ----
const raw = (g) => ({ damage: g.damage * g.pellets, rate: Math.min(1 / g.interval, 40), mag: g.magSize, range: g.falloff ? g.falloff[1] : (g.family === 'sniper' ? 130 : 90), control: 1 - Math.min(Math.max((g.spread - 0.005) / 0.075, 0), 1) });
const ALL = GUN_IDS.map((id) => raw(GUN_STATS[id]));
const MAX = { damage: Math.max(...ALL.map((a) => a.damage)), rate: Math.max(...ALL.map((a) => a.rate)), mag: Math.max(...ALL.map((a) => a.mag)), range: Math.max(...ALL.map((a) => a.range)) };
const sq = (v, m) => Math.round(Math.min(Math.sqrt(v / m), 1) * 100);
export function gunBars(id) { const a = raw(GUN_STATS[id]); return { damage: sq(a.damage, MAX.damage), rate: sq(a.rate, MAX.rate), mag: sq(a.mag, MAX.mag), range: sq(a.range, MAX.range), control: Math.round(a.control * 100) }; }
