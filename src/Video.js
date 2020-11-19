import React, { useEffect, useMemo, useRef } from "react"
import { extend, useFrame } from "react-three-fiber"
import { VideoTexture } from "three"
import VideoMaterial from "./VideoMaterial"

extend({ VideoMaterial })

export default function Video({ playingState, ...props }) {
  const material = useRef()
  const texture = useMemo(() => {
    return new VideoTexture(document.getElementById("video"))
  }, [])

  useEffect(() => {
    const video = document.getElementById("video")

    const onClick = () => {
      if (playingState) {
        video.play()
      } else {
        video.pause()
      }
    }
    document.addEventListener("click", onClick)

    return () => {
      document.removeEventListener("click", onClick)
    }
  }, [playingState])

  useFrame(({ clock }) => {
    if (!material.current) return
    material.current.uniforms.time.value = clock.getElapsedTime() * 0.25
  })

  return (
    <mesh position={[0, 0, 1]} {...props}>
      <planeBufferGeometry attach="geometry" args={[1.5, 1.5, 1.5]} />
      <videoMaterial
        ref={material}
        uniforms-tInput-value={texture}
        attach="material"
      />
      <meshStandardMaterial />
    </mesh>
  )
}
