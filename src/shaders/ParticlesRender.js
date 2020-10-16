import { AdditiveBlending } from "three"

export default {
  vertexShader: `
    uniform sampler2D positions;
    uniform float pointSize;
    varying float a;
    varying vec2 vUv;

    void main() {
        vec4 col = texture2D( positions, position.xy );
        a = col.a;
        vec3 pos = col.xyz;
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
        gl_PointSize = pointSize;
    }
    `,
  fragmentShader: `
    uniform sampler2D positions;
    uniform float time;
    varying vec2 vUv;
    varying float a;

    void main() {
      vec2 p = vUv;
        //gl_FragColor = texture2D( positions, vUv );
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.)*a;
    }
    `,
  uniforms: {
    positions: { type: "t", value: null },
    pointSize: { type: "f", value: 1 },
    time: { value: 0 }
  },
  transparent: true,
  blending: AdditiveBlending
}
