// On-screen touch controls for phones and tablets. They feed the same named actions the keyboard,
// mouse and gamepad do (see input.js), so the game itself never knows the difference.
//   left side of the screen: a floating thumbstick (push it all the way to sprint)
//   right side: drag anywhere to look; buttons for everything else
// Fire, aim and the grapple also turn the camera while held, so you can track a target with the
// same thumb that is shooting.

// positions and sizes in vmin, measured from the bottom-right corner
const BUTTONS = [
  { a: 'fire', label: 'FIRE', r: 16, b: 19, s: 20, look: true, cls: 'fire' },
  { a: 'jump', label: 'JUMP', r: 2.5, b: 4, s: 14 },
  { a: 'crouch', label: 'SLIDE', r: 19, b: 2.5, s: 11 },
  { a: 'aim', label: 'AIM', r: 37, b: 6, s: 11, look: true },
  { a: 'reload', label: 'RELOAD', r: 37, b: 26, s: 10 },
  { a: 'grapple', label: 'HOOK', r: 2.5, b: 40, s: 13, look: true, cls: 'hook' },
  { a: 'melee', label: 'SLASH', r: 18, b: 44, s: 10.5 },
  { a: 'dash', label: 'DASH', r: 33, b: 48, s: 11, cls: 'dash' },
  { a: 'grenade', label: 'NADE', r: 2.5, b: 60, s: 10.5 },
  { a: 'nextWeapon', label: 'SWAP', r: 17, b: 60, s: 10 },
];
const STICK_ZONE = 0.45; // left share of the screen that grabs the thumbstick
const STICK_R = 11;      // thumbstick travel, vmin

export class TouchControls {
  constructor(input) {
    this.input = input;
    const t = input.touch;
    const el = this.el = document.createElement('div'); el.id = 'touch'; el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `<div class="tstick"><i></i></div>
      <button type="button" class="tbtn tpause" data-a="pause">II</button>
      ${BUTTONS.map((b) => `<button type="button" class="tbtn ${b.cls || ''}" data-a="${b.a}" data-look="${b.look ? 1 : 0}" style="right:${b.r}vmin;bottom:${b.b}vmin;width:${b.s}vmin;height:${b.s}vmin;font-size:${(b.s * 0.24).toFixed(2)}vmin">${b.label}</button>`).join('')}`;
    document.body.appendChild(el);
    this.stick = el.querySelector('.tstick'); this.knob = this.stick.querySelector('i');
    this.ptrs = new Map(); // pointerId -> { kind: 'stick' | 'look' | 'btn', ... }
    this.active = false;

    const vmin = () => Math.min(window.innerWidth, window.innerHeight) / 100;
    el.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse') return;
      e.preventDefault(); try { el.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      const btn = e.target.closest('.tbtn');
      if (btn) {
        const a = btn.dataset.a; t.down[a] = (t.down[a] || 0) + 1; t.tap[a] = true; btn.classList.add('on');
        this.ptrs.set(e.pointerId, { kind: 'btn', a, btn, look: btn.dataset.look === '1', x: e.clientX, y: e.clientY });
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
      if (p.kind === 'btn') { t.down[p.a] = Math.max(0, (t.down[p.a] || 0) - 1); if (!t.down[p.a]) p.btn.classList.remove('on'); }
    };
    el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end); el.addEventListener('lostpointercapture', end);
    el.addEventListener('contextmenu', (e) => e.preventDefault());
  }
  // shown only while playing on a touch device; hiding it lets every held control go
  setActive(on) {
    if (on === this.active) return; this.active = on; this.el.classList.toggle('on', on);
    if (!on) { const t = this.input.touch; this.ptrs.clear(); t.down = {}; t.move.x = 0; t.move.y = 0; this.stick.classList.remove('on'); for (const b of this.el.querySelectorAll('.tbtn.on')) b.classList.remove('on'); }
  }
}
