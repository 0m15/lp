import lerp from "lerp"
import React, { useMemo, useRef, useState } from "react"
import { extend, useFrame, useLoader, useUpdate } from "react-three-fiber"
import {
  BoxBufferGeometry,
  ConeBufferGeometry,
  DodecahedronBufferGeometry,
  Float32BufferAttribute,
  IcosahedronBufferGeometry,
  MeshPhongMaterial,
  MeshPhysicalMaterial,
  ShaderMaterial,
  TetrahedronBufferGeometry,
  TextureLoader,
  Vector3
} from "three"
import { snoise } from "./shaders/snoise"

// https://blog.mozvr.com/customizing-vertex-shaders/
export const mat = new MeshPhongMaterial()
export let materialShader = null

mat.onBeforeCompile = (shader) => {
  shader.uniforms.time = { value: 0 }
  shader.vertexShader = `
    uniform float time;
    ${snoise}
    ${shader.vertexShader}
  `
  shader.vertexShader = shader.vertexShader.replace(
    "#include <begin_vertex>",
    `
    vec3 transformed = vec3(position);
    float d = 0.015;
    float displ = snoise(transformed*1.0+time*0.1) * d - d / 2.0;
    transformed += displ;
    `
  )

  shader.vertexShader = shader.vertexShader.replace(
    "#include <morphtarget_vertex>",
    `
  #ifdef USE_MORPHTARGETS
    // morphTargetBaseInfluence is set based on BufferGeometry.morphTargetsRelative value:
    // When morphTargetsRelative is false, this is set to 1 - sum(influences); this results in position = sum((target - base) * influence)
    // When morphTargetsRelative is true, this is set to 1; as a result, all morph targets are simply added to the base after weighting
    float displ1 = snoise(morphTarget0 * 4.0 + time * 0.25) * d - d / 2.0;

    transformed *= morphTargetBaseInfluence;
    transformed += (morphTarget0 + displ1) * morphTargetInfluences[ 0 ];
    transformed += morphTarget1 * morphTargetInfluences[ 1 ];
    transformed += morphTarget2 * morphTargetInfluences[ 2 ];
    transformed += morphTarget3 * morphTargetInfluences[ 3 ];
	#ifndef USE_MORPHNORMALS
    transformed += morphTarget4 * morphTargetInfluences[ 4 ];
    transformed += morphTarget5 * morphTargetInfluences[ 5 ];
    transformed += morphTarget6 * morphTargetInfluences[ 6 ];
    transformed += morphTarget7 * morphTargetInfluences[ 7 ];
	#endif
#endif
      `
  )

  materialShader = shader
}

export const createMorphGeometry = () => {
  var geometry = new BoxBufferGeometry(2, 2, 2, 32, 32, 32)
  var geometry1 = new IcosahedronBufferGeometry(1.5, 2)
  //var geometry1 = new ConeBufferGeometry(1.5, 1.5, 32, 32)
  //var geometry1 = new BoxBufferGeometry(1.5, 1.5, 1.5, 32, 32, 32)

  // create an empty array to hold targets for the attribute we want to morph
  // morphing positions and normals is supported
  geometry.morphAttributes.position = []

  // the original positions of the cube's vertices
  var positions = geometry.attributes.position.array
  var positions1 = geometry1.attributes.position.array

  // for the first morph target we'll move the cube's vertices onto the surface of a sphere
  var spherePositions = []
  var boxPositions = []

  // for the second morph target, we'll twist the cubes vertices
  var twistPositions = []
  var direction = new Vector3(1, 0, 0).normalize()
  var vertex = new Vector3()

  for (var i = 0; i < positions.length; i += 3) {
    var x = positions[i]
    var y = positions[i + 1]
    var z = positions[i + 2]

    spherePositions.push(
      x * Math.sqrt(1 - (y * y) / 2 - (z * z) / 2 + (y * y * z * z) / 3),
      y * Math.sqrt(1 - (z * z) / 2 - (x * x) / 2 + (z * z * x * x) / 3),
      z * Math.sqrt(1 - (x * x) / 2 - (y * y) / 2 + (x * x * y * y) / 3)
    )

    boxPositions.push(positions1[i], positions1[i + 1], positions1[i + 2])

    // stretch along the x-axis so we can see the twist better
    vertex.set(x * 2, y, z)

    vertex
      .applyAxisAngle(direction, (Math.PI * x) / 2)
      .toArray(twistPositions, twistPositions.length)
  }

  // add the spherical positions as the first morph target
  geometry.morphAttributes.position[0] = new Float32BufferAttribute(
    spherePositions,
    3
  )

  // add the twisted positions as the second morph target
  geometry.morphAttributes.position[1] = new Float32BufferAttribute(
    twistPositions,
    3
  )

  return geometry
}

export default function MorphMesh({ started, onPointerDown, ...props }) {
  const mesh = useRef()
  const geometry = useMemo(() => createMorphGeometry(), [])
  const [isActive, setActive] = useState(false)
  const [isHover, setHover] = useState(false)

  const [map, normalMap] = useLoader(TextureLoader, [
    "/cover-front-a.jpg",
    "/cover-front-a_NRM.png"
  ])

  const n = useRef(Math.random() * 9 - 5)
  const i = useRef(60)
  const f = useRef(0)

  useFrame(({ clock, frames, ...props }) => {
    if (!mesh.current) return
    if (!mesh.current.morphTargetInfluences) mesh.current.updateMorphTargets()

    const t = clock.getElapsedTime()
    if (materialShader) materialShader.uniforms.time.value = t

    if (f.current % 10 === 0) n.current = Math.random() * 6 + 1

    if (isHover && !started) {
      mesh.current.morphTargetInfluences[0] = lerp(
        mesh.current.morphTargetInfluences[0],
        n.current,
        0.5
      )
      mesh.current.rotation.y += 0.005
      //mesh.current.material.wireframe = true
    } else if (started) {
      mesh.current.morphTargetInfluences[0] = lerp(
        mesh.current.morphTargetInfluences[0],
        0,
        0.1
      )
      mesh.current.scale.z = lerp(mesh.current.scale.z, 0.01, 0.05)
      mesh.current.rotation.y = lerp(mesh.current.rotation.y, -Math.PI, 0.05)
      // mesh.current.material.wireframe = false
    } else {
      // mesh.current.morphTargetInfluences[0] = lerp(
      //   mesh.current.morphTargetInfluences[0],
      //   1, //Math.sin(t * 0.5) + 2,
      //   0.25
      // )

      mesh.current.morphTargetInfluences[0] = 4
      mesh.current.scale.x = 1 // + Math.sin(t * 0.5) * 0.25
      mesh.current.scale.y = 1 // + Math.sin(t * 0.5) * 0.25
      mesh.current.scale.z = 1 // + Math.sin(t * 0.5) * 0.25

      mesh.current.rotation.y += 0.005
      //mesh.current.material.wireframe = true
    }

    f.current += 1

    //    if (f.current % 5 === 0) {
    //i.current = Math.max(10, Math.round(((Math.sin(t) + 1) / 2) * 30))
    i.current = Math.round(((Math.sin(t) + 1) / 2) * 10)

    //    }

    if (t < 2) return
    mesh.current.material.opacity = lerp(mesh.current.material.opacity, 1, 0.01)
    //mesh.current.morphTargetInfluences[1] = (Math.sin(t) + 1) * 0.15
  })

  return (
    <mesh
      //position={[0, 0, -2]}
      ref={mesh}
      onPointerDown={onPointerDown}
      onPointerOver={() => {
        setHover(true)
      }}
      onPointerOut={() => {
        if (started) return
        setHover(false)
      }}
      {...props}>
      <primitive object={geometry} attach="geometry" />
      {/* <boxBufferGeometry args={[2, 2, 2]} /> */}
      <primitive
        object={mat}
        attach="material"
        morphTargets
        map={map}
        normalMap={normalMap}
        normalScale={[0.1, 0.1]}
        //specularMap={bumpMap}
        //specular="white"
        transparent
        opacity={0}
        wireframe={!started}
      />
      {/* <customMaterial attach="material" map={map} morphTargets /> */}
    </mesh>
  )
}
