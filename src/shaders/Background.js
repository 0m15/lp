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
              
              // float c = circle(uv, m+vec2(0.5), 0.0, 0.15);
              // float warp1 = texture2D(noise, uv*0.35+time*0.05).r*2.;
              // float warp2 = texture2D(noise, uv*.25-time*0.06).r*2.;
              // float warp = warp1*warp2*2.0;
              
              vec3 video = texture2D(map1, uv).rgb;
              float colorR = texture2D(map, uv+0.012).r;
              float colorG = texture2D(map, uv-0.012).g;
              float colorB = texture2D(map, uv+0.012).b;
              vec3 color= vec3(colorR, colorG, colorB);
              gl_FragColor = vec4(mix(color*videoAlpha, video, videoAlpha), 1.0)*videoAlpha;
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
