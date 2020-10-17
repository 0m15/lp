import lerp from "lerp"
import React, { useMemo, useRef, useState } from "react"
import { useFrame, useLoader, useUpdate } from "react-three-fiber"
import {
  BoxBufferGeometry,
  DodecahedronBufferGeometry,
  Float32BufferAttribute,
  IcosahedronBufferGeometry,
  TextureLoader,
  Vector3
} from "three"

export const createMorphGeometry = () => {
  var geometry = new BoxBufferGeometry(1.5, 1.5, 1.5, 8, 8, 8)

  // create an empty array to hold targets for the attribute we want to morph
  // morphing positions and normals is supported
  geometry.morphAttributes.position = []

  // the original positions of the cube's vertices
  var positions = geometry.attributes.position.array

  // for the first morph target we'll move the cube's vertices onto the surface of a sphere
  var spherePositions = []

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

  // Hack required to get Mesh to have morphTargetInfluences attribute
  geometry.morphTargets = []
  geometry.morphTargets.push(0)

  return geometry
}

export default function MorphMesh() {
  const mesh = useRef()
  const geometry = useMemo(() => createMorphGeometry(), [])
  const [isActive, setActive] = useState(false)
  const [isHover, setHover] = useState(false)

  const [map, bumpMap, normalMap] = useLoader(TextureLoader, [
    "/cover-front-a.jpg",
    "/cover-bump.jpg",
    "/cover-front-a_NRM.png"
  ])

  useFrame(({ clock }) => {
    if (!mesh.current.morphTargetInfluences) mesh.current.updateMorphTargets()
    const t = clock.getElapsedTime()

    if (isHover && !isActive) {
      mesh.current.morphTargetInfluences[0] = lerp(
        mesh.current.morphTargetInfluences[0],
        4,
        0.15
      )
      mesh.current.rotation.y += 0.005
    } else if (isActive) {
      mesh.current.morphTargetInfluences[0] = lerp(
        mesh.current.morphTargetInfluences[0],
        0,
        0.05
      )
      mesh.current.scale.z = lerp(mesh.current.scale.z, 0.01, 0.05)
      mesh.current.rotation.y = lerp(mesh.current.rotation.y, -Math.PI, 0.05)
    } else {
      mesh.current.morphTargetInfluences[0] = lerp(
        mesh.current.morphTargetInfluences[0],
        Math.sin(t) + 6,
        0.05
      )
      mesh.current.scale.z = 1
      mesh.current.rotation.y += 0.01
    }

    if (t < 2) return
    mesh.current.material.opacity = lerp(mesh.current.material.opacity, 1, 0.01)
    //mesh.current.morphTargetInfluences[1] = (Math.sin(t) + 1) * 0.15
  })

  return (
    <mesh
      position={[0, 0, -2]}
      ref={mesh}
      onPointerDown={() => {
        setActive(true)
      }}
      onPointerOver={() => {
        setHover(true)
      }}
      onPointerOut={() => {
        if (isActive) return
        console.log("active")
        setHover(false)
      }}>
      <primitive object={geometry} attach="geometry" />
      {/* <boxBufferGeometry args={[2, 2, 2]} /> */}
      <meshPhongMaterial
        attach="material"
        morphTargets
        map={map}
        bumpMap={bumpMap}
        //specularMap={bumpMap}
        //specular="#777"
        transparent
        opacity={0}
      />
    </mesh>
  )
}
