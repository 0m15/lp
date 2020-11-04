import React, { forwardRef, useCallback, useRef, useState } from "react"
import { extend, useFrame, useLoader, useThree } from "react-three-fiber"
import { DoubleSide, TextureLoader, VideoTexture } from "three"
import lerp from "lerp"
import VideoMaterial from "./VideoMaterial"
import MorphMesh from "./MorphMesh"
import { useDrag } from "react-use-gesture"
import { useSpring, a } from "@react-spring/three"

extend({ VideoMaterial })

const SIDE_A = 0
const SIDE_B = 1
const SHOW_VINYL = 2
const PLAYING = 3

const DT = 0.075

const Vinyl = React.forwardRef((props, ref) => {
  const [map, bump, normal] = useLoader(TextureLoader, [
    "/vinyl-a.png",
    "/cover-front-a_NRM.png",
    "/vinyl-a-normal.png"
  ])

  return (
    <a.mesh {...props} ref={ref}>
      <circleBufferGeometry attach="geometry" args={[0.7, 64]} />
      <meshPhongMaterial
        map={map}
        // bumpMap={bump}
        // normalMap={normal}
        bumpScale={1}
        attach="material"
        //color="rgba(250, 190, 0, 0.5)"
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

    const [rotate, setRotation] = useSpring(() => ({
      y: 1,
      from: {
        y: 0
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
          lastRotation.current = rotateY
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
      <a.group
        ref={group}
        {...props}
        position-y={offset.y.to((d) => d * -5)}
        rotation-y={rotate.y.to((d) => d * Math.PI)}>
        <Vinyl position-y={offset.y.to((d) => d * Math.PI)} ref={vinyl} />
        <MorphMesh mouse={mouse} started={started} />
      </a.group>
    )
  }
)

export default LP
