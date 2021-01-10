import { AdditiveBlending, ShaderMaterial } from "three"

export default class BackgroundMaterial extends ShaderMaterial {
  constructor() {
    super({
      vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
      fragmentShader: `
          varying vec2 vUv;
          uniform vec2 resolution;
          uniform vec2 mouse;
          uniform float time;
          uniform float alpha;
          uniform float videoAlpha;
          uniform sampler2D map;
          uniform sampler2D map1;
          uniform sampler2D noise;
          
          float hash(vec2 p) { return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); }
          
          float circle(vec2 uv, vec2 disc_center, float disc_radius, float border_size) {
            uv -= disc_center;
            //uv *= resolution.xy;
            float dist = sqrt(dot(uv, uv));
            return smoothstep(disc_radius+border_size, disc_radius-border_size, dist);
          }
  
          void main() {
              vec2 p = (gl_FragCoord.xy/resolution.xy);
              vec2 uv = vUv;

              // fix aspect ratio
              vec2 pp = uv.xy;
              pp.y *= 1.5;
              pp.y-=0.25;

              if(pp.y<0.05||pp.y>0.95){
               gl_FragColor = vec4(vec3(0.0), 1.0)*videoAlpha;
                return;
              }
              vec3 video = texture2D(map1, pp).rgb;
              float distR = texture2D(map, uv+0.012).r;
              float distG = texture2D(map, uv-0.012).g;
              float distB = texture2D(map, uv+0.012).b;
              vec3 dist = vec3(distR, distG, distB);
              vec3 col = mix(dist*videoAlpha, video, videoAlpha);

              gl_FragColor = vec4(col, 1.0)*videoAlpha;
            }
        `,
      transparent: true,
      uniforms: {
        mouse: {
          value: [0, 0]
        },
        resolution: {
          value: [window.innerWidth, window.innerHeight]
        },
        time: {
          value: null
        },
        noise: {
          value: null
        },
        map: {
          value: null
        },
        map1: {
          value: null
        },
        alpha: {
          value: 0
        },
        videoAlpha: {
          value: 0
        }
      }
    })
  }
}
