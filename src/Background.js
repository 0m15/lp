import lerp from "lerp"
import React, { useEffect, useMemo, useRef } from "react"
import { extend, useFrame, useLoader, useThree } from "react-three-fiber"
import {
  MirroredRepeatWrapping,
  ShaderMaterial,
  TextureLoader,
  UniformsLib,
  VideoTexture
} from "three"

const videoTexture = new VideoTexture(document.getElementById("video"))

class BackgroundMaterial extends ShaderMaterial {
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
        
        float blendOverlay(float base, float blend) {
          return base<0.5?(2.0*base*blend):(1.0-2.0*(1.0-base)*(1.0-blend));
        }
        
        vec3 blendOverlay(vec3 base, vec3 blend) {
          return vec3(blendOverlay(base.r,blend.r),blendOverlay(base.g,blend.g),blendOverlay(base.b,blend.b));
        }
        
        vec3 blendOverlay(vec3 base, vec3 blend, float opacity) {
          return (blendOverlay(base, blend) * opacity + base * (1.0 - opacity));
        }

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
            float n = smoothstep(0.0, 0.59, hash(p));
            vec3 noiseColor = vec3(n);
            vec3 bgColor = vec3(0.82);

            float r = texture2D(map, p+0.002).r;
            float g = texture2D(map, p-0.002).g;
            float b = texture2D(map, p+0.002).b;

            vec3 distColor = vec3(r, g, b);

            vec3 video = texture2D(map1, p).rgb;

            vec2 depth = mouse * 0.02 * pow(abs(p.x-0.5), 0.5);
            float warp = texture2D(noise, p+depth+time*0.02).r*0.05;
            vec4 bg = texture2D(map, p + depth+warp*c);

            // offset.x += mouse.x *0.01* abs(pow(p.x,0.75)); //length(uv - vec2(0.5));
            
            gl_FragColor = vec4(mix(bg.rgb*0.05, distColor, c), 1.0) * alpha;
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

extend({ BackgroundMaterial })

export default function Background({ mouse, started, playingState, ...props }) {
  const [map, noise] = useLoader(TextureLoader, [
    "/cover-front-a.jpg",
    "/noise-a.jpg"
  ])

  useEffect(() => {
    const video = document.getElementById("video")
    const onClick = () => {
      if (playingState) {
        video.play()
      }
    }

    document.addEventListener("click", onClick)

    return () => {
      document.removeEventListener("click", onClick)
    }
  }, [playingState])

  const mesh = useRef()
  const mouseLerp = useRef([0, 0])

  const { size } = useThree()

  useFrame(({ clock }) => {
    if (!mesh.current) return

    map.wrapS = MirroredRepeatWrapping
    map.wrapT = MirroredRepeatWrapping
    videoTexture.wrapS = MirroredRepeatWrapping
    videoTexture.wrapT = MirroredRepeatWrapping
    noise.wrapS = MirroredRepeatWrapping
    noise.wrapT = MirroredRepeatWrapping

    mouseLerp.current[0] = lerp(mouseLerp.current[0], mouse[0], 0.05)
    mouseLerp.current[1] = lerp(mouseLerp.current[1], mouse[1], 0.05)

    mesh.current.material.uniforms.resolution.value = [
      size.width * window.devicePixelRatio,
      size.height * window.devicePixelRatio
    ]
    mesh.current.material.uniforms.mouse.value = mouseLerp.current
    mesh.current.material.uniforms.map.value = map
    mesh.current.material.uniforms.map1.value = videoTexture

    mesh.current.material.uniforms.noise.value = noise
    mesh.current.material.uniforms.time.value += 0.01

    // if (!started) return
    mesh.current.material.uniforms.alpha.value = lerp(
      mesh.current.material.uniforms.alpha.value,
      1.0,
      0.01
    )
  })

  return (
    <mesh ref={mesh} {...props}>
      <boxBufferGeometry args={[10, 7, 1]} />
      <backgroundMaterial />
      {/* <meshStandardMaterial map={map} color="#fff" /> */}
    </mesh>
  )
}
