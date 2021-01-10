import { useAspect } from "drei"
import lerp from "lerp"
import React, { useRef } from "react"
import { useFrame, useLoader } from "react-three-fiber"
import { TextureLoader, MeshPhongMaterial } from "three"
import { snoise } from "./shaders/snoise"
import {
  AudioLoader,
  AudioListener,
  Audio,
  AudioAnalyser,
  DataTexture
} from "three"

export const material = new MeshPhongMaterial()
export let materialShader = null

material.onBeforeCompile = (shader) => {
  shader.uniforms.mouse = { value: [0, 0] }
  shader.uniforms.disp = { value: 0 }
  shader.uniforms.time = { value: 0 }
  // shader.vertexShader = `
  //   uniform float time;
  //   uniform float disp;
  //   uniform vec2 mouse;
  //   uniform sampler2D bumpMap;
  //   uniform sampler2D normalMap;
  //   ${snoise}
  //   ${shader.vertexShader}
  // `
  // shader.vertexShader = shader.vertexShader.replace(
  //   "#include <begin_vertex>",
  //   `
  //   vec3 transformed = vec3(position);
  //   vec2 offset = vec2(-mouse.x, mouse.y) * 0.25;
  //   float d = 0.005;//0.075;//texture2D(bumpMap, uv).z*0.1;
  //   float displ = snoise(transformed*disp*disp+time*0.2) * d - d / 2.0;
  //   transformed.xy += displ*(1.0-length(uv-0.5));
  //   transformed.xy += offset*d;
  //   transformedNormal.xy += displ*d*(1.0-length(uv-0.5));
  //   transformedNormal.xy += offset*d;
  //   `
  // )

  // shader.fragmentShader = shader.fragmentShader.replace(
  //   "#include <map_fragment>",
  //   `
  //   #ifdef USE_MAP
  //     vec4 texelColor = texture2D( map, vUv );
  //     vec4 bmap = texture2D( bumpMap, vUv );
  //     vec4 nmap = texture2D( normalMap, vUv );
  //     texelColor = mapTexelToLinear( texelColor );
  //     diffuseColor *= texelColor * (bmap.z);
  //   #endif
  //   `
  // )
  materialShader = shader
}

export default function MorphMesh({ started, mouse, onPointerDown, ...props }) {
  const mesh = useRef()

  const [map, normalMap, map1] = useLoader(TextureLoader, [
    "/cover_color.jpg",
    "/cover_norm.jpg",
    "/cover-back.jpg"
    //"/cover_disp.jpg"
  ])

  useFrame(({ clock, frames, ...props }) => {
    if (!mesh.current) return

    const t = clock.getElapsedTime()

    if (materialShader) {
      materialShader.uniforms.time.value = t
    }
  })

  return (
    <mesh ref={mesh} {...props}>
      <boxBufferGeometry args={[1, 1, 0.02, 128, 128]} attach="geometry" />
      <meshPhongMaterial object={material} attachArray="material" map={map} />
      <meshPhongMaterial object={material} attachArray="material" map={map} />
      <meshPhongMaterial object={material} attachArray="material" map={map} />
      <meshPhongMaterial object={material} attachArray="material" map={map1} />
      <meshPhongMaterial
        object={material}
        attachArray="material"
        map={map}
        normalMap={normalMap}
        normalScale={[0.4, 0.4]}
        specularColor="darkgray"
      />
      <meshPhongMaterial
        object={material}
        attachArray="material"
        map={map1}
        normalMap={normalMap}
        normalScale={[0.4, 0.4]}
        specularColor="darkgray"
      />
    </mesh>
  )
}
