import lerp from "lerp"
import React, { useRef } from "react"
import { useFrame, useLoader } from "react-three-fiber"
import { TextureLoader, MeshPhongMaterial } from "three"
import { snoise } from "./shaders/snoise"

export const mat = new MeshPhongMaterial()
export let materialShader = null

mat.onBeforeCompile = (shader) => {
  shader.uniforms.mouse = { value: [0, 0] }
  shader.uniforms.time = { value: 0 }
  shader.vertexShader = `
    uniform float time;
    uniform vec2 mouse;
    uniform sampler2D bumpMap;
    uniform sampler2D normalMap;
    ${snoise}
    ${shader.vertexShader}
  `
  shader.vertexShader = shader.vertexShader.replace(
    "#include <begin_vertex>",
    `
    vec3 transformed = vec3(position);
    vec2 offset = vec2(-mouse.x, mouse.y) * 0.25;
    float d = texture2D(bumpMap, uv).z*0.01;
    float displ = snoise(transformed*1.0+time*0.2) * d - d / 2.0;
    transformed.z += displ*d*(1.0-length(uv-0.5));
    transformed.xy += offset*d;
    transformedNormal.z += displ*d*(1.0-length(uv-0.5));
    transformedNormal.xy += offset*d;
    `
  )

  shader.fragmentShader = shader.fragmentShader.replace(
    "#include <map_fragment>",
    ` 
    #ifdef USE_MAP
      vec4 texelColor = texture2D( map, vUv );
      vec4 bmap = texture2D( bumpMap, vUv );
      vec4 nmap = texture2D( normalMap, vUv );
      texelColor = mapTexelToLinear( texelColor );
      diffuseColor *= texelColor * (bmap.z);
    #endif
    `
  )
  materialShader = shader
}

export default function MorphMesh({ started, mouse, onPointerDown, ...props }) {
  const mesh = useRef()

  const [map, normalMap, bumpMap] = useLoader(TextureLoader, [
    "/cover_color.jpg",
    "/cover_norm.jpg",
    "/cover_disp.jpg"
  ])

  const n = useRef(Math.random() * 9 - 5)
  const i = useRef(60)
  const f = useRef(0)

  useFrame(({ clock, frames, ...props }) => {
    if (!mesh.current) return

    const t = clock.getElapsedTime()

    if (materialShader) {
      materialShader.uniforms.time.value = t
      materialShader.uniforms.mouse.value = [
        lerp(materialShader.uniforms.mouse.value[0], mouse[0], 0.015),
        lerp(materialShader.uniforms.mouse.value[1], mouse[1], 0.025)
      ]
    }

    f.current += 1
    i.current = Math.round(((Math.sin(t) + 1) / 2) * 10)

    if (t < 2) return
  })

  return (
    <mesh ref={mesh} {...props}>
      <boxBufferGeometry args={[1, 1, 0.02, 128, 128, 128]} attach="geometry" />
      <primitive
        object={mat}
        attach="material"
        map={map}
        normalMap={normalMap}
        bumpMap={bumpMap}
        displacementMap={bumpMap}
        displacementScale={0}
        bumpScale={0}
        specularColor="darkgray"
      />
    </mesh>
  )
}
