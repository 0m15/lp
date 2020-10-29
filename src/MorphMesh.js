import lerp from "lerp"
import React, { useMemo, useRef, useState } from "react"
import { extend, useFrame, useLoader, useUpdate } from "react-three-fiber"
import {
  BackSide,
  BoxBufferGeometry,
  ConeBufferGeometry,
  DodecahedronBufferGeometry,
  DoubleSide,
  Float32BufferAttribute,
  FrontSide,
  IcosahedronBufferGeometry,
  MeshBasicMaterial,
  MeshPhongMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  ShaderMaterial,
  TetrahedronBufferGeometry,
  TextureLoader,
  Vector3
} from "three"
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

  // shader.fragmentShader = `
  //   uniform float time;
  //   uniform vec2 mouse;

  //   ${snoise}
  //   ${shader.fragmentShader}
  // `

  // shader.fragmentShader = shader.fragmentShader.replace(
  //   "#include <map_fragment>",
  //   `
  //   #ifdef USE_MAP

  //     float d = 1.0-distance(vUv-vec2(0.5), mouse);
  //     vec2 offset1 = vec2(-mouse.x, mouse.y) * 0.05;

  //     vec3 bumpM = texture2D(bumpMap, vUv).xyz;
  //     vec3 norm = texture2D( normalMap, vUv ).xyz * 2.0 - 1.0;
  //     vec3 mapN = texture2D( normalMap, vUv+offset1*bumpM.z *d ).xyz * 2.0 - 1.0;

  //     vec4 texelColor = texture2D( map, vUv+offset1 * bumpM.z);
  //     texelColor = mapTexelToLinear( texelColor );
  //     diffuseColor *= texelColor;
  //   #endif
  //   `
  // )

  // shader.fragmentShader = shader.fragmentShader.replace(
  //   "#include <normal_fragment_maps>",
  //   `
  //   vec2 offset = vec2(mouse.x, mouse.y) * 0.01;

  //   #ifdef OBJECTSPACE_NORMALMAP

  //   normal = texture2D( normalMap, vUv ).xyz * 2.0 - 1.0;

  //   #ifdef FLIP_SIDED
  // 	  normal = - normal;
  //   #endif
  //   #ifdef DOUBLE_SIDED
  // 	  normal = normal * ( float( gl_FrontFacing ) * 2.0 - 1.0 );
  //   #endif
  //   normal = normalize( normalMatrix * normal );
  //   #elif defined( TANGENTSPACE_NORMALMAP )
  //   mapN.xy *= normalScale;
  //   #ifdef USE_TANGENT
  //     normal = normalize( vTBN * mapN );
  //   #else
  //     normal = perturbNormal2Arb( -vViewPosition, normal, mapN );
  //   #endif
  // #elif defined( USE_BUMPMAP )
  //   normal = perturbNormalArb( -vViewPosition, normal, dHdxy_fwd() );
  // #endif

  // texelColor = vec4(1.0);//texture2D( map, vUv+offset1*normal.z );
  // texelColor = mapTexelToLinear( texelColor );
  // diffuseColor *= texelColor;
  //   `
  // )

  materialShader = shader
}

export const createMorphGeometry = () => {
  var geometry = new BoxBufferGeometry(2, 2, 0.01, 32, 32, 32)
  return geometry
}

export default function MorphMesh({ started, mouse, onPointerDown, ...props }) {
  const mesh = useRef()
  const geometry = useMemo(() => createMorphGeometry(), [])
  const [isActive, setActive] = useState(false)
  const [isHover, setHover] = useState(false)

  const [map, normalMap, bumpMap] = useLoader(TextureLoader, [
    "/cover_color.png",
    "/cover_norm.png",
    "/cover_disp.png"
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

    if (started) {
      //mesh.current.rotation.y = lerp(mesh.current.rotation.y, -Math.PI, 0.05)
    } else {
      //mesh.current.rotation.y += 0.005
    }

    f.current += 1
    i.current = Math.round(((Math.sin(t) + 1) / 2) * 10)

    if (t < 2) return
    //mesh.current.material.opacity = lerp(mesh.current.material.opacity, 1, 0.01)
    //mesh.current.morphTargetInfluences[1] = (Math.sin(t) + 1) * 0.15
  })

  return (
    <mesh
      //position={[0, 0, -2]}
      ref={mesh}
      //onPointerDown={onPointerDown}
      // onPointerOver={() => {
      //   setHover(true)
      // }}
      // onPointerOut={() => {
      //   if (started) return
      //   setHover(false)
      // }}
      {...props}>
      {/* <primitive object={geometry} attach="geometry" /> */}
      <boxBufferGeometry
        args={[1.5, 1.5, 0.02, 128, 128, 128]}
        attach="geometry"
      />
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
        // displacementBias={-0.1}
        // displacementScale={0.1}
      />
      {/* <customMaterial attach="material" map={map} morphTargets /> */}
    </mesh>
  )
}
