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
              vec2 m = mouse*0.25;
              m.y *= -1.0;
  
              float c = circle(uv, m+vec2(0.5), 0.0, 0.15);
              float n = hash(p);
              vec3 noiseColor = vec3(n*0.5)*vec3(0.3);
              vec3 bgColor = vec3(0.82);
  
              float r = texture2D(map1, p+0.012).r;
              float g = texture2D(map1, p-0.012).g;
              float b = texture2D(map1, p+0.012).b;
  
              vec3 distColor = vec3(r, g, b);
  
              vec3 video = texture2D(map1, p).rgb;
  
              vec2 depth = mouse * 0.02 * pow(abs(p.x-0.5), 0.5);
              float warp = texture2D(noise, p+depth+time*0.02).r*0.05;
              vec4 bg = texture2D(map, p);
  
              // offset.x += mouse.x *0.01* abs(pow(p.x,0.75)); //length(uv - vec2(0.5));
              
              gl_FragColor = vec4(mix(mix(vec3(noiseColor), distColor*0.5, videoAlpha), video, videoAlpha), 1.0) * alpha;
              //gl_FragColor = vec4(0.9*noiseColor, 1.0);

            }
        `,
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
