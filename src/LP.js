import { a, useSpring } from "@react-spring/three"
import { useAspect } from "drei"
import React, { forwardRef, useRef } from "react"
import { useFrame, useLoader } from "react-three-fiber"
import { useDrag } from "react-use-gesture"
import { TextureLoader } from "three"
import Cover from "./Cover"
import useStore from "./store"

const Vinyl = ({ side, ...props }) => {
  const ref = useRef()
  const [map, map1] = useLoader(TextureLoader, ["/vinyl-a.png", "/vinyl-b.png"])

  return (
    <a.mesh
      {...props}
      ref={ref}
      rotation-y={Math.PI / 2}
      rotation-x={Math.PI / 2}>
      <cylinderBufferGeometry
        attach="geometry"
        args={[0.5, 0.5, 0.005, 32, 32]}
      />
      <meshBasicMaterial attachArray="material" opacity={0} transparent />
      <meshBasicMaterial map={map} attachArray="material" transparent />
      <meshBasicMaterial map={map1} attachArray="material" transparent />
    </a.mesh>
  )
}

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
      //config: config.gentle
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

        const trigger =
          velocity > 0.4 || Math.abs(dx) > 0.6 || Math.abs(dy) > 0.18

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
              y: Math.max(0, Math.min(0.5, lastOffset.current - dy)),
              rubberband: true
            })
          }
          return
        }

        // already playing track or video
        if (playingState >= 2) return

        // swipe left/right
        if (!down && trigger) {
          setRotation({
            y: rotateY,
            config: {
              mass: 1,
              tension: 50
            }
          })
          setSide(side === "A" ? "B" : "A")
          lastRotation.current = rotateY
        } else if (!down) {
          setRotation({
            y: lastRotation.current,
            config: {
              mass: 1,
              tension: 50
            }
          })
        } else {
          setRotation({
            y: lastRotation.current + dx,
            config: {
              mass: 1,
              tension: 120,
              friction: 16
            }
          })
        }
      },
      {
        lockDirection: true
        //domTarget: window
      }
    )

    let vel = useRef(0)
    useFrame(() => {
      if (playingState === 2 && vel.current < 0.05) {
        vel.current += 0.001
        vel.current = Math.min(vel.current, 0.05)
      } else if (playingState !== 2 && Math.abs(vel.current) > 0.0) {
        vel.current -= 0.001
        vel.current = Math.max(vel.current, 0.0)
      }

      vinyl.current.rotation.z -= side === "A" ? vel.current : -vel.current
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
          <a.group ref={vinyl} position-y={offset.y.to((d) => d * 2)}>
            <Vinyl side={side} />
          </a.group>
          <Cover mouse={mouse} started={started} />
        </a.group>
      </group>
    )
  }
)

export default LP
