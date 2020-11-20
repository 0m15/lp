import React, { forwardRef, useCallback, useRef, useState } from "react"
import { extend, useFrame, useLoader, useThree } from "react-three-fiber"
import { DoubleSide, TextureLoader, VideoTexture } from "three"
import VideoMaterial from "./VideoMaterial"
import MorphMesh from "./MorphMesh"
import { useDrag } from "react-use-gesture"
import { useSpring, a } from "@react-spring/three"
import Background from "./Background"
import useStore from "./store"
import { useAspect } from "drei"

extend({ VideoMaterial })

const Vinyl = React.forwardRef((props, ref) => {
  const [map, normalMap] = useLoader(TextureLoader, [
    "/vinyl-c.png",
    "vinyl-c_norm.png"
  ])

  return (
    <a.mesh {...props} ref={ref}>
      <circleBufferGeometry attach="geometry" args={[0.5, 64]} />
      <meshPhongMaterial
        map={map}
        normalMap={normalMap}
        attach="material"
        side={DoubleSide}
        transparent
      />
    </a.mesh>
  )
})

const LP = forwardRef(
  (
    {
      mouse,
      started,
      onStart = () => {},
      onPlay = () => {},
      onPlayVideo = () => {},
      onPause = () => {},
      onStop = () => {},
      ...props
    } = {},
    group
  ) => {
    const vinyl = useRef()
    const [scale] = useAspect("cover", 100, 100, 0.45)
    const { side, setSide, playingState } = useStore((state) => ({
      side: state.side,
      setSide: state.setSide,
      playingState: state.playingState
    }))

    const [rotate, setRotation] = useSpring(() => ({
      y: 0,
      from: {
        y: 1
      },
      reset: true
    }))

    const [offset, setOffset] = useSpring(() => ({
      y: 0,
      from: {
        y: 0.5
      },
      reset: true
    }))

    const lastRotation = useRef(0)
    const lastOffset = useRef(0)

    const bind = useDrag(
      ({
        down,
        movement: [mx, my],
        direction: [xDir, yDir],
        axis,
        velocity,
        tap
      }) => {
        // tap on cover and vinyl
        if (tap) {
          if (playingState === 0) {
            onPlayVideo()
          } else if (playingState === 1) {
            onPlay()
          } else if (playingState === 2) {
            onPause()
          } else {
            onStop()
          }
          return
        }

        // swipe handling
        let dy = my / window.innerHeight
        let dx = (mx / window.innerWidth) * 2

        console.log({ dy })
        const trigger =
          velocity > 0.4 || Math.abs(dx) > 0.6 || Math.abs(dy) > 0.17

        const rotateY =
          xDir > 0 ? lastRotation.current + 1 : lastRotation.current - 1
        const offsetY = yDir > 0 ? 0 : 0.5

        // swipe up/down
        if (axis === "y") {
          if (!down && trigger) {
            offsetY ? onStart() : onStop()
            setOffset({ y: offsetY })
            lastOffset.current = offsetY
          } else if (!down) {
            setOffset({ y: lastOffset.current })
          } else {
            setOffset({
              y: lastOffset.current - dy,
              bounds: { top: 0.01, bottom: 0.01, left: 0, right: 0 },
              rubberband: true
            })
          }
          return
        }

        // already playing track or video
        if (playingState >= 2) return

        // swipe left/right
        if (!down && trigger) {
          setRotation({ y: rotateY })
          setSide(side === "A" ? "B" : "A")
          lastRotation.current = rotateY
        } else if (!down) {
          setRotation({ y: lastRotation.current })
        } else {
          setRotation({ y: lastRotation.current + dx })
        }
      },
      {
        lockDirection: true
        //domTarget: window
      }
    )

    useFrame(() => {
      if (playingState === 2) {
        vinyl.current.rotation.z -= side === "A" ? 0.015 : -0.015
      }
    })

    return (
      <group
        {...props}
        scale={[Math.min(1.5, scale), Math.min(1.5, scale), 1]}
        {...bind()}>
        <group
          scale={[scale, Math.min(1.25, scale), 1]}
          position={[0, 0, -0.5]}>
          <mesh>
            <planeBufferGeometry args={[1, 1, 1]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
        </group>
        <a.group
          ref={group}
          rotation-y={rotate.y.to((d) => d * Math.PI)}
          position-y={offset.y.to((d) => -d * 1.5)}>
          <Vinyl position-y={offset.y.to((d) => d * 2)} ref={vinyl} />
          <MorphMesh mouse={mouse} started={started} />
        </a.group>
        <a.group position-y={offset.y.to((d) => -d * 1.5)}>
          <Background
            playingState={playingState === 3}
            position={[0, 0, 0.05]}
          />
        </a.group>
      </group>
    )
  }
)

export default LP
