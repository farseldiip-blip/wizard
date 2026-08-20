/**
 * Coffee Wizard — Hero WebGL shader.
 * ------------------------------------------------------------------
 * Port of the premium Stitch ANIMATION_5 shader (shader/code.html):
 * simplex-noise flow field over the Nocturnal Alchemy palette
 * (#141314 surface, deeper midnight, #c6c5d2 accent) with a vignette.
 *
 * Targets canvas[data-hero-shader]. If WebGL is unavailable the canvas
 * is left transparent and .no-shader is set on [data-hero] so the
 * poster image fallback in index.html becomes visible.
 */

(function () {
  "use strict";

  var canvas = document.querySelector("[data-hero-shader]");
  if (!canvas) return;

  var hero = canvas.closest("[data-hero]");

  var gl =
    canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  if (!gl) {
    if (hero) hero.classList.add("no-shader");
    return;
  }

  function syncSize() {
    var w = canvas.clientWidth || 1280;
    var h = canvas.clientHeight || 720;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  }
  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(syncSize).observe(canvas);
  }
  syncSize();

  var vs = [
    "attribute vec2 a_position;",
    "varying vec2 v_texCoord;",
    "void main() {",
    "  v_texCoord = a_position * 0.5 + 0.5;",
    "  gl_Position = vec4(a_position, 0.0, 1.0);",
    "}"
  ].join("\n");

  var fs = [
    "precision highp float;",
    "uniform float u_time;",
    "uniform vec2 u_resolution;",
    "uniform vec2 u_mouse;",
    "varying vec2 v_texCoord;",
    "",
    "vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }",
    "vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }",
    "vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }",
    "",
    "float snoise(vec2 v) {",
    "    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);",
    "    vec2 i  = floor(v + dot(v, C.yy) );",
    "    vec2 x0 = v -   i + dot(i, C.xx);",
    "    vec2 i1;",
    "    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);",
    "    vec4 x12 = x0.xyxy + C.xxzz;",
    "    x12.xy -= i1;",
    "    i = mod289(i);",
    "    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));",
    "    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);",
    "    m = m*m ;",
    "    m = m*m ;",
    "    vec3 x = 2.0 * fract(p * C.www) - 1.0;",
    "    vec3 h = abs(x) - 0.5;",
    "    vec3 a0 = x - floor(x + 0.5);",
    "    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );",
    "    vec3 g;",
    "    g.x  = a0.x  * x0.x  + h.x  * x0.y;",
    "    g.yz = a0.yz * x12.xz + h.yz * x12.yw;",
    "    return 130.0 * dot(m, g);",
    "}",
    "",
    "void main() {",
    "    vec2 uv = v_texCoord;",
    "    vec2 center = uv - 0.5;",
    "    center.x *= u_resolution.x / u_resolution.y;",
    "",
    "    vec3 color1 = vec3(0.062, 0.058, 0.062); // #141314 Surface",
    "    vec3 color2 = vec3(0.039, 0.043, 0.078); // Deeper Midnight",
    "    vec3 accent = vec3(0.776, 0.733, 0.824); // #c6c5d2 Primary",
    "",
    "    float n = snoise(uv * 2.0 + u_time * 0.05);",
    "    float n2 = snoise(uv * 4.0 - u_time * 0.08);",
    "",
    "    vec3 finalColor = mix(color1, color2, uv.y + n * 0.2);",
    "    finalColor = mix(finalColor, accent, pow(abs(n2), 5.0) * 0.05);",
    "",
    "    float d = length(center);",
    "    finalColor *= smoothstep(1.2, 0.4, d);",
    "",
    "    gl_FragColor = vec4(finalColor, 1.0);",
    "}"
  ].join("\n");

  function createShader(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }

  var prog = gl.createProgram();
  gl.attachShader(prog, createShader(gl.VERTEX_SHADER, vs));
  gl.attachShader(prog, createShader(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW
  );

  var pos = gl.getAttribLocation(prog, "a_position");
  gl.enableVertexAttribArray(pos);
  gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

  var uTime = gl.getUniformLocation(prog, "u_time");
  var uRes = gl.getUniformLocation(prog, "u_resolution");
  var uMouse = gl.getUniformLocation(prog, "u_mouse");

  var mouse = { x: canvas.width / 2, y: canvas.height / 2 };
  window.addEventListener("mousemove", function (event) {
    var rect = canvas.getBoundingClientRect();
    if (rect.width && rect.height) {
      var nx = (event.clientX - rect.left) / rect.width;
      var ny = 1.0 - (event.clientY - rect.top) / rect.height;
      mouse.x = nx * canvas.width;
      mouse.y = ny * canvas.height;
    }
  });

  function render(t) {
    if (typeof ResizeObserver === "undefined") syncSize();
    gl.viewport(0, 0, canvas.width, canvas.height);
    if (uTime) gl.uniform1f(uTime, t * 0.001);
    if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
    if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(render);
  }
  render(0);
})();