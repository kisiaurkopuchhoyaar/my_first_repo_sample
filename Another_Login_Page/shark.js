/*********
 * made by Matthias Hurrle (@atzedent)
 */

/** @type {HTMLCanvasElement} */
const canvas = document.querySelector("canvas");
const gl = canvas.getContext("webgl2");
const dpr = Math.max(0.5, 0.5 * window.devicePixelRatio);
/** @type {Map<string,PointerEvent>} */
const touches = new Map();

const vertexSource = `#version 300 es
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

in vec2 position;

void main(void) {
    gl_Position = vec4(position, 0., 1.);
}
`;
const fragmentSource = `#version 300 es
/*********
* made by Matthias Hurrle (@atzedent)
*/

#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

out vec4 fragColor;

uniform vec2 resolution;
uniform vec2 touch;
uniform float time;
uniform int pointerCount;

#define T (time+12.)
#define S smoothstep
#define P pointerCount
#define mouse (touch/resolution)
#define rot(a) mat2(cos(a),-sin(a),sin(a),cos(a))
#define syl(p,s) (length(p)-s)

float rnd(vec2 p) {
  return fract(
    sin(
      dot(
        p,
        vec2(12.233, 78.599)
      )
    )*45876.53521
  );
}

float smin(float a, float b, float k) {
  float h =
  clamp(
    .5+.5*(b-a)/k,
    .0,
    1.
  );

  return mix(b, a, h)-k*h*(1.-h);
}

float egg(vec3 p, vec3 s) {
  return (length(p / s) - 1.) * min(min(s.x, s.y), s.z);
}


float box(vec3 p, vec3 s, float r) {
  p = abs(p)-s;

  return length(max(p,.0))+
  min(.0, max(max(p.x, p.y), p.z))-r;
}

float dsc(vec3 p, vec2 s, float r) {
  vec2 e = vec2(
    abs(length(p.xy)),
    abs(p.z)
  )-s;

  return length(max(e,.0))+
  min(.0, max(e.x, e.y))-r;
}

float fin(vec3 p) {
  p.x += exp(-cos(T*.5)*.5)-.25;
  vec3 q = p;
  q.y -= .5;
  q.x += .6;
  float o = dsc(p, vec2(1.2,.0125)*1.2,.0),
  i = dsc(q, vec2(.8,.5)*1.4,.0);

  return max(o, -i*.5);
}

float mat = .0;
float map(vec3 p) {
  float t = T*2.;
  vec3 q = p+vec3(0, 1.05, 0);
  q.yz += .125*sin(t+q.xz*1.5);
  vec3 st = p+vec3(0, 1.5+.2*sin(-1.+t), 0);

  float d = 5e5,
  flr = box(q, vec3(9,.05, 9),.05),
  sph = fin(st);

  d = min(d, flr);
  d = smin(d, -egg(st+vec3(1.85,0,0),vec3(.4,.2,.1)),-.5);
  d = min(d, sph);

  if (d == sph) mat = 1.;
  else mat = .0;

  return d;
}

vec3 norm(vec3 p) {
  vec2 e = vec2(1e-3, 0);
  float d = map(p);
  vec3 n = d-vec3(
    map(p-e.xyy),
    map(p-e.yxy),
    map(p-e.yyx)
  );

  return normalize(n);
}

float tween(float x) {
  return x*x*x*(10. + x*(-15. + 6.*x));
}

void cam(inout vec3 p) {
  if (P > 0) {
    p.yz *= rot(-.15);
    p.xz *= rot((.65 - mouse.x) * acos(-1.) * 2.);
  } else {
    p.z -= .05*-sin(T*2.+p.y*1.5);
    p.yz *= rot(-.1);
    p.xz *= rot(.2-.6*sin(T*.6)+tween(.5+.5*sin(T*.2)));
  }
}

void main(void) {
  vec2 uv = (
    gl_FragCoord.xy-.5*resolution
  )/min(resolution.x, resolution.y);

  vec3 col = vec3(0),
  ro = vec3(0, 0, -4),
  rd = normalize(vec3(uv, 1));

  cam(ro);
  cam(rd);

  vec3 p = ro;

  const float steps = 400., maxd = 20.;
  float i = .0,
  dd = .0,
  at = .0;

  for (; i < steps; i++) {
    float d = map(p)*.5;

    if (d < 1e-3) {
      if (mat == 1.) {
        col = vec3(3, 2, 1)/3.;
        break;
      }

      d = 1e-2;
      vec3 n = norm(p);
      rd = reflect(rd, n);
    }

    if (dd > maxd) {
      dd = maxd;
      break;
    }

    p += rd*d;
    dd += d;
    at += .1*(.1/dd);
  }

  vec3 tint = vec3(3, 2, 1)*at;
  float glow = S(.2,.6, i/steps*1.5);
  col += rnd(p.xz)*.31;
  col += glow*tint;
  col.yz *= rot((P > 0?.0: .5*tween(sin(T*.2)*.5+.5)-.5));
  col.xz *= rot(2.75);
  col = exp(-col*8.);
  col = sqrt(col);
  col = exp(-col*10.);

  col += uv.x*uv.y*.3;
  col *= S(1.,.0, dot(uv, uv));

  fragColor = vec4(col, 1);
}
`;
let time;
let buffer;
let program;
let touch;
let resolution;
let pointerCount;
let vertices = [];
let touching = false;

function resize() {
  const { innerWidth: width, innerHeight: height } = window;

  canvas.width = width * dpr;
  canvas.height = height * dpr;

  gl.viewport(0, 0, width * dpr, height * dpr);
}

function compile(shader, source) {
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
  }
}

function setup() {
  const vs = gl.createShader(gl.VERTEX_SHADER);
  const fs = gl.createShader(gl.FRAGMENT_SHADER);

  program = gl.createProgram();

  compile(vs, vertexSource);
  compile(fs, fragmentSource);

  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
  }

  vertices = [-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0];

  buffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  const position = gl.getAttribLocation(program, "position");

  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  time = gl.getUniformLocation(program, "time");
  touch = gl.getUniformLocation(program, "touch");
  pointerCount = gl.getUniformLocation(program, "pointerCount");
  resolution = gl.getUniformLocation(program, "resolution");
}

function draw(now) {
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

  gl.uniform1f(time, now * 0.001);
  gl.uniform2f(touch, ...getTouches());
  gl.uniform1i(pointerCount, touches.size);
  gl.uniform2f(resolution, canvas.width, canvas.height);
  gl.drawArrays(gl.TRIANGLES, 0, vertices.length * 0.5);
}

function getTouches() {
  if (!touches.size) {
    return [0, 0];
  }

  for (let [id, t] of touches) {
    const result = [dpr * t.clientX, dpr * (innerHeight - t.clientY)];

    return result;
  }
}

function loop(now) {
  draw(now);
  requestAnimationFrame(loop);
}

function init() {
  setup();
  resize();
  loop(0);
}

document.body.onload = init;
window.onresize = resize;
canvas.onpointerdown = (e) => {
  touching = true;
  touches.set(e.pointerId, e);
};
canvas.onpointermove = (e) => {
  if (!touching) return;
  touches.set(e.pointerId, e);
};
canvas.onpointerup = (e) => {
  touching = false;
  touches.clear();
};
canvas.onpointerout = (e) => {
  touching = false;
  touches.clear();
};
