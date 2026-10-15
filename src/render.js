// Storybook renderer: the scene is drawn into a data buffer (shade, inkId, normal.xy) + depth, then a full-screen pass
// paints it like a Victorian illustration: flat colour with soft shading, thin dark outlines, a parchment sky, and fog that
// fades distant figures into grey silhouettes. (The earlier version drew pen-on-notebook-paper hatching here.)
import * as THREE from 'three';

export const INK = { BLUE: 0, RED: 1, BLACK: 2, ORANGE: 3, GREEN: 4, PINK: 5, IVORY: 6, GREY: 7 };
// Colour rules (the names are from the first, ballpoint version): BLUE is the world's stone, RED is danger (and nothing else),
// ORANGE is something you can hook, ride or break, GREEN is pickups and plants. Emphasis is added to an ink id (ink + EMPH)
// for anything the player must spot: it is drawn with a bold line that never fades with distance.
export const EMPH = 8;
export const INK_COLORS = [
  new THREE.Vector3(0.76, 0.69, 0.63), // stone: the world (walls, floors)
  new THREE.Vector3(0.58, 0.13, 0.11), // crimson: danger
  new THREE.Vector3(0.10, 0.09, 0.11), // black cloth and ink
  new THREE.Vector3(0.80, 0.60, 0.22), // antique gold: hooks, rings, things to ride or break
  new THREE.Vector3(0.33, 0.46, 0.38), // moss: pickups and plants
  new THREE.Vector3(0.72, 0.47, 0.50), // dusty rose
  new THREE.Vector3(0.93, 0.89, 0.82), // ivory: lace, collars, the moon
  new THREE.Vector3(0.56, 0.54, 0.54), // fog grey
];
export const LIGHT_WORLD = new THREE.Vector3(0.38, 0.82, 0.42).normalize();
export const shared = { uLightDir: { value: new THREE.Vector3(0, 1, 0) }, uTime: { value: 0 } };

const inkVert = /* glsl */`
varying vec3 vNormalV;
varying vec4 vColorData;
uniform float uTime;
void main() {
  vec3 transformed = position;
  vec3 objectNormal = normal;
  #ifdef USE_INSTANCING
    transformed = (instanceMatrix * vec4(transformed, 1.0)).xyz;
    objectNormal = mat3(instanceMatrix) * objectNormal;
  #endif
  #ifdef USE_INSTANCING_COLOR
    vColorData = vec4(instanceColor, 1.0);
  #else
    vColorData = vec4(0.0, 0.0, 0.0, -1.0);
  #endif
  vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
  vNormalV = normalize(normalMatrix * objectNormal);
  gl_Position = projectionMatrix * mvPosition;
}`;

const inkFrag = /* glsl */`
precision highp float;
uniform float uInk;
uniform float uFill;
uniform float uShadeScale;
uniform float uShadeBias;
uniform vec3 uLightDir;
varying vec3 vNormalV;
varying vec4 vColorData;
void main() {
  vec3 n = normalize(vNormalV);
  if (!gl_FrontFacing) n = -n;
  float ndl = dot(n, uLightDir) * 0.5 + 0.5;
  float ink = uInk; float fill = uFill;
  if (vColorData.a > 0.0) { ink = vColorData.r + (uInk > 7.5 ? 8.0 : 0.0); fill = vColorData.g; }
  float shade = clamp(ndl * uShadeScale + uShadeBias, 0.0, 1.0);
  if (fill > 0.5) shade = -1.0;
  gl_FragColor = vec4(shade, ink, n.x, n.y);
}`;

export function makeInkMaterial(opts = {}) {
  const m = new THREE.ShaderMaterial({
    uniforms: {
      uInk: { value: (opts.ink ?? INK.BLUE) + (opts.emphasis ? EMPH : 0) }, uFill: { value: opts.fill ? 1 : 0 },
      uShadeScale: { value: opts.shadeScale ?? 1.0 }, uShadeBias: { value: opts.shadeBias ?? 0.0 },
      uLightDir: shared.uLightDir, uTime: shared.uTime,
    },
    vertexShader: inkVert, fragmentShader: inkFrag, side: opts.side ?? THREE.FrontSide,
  });
  m.inkId = opts.ink ?? INK.BLUE; m.emphasis = !!opts.emphasis;
  return m;
}
export function setInk(mat, ink) { mat.uniforms.uInk.value = ink + (mat.emphasis ? EMPH : 0); mat.inkId = ink; }
export function setFill(mat, fill) { mat.uniforms.uFill.value = fill ? 1 : 0; }

const postVert = /* glsl */`
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const postFrag = /* glsl */`
precision highp float;
varying vec2 vUv;
uniform sampler2D tScene;
uniform sampler2D tDepth;
uniform vec2 uRes;
uniform float uAspect;
uniform float uTime;
uniform float uNear;
uniform float uFar;
uniform float uHurt;
uniform float uFlash;
uniform float uSlow;
uniform float uLineSpacing;
uniform float uLowHp;
uniform vec3 uPaper;
uniform vec3 uInks[8];
uniform mat4 uInvProj;
uniform mat4 uInvView;

float hash21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vnoise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
  float a = hash21(i), b = hash21(i + vec2(1.0, 0.0)), c = hash21(i + vec2(0.0, 1.0)), d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
float linDepth(float z) { float zn = z * 2.0 - 1.0; return 2.0 * uNear * uFar / (uFar + uNear - zn * (uFar - uNear)); }
vec3 inkColor(float id) {
  float k = floor(id + 0.5); if (k > 7.5) k -= 8.0; // strip emphasis
  int i = int(k);
  if (i <= 0) return uInks[0]; if (i == 1) return uInks[1]; if (i == 2) return uInks[2]; if (i == 3) return uInks[3];
  if (i == 4) return uInks[4]; if (i == 5) return uInks[5]; if (i == 6) return uInks[6]; return uInks[7];
}
float stripes(vec2 p, vec2 dir, float spacing, float width) {
  float t = dot(p, vec2(-dir.y, dir.x));
  float f = abs(fract(t / spacing) - 0.5) * spacing;
  float soft = width * 0.6;
  return 1.0 - smoothstep(width * 0.5 - soft, width * 0.5 + soft, f);
}
// Painted shading: a soft light-to-dark ramp, nudged towards three flat steps like cel colour in a storybook plate.
// Shadows go a little cooler and browner than the lit colour rather than just darker.
vec3 painted(vec3 base, float shade) {
  float t = smoothstep(0.10, 0.92, shade);
  float steps = floor(t * 3.0 + 0.5) / 3.0;
  t = mix(t, steps, 0.5);
  vec3 dark = base * vec3(0.40, 0.36, 0.39);
  vec3 lite = base * 1.10 + 0.02;
  return mix(dark, lite, t);
}
void main() {
  vec2 px = 1.0 / uRes;
  float sc = uRes.y / 900.0;
  vec2 nuv = vUv * vec2(uAspect, 1.0);
  vec2 wob = vec2(vnoise(nuv * 6.0 + 11.3), vnoise(nuv * 6.0 + 37.0)) - 0.5;
  vec2 suv = vUv + wob * 2.0 * sc * px;
  vec4 s = texture2D(tScene, suv);
  float z = texture2D(tDepth, suv).x;
  float d = linDepth(z);
  // Line weight: thick close up, thin in the distance; emphasised things always get the bold line.
  // Widening the sample offset widens the band the edge test fires in, on the near side.
  bool emphS = s.g > 7.5;
  float o = sc * mix(1.6, 0.95, smoothstep(3.0, 30.0, d));
  if (emphS) o = max(o, 1.9 * sc);
  vec2 ox = vec2(o, 0.0) * px, oy = vec2(0.0, o) * px;
  float zl = texture2D(tDepth, suv - ox).x, zr = texture2D(tDepth, suv + ox).x;
  float zu = texture2D(tDepth, suv + oy).x, zd = texture2D(tDepth, suv - oy).x;
  vec4 sl = texture2D(tScene, suv - ox), sr = texture2D(tScene, suv + ox);
  vec4 su = texture2D(tScene, suv + oy), sd = texture2D(tScene, suv - oy);
  // Edge test in inverse depth (1/d). For ANY plane - including ones seen at a
  // grazing angle, like the floor - 1/d is affine across the screen, so its second
  // difference is zero there and only real silhouettes register. Comparing it against
  // 1/d itself makes the test scale invariant, so distant outlines stay as crisp as near ones.
  float iw = 1.0 / d;
  float lap = abs(1.0 / linDepth(zl) + 1.0 / linDepth(zr) - 2.0 * iw)
            + abs(1.0 / linDepth(zu) + 1.0 / linDepth(zd) - 2.0 * iw);
  float edge = smoothstep(0.07, 0.30, lap / (iw + 1e-7));
  float nEdge = length(sl.ba - sr.ba) + length(su.ba - sd.ba);
  edge = max(edge, smoothstep(0.42, 0.85, nEdge));
  // ink colour of the front-most sample around the edge
  float zmin = z; float inkId = s.g;
  if (zl < zmin) { zmin = zl; inkId = sl.g; }
  if (zr < zmin) { zmin = zr; inkId = sr.g; }
  if (zu < zmin) { zmin = zu; inkId = su.g; }
  if (zd < zmin) { zmin = zd; inkId = sd.g; }
  float dFront = linDepth(zmin);
  bool sky = z >= 0.99999;

  bool emphE = inkId > 7.5;
  float fade = emphS ? 1.0 : mix(1.0, 0.3, smoothstep(14.0, 100.0, d));
  float fadeE = emphE ? 1.0 : mix(1.0, 0.3, smoothstep(22.0, 130.0, dFront));
  float shade = s.r;
  vec2 pp = gl_FragCoord.xy;
  vec2 vc = (vUv - 0.5) * vec2(uAspect, 1.0);

  // the sky: warm parchment, a little lighter overhead and greyer towards the horizon, with faint grain
  float sky01 = clamp(vUv.y, 0.0, 1.0);
  vec3 skyTop = vec3(0.86, 0.79, 0.72), skyLow = vec3(0.80, 0.75, 0.71);
  vec3 fogCol = mix(skyLow, vec3(0.73, 0.69, 0.67), 0.35);
  float grain = vnoise(pp * 0.8) * 0.6 + vnoise(pp * 0.17) * 0.4;
  vec3 paper = mix(skyLow, skyTop, smoothstep(0.35, 1.0, sky01)) * (0.96 + 0.07 * grain);

  vec3 col = paper;
  if (!sky) {
    vec3 base = inkColor(s.g);
    vec3 surf;
    vec3 nv = vec3(s.ba, sqrt(max(0.0, 1.0 - dot(s.ba, s.ba))));
    float rim = 1.0 - nv.z;                         // grows towards the silhouette of a rounded form
    if (shade < 0.0 || shade > 0.985) {             // figures and flat cloth: solid colour, softly rounded
      surf = base * (1.0 - 0.34 * rim * rim) * (0.92 + 0.12 * nv.y);
    } else {
      surf = painted(base, shade);
    }
    // a faint mottle, as if painted with a damp brush
    surf *= 0.95 + 0.09 * vnoise(pp * 0.045 + 7.0 * floor(inkId)) + 0.035 * (grain - 0.5);
    // distance: colours drain to grey and sink into the fog, so far figures become silhouettes.
    // Things the player must find (emphasised) keep most of their colour.
    float fog = smoothstep(16.0, 125.0, d) * (emphS ? 0.3 : 1.0);
    float lum = dot(surf, vec3(0.3, 0.5, 0.2));
    surf = mix(surf, vec3(lum) * vec3(0.98, 0.96, 0.95), fog * 0.75);
    surf = mix(surf, fogCol, fog * 0.8);
    col = surf;
  }
  // thin, dark, slightly uneven outlines; the front-most thing's own colour tints them
  float ew = 0.8 + 0.3 * vnoise(pp * 0.35);
  vec3 lineCol = mix(vec3(0.10, 0.08, 0.09), inkColor(inkId) * 0.4, emphE ? 0.55 : 0.3);
  col = mix(col, lineCol, clamp(edge * ew * (emphE ? 1.3 : 1.0), 0.0, 1.0) * fadeE);
  // a soft shadow in the corners, like the printed plate it imitates
  col *= 1.0 - 0.2 * smoothstep(0.42, 1.05, length(vc));

  // hurt: red scribble vignette; low hp: pulsing
  float vig = smoothstep(0.32, 0.9, length(vc));
  float scr = 0.55 + 0.45 * stripes(pp + wob * 8.0, normalize(vec2(1.0, 0.8)), 7.0 * sc, 2.2 * sc);
  float hurt = clamp(uHurt + uLowHp * (0.35 + 0.25 * sin(uTime * 6.0)), 0.0, 1.0);
  col = mix(col, uInks[1] * 0.9, hurt * vig * scr);
  col = mix(col, uPaper, uFlash);
  float lum = dot(col, vec3(0.3, 0.5, 0.2));
  col = mix(col, vec3(lum) * vec3(0.8, 0.86, 1.0), uSlow * 0.55);
  gl_FragColor = vec4(col, 1.0);
}`;

export class InkRenderer {
  constructor(canvas) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', stencil: false });
    this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    this.renderer.autoClear = false;
    // Phones have dense screens but small GPUs, and the ink pass does a lot of work per pixel, so on a
    // touch screen the scene is drawn at one buffer pixel per CSS pixel; lines stay crisp enough.
    const coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, coarse ? 1 : 1.5);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(80, 1, 0.08, 420);
    const depthTexture = new THREE.DepthTexture(2, 2); depthTexture.format = THREE.DepthFormat; depthTexture.type = THREE.FloatType;
    this.rt = new THREE.WebGLRenderTarget(2, 2, { type: THREE.HalfFloatType, format: THREE.RGBAFormat, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, depthTexture, depthBuffer: true, stencilBuffer: false, generateMipmaps: false });
    this.post = new THREE.ShaderMaterial({
      uniforms: {
        tScene: { value: this.rt.texture }, tDepth: { value: depthTexture }, uRes: { value: new THREE.Vector2(2, 2) }, uAspect: { value: 1 },
        uTime: { value: 0 }, uNear: { value: this.camera.near }, uFar: { value: this.camera.far }, uHurt: { value: 0 }, uFlash: { value: 0 }, uSlow: { value: 0 },
        uLowHp: { value: 0 }, uLineSpacing: { value: 60 }, uPaper: { value: new THREE.Vector3(0.90, 0.85, 0.79) }, uInks: { value: INK_COLORS },
        uInvProj: { value: new THREE.Matrix4() }, uInvView: { value: new THREE.Matrix4() },
      },
      vertexShader: postVert, fragmentShader: postFrag, depthTest: false, depthWrite: false,
    });
    this.postScene = new THREE.Scene(); this.postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.post));
    this._clear = new THREE.Color(1, 0, 0);
    this._ld = new THREE.Vector3();
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }
  resize() {
    const w = Math.max(2, window.innerWidth), h = Math.max(2, window.innerHeight);
    this.renderer.setPixelRatio(this.pixelRatio); this.renderer.setSize(w, h, false);
    const rw = Math.floor(w * this.pixelRatio), rh = Math.floor(h * this.pixelRatio);
    this.rt.setSize(rw, rh);
    this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
    const u = this.post.uniforms; u.uRes.value.set(rw, rh); u.uAspect.value = w / h; u.uLineSpacing.value = rh / 13.5;
  }
  render(time, fx = {}) {
    shared.uTime.value = time;
    this.camera.updateMatrixWorld(); this.camera.matrixWorldInverse.copy(this.camera.matrixWorld).invert();
    shared.uLightDir.value.copy(LIGHT_WORLD).transformDirection(this.camera.matrixWorldInverse);
    const r = this.renderer;
    r.setRenderTarget(this.rt); r.setClearColor(this._clear, 0); r.clear(true, true, false);
    r.render(this.scene, this.camera);
    r.setRenderTarget(null);
    const u = this.post.uniforms; u.uTime.value = time; u.uNear.value = this.camera.near; u.uFar.value = this.camera.far;
    u.uInvProj.value.copy(this.camera.projectionMatrixInverse); u.uInvView.value.copy(this.camera.matrixWorld);
    u.uHurt.value = fx.hurt || 0; u.uFlash.value = fx.flash || 0; u.uSlow.value = fx.slow || 0; u.uLowHp.value = fx.lowHp || 0;
    r.render(this.postScene, this.postCam);
  }
}
