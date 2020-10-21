import { useAspect } from "drei"
import lerp from "lerp"
import React, { useEffect, useMemo, useRef } from "react"
import {
  extend,
  useFrame,
  useLoader,
  useThree,
  useUpdate
} from "react-three-fiber"
import {
  DoubleSide,
  MirroredRepeatWrapping,
  TextureLoader,
  VideoTexture
} from "three"
import BackgroundMaterial from "./shaders/Background"

extend({ BackgroundMaterial })

const videoTexture = new VideoTexture(document.getElementById("video"))
videoTexture.wrapS = MirroredRepeatWrapping
videoTexture.wrapT = MirroredRepeatWrapping

export default function Background({ mouse, started, playingState, ...props }) {
  const mesh = useRef()
  const { size } = useThree()
  const scale = useAspect("cover", 480, 480, 1)

  const [map, noise] = useLoader(TextureLoader, [
    "/cover-front-a_NRM.png",
    "/noise-a.jpg"
  ])

  useUpdate(() => {
    map.wrapS = MirroredRepeatWrapping
    map.wrapT = MirroredRepeatWrapping
    noise.wrapS = MirroredRepeatWrapping
    noise.wrapT = MirroredRepeatWrapping
  }, [map, noise])

  useEffect(() => {
    const video = document.getElementById("video")

    const onClick = () => {
      if (!playingState) {
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
    if (!mesh.current) return

    const t = clock.getElapsedTime()

    mesh.current.material.uniforms.time.value = t
    mesh.current.material.uniforms.mouse.value = [
      Math.cos(t * 0.75) * 1,
      Math.sin(t * 0.75) * 1
    ]

    mesh.current.material.uniforms.alpha.value = lerp(
      mesh.current.material.uniforms.alpha.value,
      1.0,
      0.01
    )

    if (playingState) {
      mesh.current.material.uniforms.videoAlpha.value = lerp(
        mesh.current.material.uniforms.videoAlpha.value,
        1.0,
        0.025
      )
    } else {
      mesh.current.material.uniforms.videoAlpha.value = lerp(
        mesh.current.material.uniforms.videoAlpha.value,
        0,
        0.05
      )
    }
  })

  return (
    <mesh ref={mesh} {...props}>
      <planeBufferGeometry scale={scale} attach="geometry" args={[20, 10, 1]} />
      <backgroundMaterial
        // side={DoubleSide}
        uniforms-map-value={map}
        uniforms-map1-value={videoTexture}
        uniforms-noise-value={noise}
        uniforms-resolution-value={[
          size.width * window.devicePixelRatio,
          size.height * window.devicePixelRatio
        ]}
      />
      {/* <meshStandardMaterial map={map} color="#fff" /> */}
    </mesh>
  )
}
