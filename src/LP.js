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
  const [map, normalMap, bumpMap, specularMap] = useLoader(TextureLoader, [
    "/vinyl-a.png",
    "/vinyl-a-normal.png",
    "/vinyl-a-bump.png",
    "/vinyl-a-spec.png"
  ])

  return (
    <a.mesh {...props} ref={ref}>
      <circleBufferGeometry attach="geometry" args={[0.7, 64]} />
      <meshPhongMaterial
        specularMap={specularMap}
        normalMap={normalMap}
        // specular="rgba(90, 130, 150, 0.5)"
        // bumpMap={bumpMap}
        map={map}
        attach="material"
        bumpScale={0}
        transparent
        side={DoubleSide}
      />
    </a.mesh>
  )
})

const LP = forwardRef(
  (
    { started, onPlay = () => {}, onPause = () => {}, ...props } = {},
    group
  ) => {
    const vinyl = useRef()

    const [lpState, setLpState] = useState(() => SIDE_A)
    const [vinylState, setVinylState] = useState(0)

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
        const trigger = velocity > 0.4
        let dy = (my / window.innerHeight) * 2
        let dx = (mx / window.innerWidth) * 2

        const rotateY = xDir > 0 ? 1 : 0
        const offsetY = yDir > 0 ? 0 : 0.5

        if (axis === "y") {
          console.log("y.axis")
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
          if (
            (lastRotation.current === 0 && !xDir) ||
            (lastRotation.current > 0 && xDir)
          ) {
            // d *= 0.2
          }

          setRotation({ y: lastRotation.current + dx })
        }
      },
      {
        lockDirection: true,
        domTarget: window
      }
    )

    const onClickSide = useCallback(
      (event) => {
        event.stopPropagation()
        setLpState(lpState === SIDE_A ? SIDE_B : SIDE_A)
      },
      [lpState]
    )

    const onClickVinyl = useCallback(() => {
      if (vinylState < SHOW_VINYL) {
        return setVinylState(SHOW_VINYL)
      } else if (vinylState < PLAYING) {
        onPlay()
        return setVinylState(PLAYING)
      }

      onPause()
      setVinylState(0)
    }, [vinylState])

    return (
      <a.group
        ref={group}
        {...props}
        position-y={offset.y.to((d) => d * -3)}
        //rotation-x={offset.y.to((d) => d * 0.5)}
        rotation-y={rotate.y.to((d) => d * Math.PI)}>
        <Vinyl position-y={offset.y.to((d) => d * Math.PI)} ref={vinyl} />
        <MorphMesh started={started} />
      </a.group>
    )
  }
)

export default LP
