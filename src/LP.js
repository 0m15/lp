import React, { forwardRef, useCallback, useRef, useState } from "react"
import { extend, useFrame, useLoader, useThree } from "react-three-fiber"
import { DoubleSide, TextureLoader, VideoTexture } from "three"
import VideoMaterial from "./VideoMaterial"
import MorphMesh from "./MorphMesh"
import { useDrag } from "react-use-gesture"
import { useSpring, a } from "@react-spring/three"
import Background from "./Background"
import useStore from "./store"

extend({ VideoMaterial })

const Vinyl = React.forwardRef((props, ref) => {
  const [map] = useLoader(TextureLoader, ["/vinyl-a.png"])

  return (
    <a.mesh {...props} ref={ref}>
      <circleBufferGeometry attach="geometry" args={[0.5, 64]} />
      <meshPhongMaterial
        map={map}
        bumpScale={1}
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
      playingState,
      started,
      onPlay = () => {},
      onPause = () => {},
      ...props
    } = {},
    group
  ) => {
    const vinyl = useRef()
    const { side, setSide } = useStore((state) => ({
      side: state.side,
      setSide: state.setSide
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

    useDrag(
      ({
        down,
        movement: [mx, my],
        direction: [xDir, yDir],
        axis,
        velocity
      }) => {
        let dy = my / window.innerHeight
        let dx = (mx / window.innerWidth) * 2

        const trigger = velocity > 0.4 || Math.abs(dx) > 0.6

        const rotateY =
          xDir > 0 ? lastRotation.current + 1 : lastRotation.current - 1
        const offsetY = yDir > 0 ? 0 : 0.5

        if (axis === "y") {
          if (!down && trigger) {
            offsetY ? onPlay() : onPause()
            setOffset({ y: offsetY })
            lastOffset.current = offsetY
          } else if (!down) {
            setOffset({ y: lastOffset.current })
          } else {
            setOffset({ y: lastOffset.current - dy })
          }
          return
        }

        if (!down && trigger) {
          setRotation({ y: rotateY })
          setSide(side === "A" ? "B" : "A")
          lastRotation.current = rotateY
          console.log({ rotateY })
        } else if (!down) {
          setRotation({ y: lastRotation.current })
        } else {
          setRotation({ y: lastRotation.current + dx })
        }
      },
      {
        lockDirection: true,
        domTarget: window
      }
    )

    useFrame(() => {
      if (playingState) {
        vinyl.current.rotation.z -= 0.01
      }
    })

    return (
      <>
        <a.group
          ref={group}
          {...props}
          rotation-y={rotate.y.to((d) => d * Math.PI)}>
          <Vinyl position-y={offset.y.to((d) => d)} ref={vinyl} />
          <MorphMesh mouse={mouse} started={started} />
        </a.group>
        <a.group position-z={offset.y.to((d) => d)}>
          <Background
            started={true}
            playingState={playingState}
            position={[0, 0, 0]}
          />
        </a.group>
      </>
    )
  }
)

export default LP
