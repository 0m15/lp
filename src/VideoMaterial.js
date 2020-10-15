import { DoubleSide, ShaderMaterial } from "three"

export default class VideoMaterial extends ShaderMaterial {
  constructor(props) {
    super({
      vertexShader: `
        varying vec2 vUv;

        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
      fragmentShader: `
        uniform sampler2D tInput;
        uniform float time;
        varying vec2 vUv;

        float rand(float n){
            return fract(sin(n) * 43758.5453123);
        }

        float rand(vec2 n) { 
            return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
        }
        
        float noise(float p){
            float fl = floor(p);
            float fc = fract(p);
            return mix(rand(fl), rand(fl + 1.0), fc);
        }
            
        float noise(vec2 n) {
            const vec2 d = vec2(0.0, 1.0);
            vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
            return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);
        }
        
        float circle(in vec2 st, in float r){
            vec2 dist = st-vec2(0.5);
            return 1.-smoothstep(r-(r*0.3),
                                 r+(r*0.3),
                                 dot(dist,dist)*4.0);
        }

        void main() {
            vec2 uv = vUv;
            float mask = circle(uv, 1.5) + noise(time+uv*4.0);
            gl_FragColor = vec4(mask);
            gl_FragColor = texture2D(tInput, uv) * mask;
        }
    `,
      uniforms: {
        tInput: { value: null, type: "t" },
        time: { value: 0, type: "f" }
      },
      side: DoubleSide,
      transparent: true
    })
  }
}
