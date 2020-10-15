import React, { useMemo, useRef } from "react"
import { extend, useFrame } from "react-three-fiber"
import { VideoTexture } from "three"
import VideoMaterial from "./VideoMaterial"

extend({ VideoMaterial })

export default function Video({ ...props }) {
  const material = useRef()
  const texture = useMemo(() => {
    return new VideoTexture(document.getElementById("video"))
  }, [])

  useFrame(({ clock }) => {
    if (!material.current) return
    material.current.uniforms.time.value = clock.getElapsedTime() * 0.25
  })

  return (
    <mesh position={[0, 0, 0]} {...props}>
      <planeBufferGeometry attach="geometry" args={[0.99, 0.99, 0.99]} />
      <videoMaterial
        ref={material}
        uniforms-tInput-value={texture}
        attach="material"
      />
    </mesh>
  )
}
