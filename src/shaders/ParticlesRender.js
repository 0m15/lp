import { AdditiveBlending } from "three"

export default {
  vertexShader: `
    attribute vec3 colors;
    uniform sampler2D positions;
    uniform float pointSize;
    varying float a;
    varying vec3 color;
    varying vec2 vUv;

    void main() {
        vec4 col = texture2D( positions, position.xy );
        a = col.a;
        vec3 pos = col.xyz;
        vUv = uv;
        color = colors;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
        gl_PointSize = pointSize;
    }
    `,
  fragmentShader: `
    uniform sampler2D positions;
    uniform float time;
    varying vec2 vUv;
    varying float a;
    varying vec3 color;

    void main() {
      vec2 p = vUv;
        //gl_FragColor = texture2D( positions, vUv );
        gl_FragColor = vec4(color, .25);
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
