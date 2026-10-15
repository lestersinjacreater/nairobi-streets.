// On-screen touch controls for phones and tablets. They feed the same named actions the keyboard,
// mouse and gamepad do (see input.js), so the game itself never knows the difference.
//   left side of the screen: a floating thumbstick (push it all the way to sprint)
//   right side: drag anywhere to look; buttons for everything else
// Fire, aim and the grapple also turn the camera while held, so you can track a target with the
// same thumb that is shooting.

// Layout follows the usual mobile-shooter pattern: a big fire button under the right thumb, a second
// fire button on the left above the thumbstick (so you can shoot without leaving the stick), a scope
// button beside the fire button, jump and slide in the bottom-right corner, small extras around them.
// Positions and sizes are in vmin, from the bottom-right corner (r) or the bottom-left corner (l).
// toggle: tapping flips the action on and off, instead of holding it.
const BUTTONS = [
  { a: 'fire', label: 'FIRE', r: 8, b: 20, s: 21, look: true, cls: 'fire' },
  { a: 'fire', label: 'FIRE', l: 4, b: 38, s: 15, look: true, cls: 'fire small' },
  { a: 'aim', label: 'SCOPE', r: 31, b: 30, s: 12, look: true, toggle: true, cls: 'ads' },
  { a: 'jump', label: 'JUMP', r: 3, b: 3, s: 14 },
  { a: 'crouch', label: 'SLIDE', r: 19, b: 3, s: 11 },
  { a: 'reload', label: 'RELOAD', r: 31, b: 14, s: 10 },
  { a: 'nextWeapon', label: 'SWAP', r: 44, b: 18, s: 10 },
  { a: 'grenade', label: 'NADE', r: 3, b: 43, s: 10.5 },
  { a: 'melee', label: 'SLASH', r: 16, b: 44, s: 10.5 },
  { a: 'grapple', label: 'HOOK', r: 29, b: 44, s: 12.5, look: true, cls: 'hook' },
  { a: 'dash', label: 'DASH', r: 33, b: 58, s: 11, cls: 'dash' },
];
const STICK_ZONE = 0.45; // left share of the screen that grabs the thumbstick
const STICK_R = 11;      // thumbstick travel, vmin

export class TouchControls {
  constructor(input) {
    this.input = input;
    const t = input.touch;
    const el = this.el = document.createElement('div'); el.id = 'touch'; el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `<div class="tstick"><i></i></div>
      <div class="tslots">${[1, 2, 3].map((n) => `<button type="button" class="tbtn tslot" data-a="slot${n}" data-look="0" data-toggle="0"><b></b><i></i></button>`).join('')}</div>
      <button type="button" class="tbtn tpause" data-a="pause">II</button>
      ${BUTTONS.map((b) => `<button type="button" class="tbtn ${b.cls || ''}" data-a="${b.a}" data-look="${b.look ? 1 : 0}" data-toggle="${b.toggle ? 1 : 0}" style="${b.l != null ? 'left:' + b.l : 'right:' + b.r}vmin;bottom:${b.b}vmin;width:max(${b.s}vmin,44px);height:max(${b.s}vmin,44px);font-size:${(b.s * 0.24).toFixed(2)}vmin">${b.label}</button>`).join('')}`;
    document.body.appendChild(el);
    this.stick = el.querySelector('.tstick'); this.knob = this.stick.querySelector('i');
    this.ptrs = new Map();
    this.scoped = null; // the scope button while it is toggled on // pointerId -> { kind: 'stick' | 'look' | 'btn', ... }
    this.active = false;

    const vmin = () => Math.min(window.innerWidth, window.innerHeight) / 100;
    el.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse') return;
      e.preventDefault(); try { el.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      const btn = e.target.closest('.tbtn');
      if (btn) {
        const a = btn.dataset.a, toggle = btn.dataset.toggle === '1';
        if (toggle && this.scoped === btn) { // second tap lets the scope go
          this.scoped = null; t.down[a] = Math.max(0, (t.down[a] || 0) - 1); btn.classList.remove('on');
          this.ptrs.set(e.pointerId, { kind: 'btn', a, btn, toggle, off: true, look: false, x: e.clientX, y: e.clientY });
        } else {
          t.down[a] = (t.down[a] || 0) + 1; t.tap[a] = true; btn.classList.add('on'); if (toggle) this.scoped = btn;
          this.ptrs.set(e.pointerId, { kind: 'btn', a, btn, toggle, look: btn.dataset.look === '1', x: e.clientX, y: e.clientY });
        }
      } else if (e.clientX < window.innerWidth * STICK_ZONE) {
        this.ptrs.set(e.pointerId, { kind: 'stick', ox: e.clientX, oy: e.clientY });
        this.stick.style.left = e.clientX + 'px'; this.stick.style.top = e.clientY + 'px'; this.stick.classList.add('on');
        this.knob.style.transform = 'translate(-50%, -50%)';
      } else this.ptrs.set(e.pointerId, { kind: 'look', x: e.clientX, y: e.clientY });
    });
    el.addEventListener('pointermove', (e) => {
      const p = this.ptrs.get(e.pointerId); if (!p) return;
      if (p.kind === 'stick') {
        const R = STICK_R * vmin(); let dx = e.clientX - p.ox, dy = e.clientY - p.oy; const d = Math.hypot(dx, dy);
        if (d > R) { dx *= R / d; dy *= R / d; }
        t.move.x = dx / R; t.move.y = -dy / R;
        this.knob.style.transform = `translate(calc(-50% + ${dx.toFixed(1)}px), calc(-50% + ${dy.toFixed(1)}px))`;
      } else if (p.kind === 'look' || p.look) {
        t.look.x += e.clientX - p.x; t.look.y += e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
      }
    });
    const end = (e) => {
      const p = this.ptrs.get(e.pointerId); if (!p) return; this.ptrs.delete(e.pointerId);
      if (p.kind === 'stick') { t.move.x = 0; t.move.y = 0; this.stick.classList.remove('on'); }
      if (p.kind === 'btn' && p.toggle) return; // a toggled button stays on until it is tapped again
      if (p.kind === 'btn') { t.down[p.a] = Math.max(0, (t.down[p.a] || 0) - 1); if (!t.down[p.a]) p.btn.classList.remove('on'); }
    };
    el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end); el.addEventListener('lostpointercapture', end);
    el.addEventListener('contextmenu', (e) => e.preventDefault());
  }
  // the three gun chips along the top: name and ammo, the one in your hands marked. Tap one to switch to it.
  setSlots(list) {
    const key = list.map((s) => s.name + '|' + (s.active ? 1 : 0) + '|' + s.ammo).join(';'); if (key === this._slotKey) return; this._slotKey = key;
    this.el.querySelectorAll('.tslot').forEach((btn, i) => { const s = list[i]; if (!s) return; btn.querySelector('b').textContent = s.name; btn.querySelector('i').textContent = s.ammo; btn.classList.toggle('active', !!s.active); btn.classList.toggle('empty', !!s.empty); });
  }
  // shown only while playing on a touch device; hiding it lets every held control go
  setActive(on) {
    if (on === this.active) return; this.active = on; this.el.classList.toggle('on', on);
    if (!on) { const t = this.input.touch; this.ptrs.clear(); this.scoped = null; t.down = {}; t.move.x = 0; t.move.y = 0; this.stick.classList.remove('on'); for (const b of this.el.querySelectorAll('.tbtn.on')) b.classList.remove('on'); }
  }
}
