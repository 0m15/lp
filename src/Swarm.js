import * as THREE from "three"
import React, { useRef, useMemo } from "react"
import { extend, useFrame, useLoader } from "react-three-fiber"
import { TextureLoader } from "three"
import BackgroundMaterial from "./shaders/Background"
import lerp from "lerp"

extend({ BackgroundMaterial })
const dummy = new THREE.Object3D()

export default function Swarm({ count = 25, mouse }) {
  const mesh = useRef()

  const [map] = useLoader(TextureLoader, ["/cover-front-a_NRM.png"])

  const particles = useMemo(() => {
    const temp = []
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100
      const factor = 1 + Math.random() * 2
      const speed = 0.01 + Math.random() / 200
      const xFactor = -20 + Math.random() * 40
      const yFactor = -20 + Math.random() * 40
      const zFactor = -40 + Math.random() * 20
      temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 })
    }
    return temp
  }, [count])

  useFrame((state) => {
    particles.forEach((particle, i) => {
      let { t, factor, speed, xFactor, yFactor, zFactor } = particle
      t = particle.t += speed / 2
      const a = Math.cos(t) + Math.sin(t * 1) / 10
      const b = Math.sin(t) + Math.cos(t * 2) / 10
      const s = Math.max(1.5, Math.cos(t) * 5)
      particle.mx = lerp(particle.mx, mouse.current[0] * 2, 0.02)
      particle.my = lerp(particle.my, -mouse.current[1] * 2, 0.02)
      dummy.position.set(
        (particle.mx / 10) * a +
          xFactor +
          Math.cos((t / 10) * factor) +
          (Math.sin(t * 1) * factor) / 10,
        (particle.my / 10) * b +
          yFactor +
          Math.sin((t / 10) * factor) +
          (Math.cos(t * 2) * factor) / 10,
        -20 + yFactor // + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10
      )

      //dummy.scale.set(s, s, s)
      dummy.rotation.set(t * 0.1, t * 0.1, t * 0.1)
      dummy.updateMatrix()
      mesh.current.setMatrixAt(i, dummy.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true
  })

  return (
    <>
      <instancedMesh ref={mesh} args={[null, null, count]}>
        <boxBufferGeometry attach="geometry" args={[2, 2, 2]} />
        <meshNormalMaterial
          bumpMap={map}
          //normalMap={map}
          bumpScale={1}
          //   bumpMap={map}
          //   specular="pink"
          //   attach="material"
          color="rgba(250, 190, 0, 0.5)"
        />
      </instancedMesh>
    </>
  )
}
