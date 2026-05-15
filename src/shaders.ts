// All GLSL fragment shaders used across sections.
// Each is a plain string passed to SectionCanvas as the `frag` prop.

export const SHOOTING_STARS = `
precision mediump float;
uniform vec2  u_resolution;
uniform float u_time;
uniform vec2  u_mouse;

void main() {
  vec2 st = gl_FragCoord.xy / u_resolution.y;
  vec2 b  = vec2(0.0, 0.07);
  vec3 col = vec3(0.0);
  for (float idx = 0.9; idx < 21.0; idx += 1.0) {
    float mx = u_mouse.x / u_resolution.x * 0.4;
    float my = u_mouse.y / u_resolution.y * 0.4;
    vec4 cv  = cos(idx + vec4(0.0,33.0,11.0,0.0) + vec4(mx,my,mx,my));
    mat2 rot = mat2(cv.x, cv.y, cv.z, cv.w);
    vec2 s   = st * idx;
    s.y     += u_time * 1.2;
    s        = fract(rot * s) - 0.5;
    s        = rot * s;
    float d  = distance(clamp(s,-b,b), s);
    col     += (0.0001/d) * (cos(s.y/0.1+1.0)+1.0);
  }
  gl_FragColor = vec4(clamp(col,0.0,1.0), 1.0);
}`;

export const NEBULA = `
precision mediump float;
uniform vec2  u_resolution;
uniform float u_time;
uniform vec2  u_mouse;

float rand(vec2 p){ return fract(sin(dot(p,vec2(200.99,78.233)))*56758.5453); }
float noise(vec2 p){
  vec2 f=fract(p); f=f*f*(3.0-2.0*f); vec2 i=floor(p);
  return mix(mix(rand(i),rand(i+vec2(1,0)),f.x),mix(rand(i+vec2(0,1)),rand(i+vec2(1,1)),f.x),f.y);
}
float fbm(vec2 p){
  float v=0.0,a=1.0;
  for(int i=0;i<4;i++){p=1.8*p+15.0;a*=0.5;v+=a*noise(p);}
  return v;
}
void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution;
  vec2 p=2.0*uv;
  vec2 r1=vec2(fbm(p+0.01*u_time),fbm(p+0.005*u_time));
  vec2 r2=vec2(fbm(p+0.05*u_time+10.0*r1),fbm(p+0.12*u_time+12.0*r1));
  float n=1.8*pow(fbm(p+r2),2.0)+0.03;
  gl_FragColor=vec4(n*vec3(0.04,0.55,0.22),1.0);
}`;

export const STARFIELD = `
precision highp float;
uniform vec2  u_resolution;
uniform float u_time;
uniform vec2  u_mouse;

vec2 hash21(float p) {
  vec3 p3 = fract(vec3(p) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  uv -= 0.5;
  uv.x *= u_resolution.x / u_resolution.y;
  int t = int(-u_time);
  vec2 uv0 = uv;
  gl_FragColor = vec4(0.0);
  for (int j = 0; j < 5; j++) {
    uv = uv0;
    float d = mod(float(t + j), 5.0) + fract(-u_time);
    uv *= d;
    for (int i = 0; i < 40; i++) {
      vec2 sp = hash21(float(i + 40 * j)) - 0.5;
      uv = mod(uv, 1.0);
      bool close = uv.x < 0.05 || uv.y < 0.05 || uv.x > 0.95 || uv.y > 0.95;
      if (!close && abs(length(uv - sp * 2.0)) < 0.004) {
        gl_FragColor = vec4(smoothstep(10.0, 0.0, d) * vec3(1.0), 1.0);
      }
    }
  }
}`;

export const HYPERBOLIC = `
precision highp float;
uniform vec2  u_resolution;
uniform float u_time;
uniform vec2  u_mouse;

float hSum(float a,float b){ float t=3.; return (a+b)/(1.+(a*b)/(t*t)); }
float hSub(float a,float b){ float t=3.; return (a-b)/(1.+(a*b)/(t*t)); }
vec2 hSum2D(vec2 a,vec2 b){ return vec2(hSum(a.x,b.x),hSum(a.y,b.y)); }
vec2 hSub2D(vec2 a,vec2 b){ return vec2(hSub(a.x,b.x),hSub(a.y,b.y)); }
vec2 cMulH(vec2 a,vec2 b){ return vec2(hSub(a.x*b.x,a.y*b.y),hSum(a.x*b.y,a.y*b.x)); }
vec2 oneOverZ(vec2 z){ float l=dot(z,z); return vec2(z.x/l,-z.y/l); }
vec3 hsv2rgb(vec3 c){
  vec3 p=abs(fract(c.xxx+vec3(0.,2.,4.)/3.)*6.-3.);
  return c.z*mix(vec3(1.),clamp(p-1.,0.,1.),c.y);
}
vec4 complexToQuat(vec2 z){
  return vec4(z.x,z.y,1.5*abs(sin(z.x)),abs(cos(z.y)));
}

void main(){
  float res=0.4;
  vec2 coords=gl_FragCoord.xy;
  coords.y+=500.0;
  vec2 p=(2.0*coords-u_resolution)/min(u_resolution.x,u_resolution.y)*res;

  vec2 zi=p;
  float iter=0.0;
  vec2 mouse=u_mouse/u_resolution*res-res/2.0;
  for(int i=0;i<12;i++){
    vec2 z1=hSum2D(zi,mouse);
    vec2 z2=cMulH(z1,zi);
    vec2 z3=cMulH(z2,zi);
    vec2 z4=cMulH(z3,zi);
    vec2 p1=hSum2D(z3,hSum2D(cMulH(z2,mouse),z1));
    vec2 p2=oneOverZ(hSum2D(cMulH(z4,z2),z1));
    iter=float(i);
    zi=hSum2D(p1,u_mouse/u_resolution);
    if(dot(zi,zi)>40.0) break;
  }
  vec4 quat=complexToQuat(zi);
  vec3 color=quat.xzz;
  float fade=iter/12.0;
  color=vec3(color.x,color.y*fade,color.z*fade);
  gl_FragColor=vec4(color,1.0);
}`;

export const COMPLEX_ROOTS = `
precision mediump float;
uniform vec2  u_resolution;
uniform float u_time;
uniform vec2  u_mouse;

vec2 zetSq(vec2 z){ return vec2(z.x*z.x-z.y*z.y,2.0*z.x*z.y); }
vec2 zetCu(vec2 z){ return vec2(z.x*z.x*z.x-3.0*z.x*z.y*z.y,3.0*z.x*z.x*z.y-z.y*z.y*z.y); }
vec2 inv(vec2 z){ float l=dot(z,z); return vec2(z.x,-z.y)/l; }
vec2 cmul(vec2 a,vec2 b){ return vec2(a.x*b.x-a.y*b.y,a.x*b.y+a.y*b.x); }
vec2 cexp(vec2 z){ float e=exp(z.x); return vec2(e*cos(z.y),e*sin(z.y)); }

void main(){
  vec2 p=(2.0*gl_FragCoord.xy-u_resolution)/min(u_resolution.x,u_resolution.y);
  float r=1.1;
  vec2 a=vec2(r*cos(u_mouse.x*0.01),            r*sin(u_mouse.y*0.01));
  vec2 b=vec2(r*cos(u_time*0.5+1.57+u_mouse.x*0.01), r*sin(u_time*0.5+1.57+u_mouse.y*0.01));
  vec2 c=vec2(r*cos(u_time*0.5+3.14+u_mouse.x*0.01), r*sin(u_time*0.5+3.14+u_mouse.y*0.01));
  vec2 d=vec2(r*cos(u_time*0.5+4.71+u_mouse.x*0.01), r*sin(u_time*0.5+4.71+u_mouse.y*0.01));
  vec2 e=vec2(r*cos(u_time*0.5+6.28+u_mouse.x*0.01), r*sin(u_time*0.5+6.28+u_mouse.y*0.01));
  vec2 f=vec2(r*cos(u_time*0.5+7.85+u_mouse.x*0.01), r*sin(u_time*0.5+7.85+u_mouse.y*0.01));
  vec2 poly=cmul(a,zetSq(zetCu(p)))+cmul(b,zetSq(zetSq(p)))+cmul(c,zetCu(p))+cmul(d,zetSq(p))+cmul(e,p)+f;
  vec2 q=inv(poly);
  vec2 zi=inv(cexp(inv(cos(q))));
  float len=min(length(zi),1.6);
  gl_FragColor=vec4(zi.x,zi.y,len,1.0);
}`;
