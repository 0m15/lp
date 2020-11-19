import React, { Suspense, useRef, useState } from "react"
import Background from "./Background"
import { Html, useProgress } from "drei"
import Ui from "./Ui"
import { useFrame, useThree } from "react-three-fiber"
import { Vector3 } from "three"
import LP from "./LP"
import useAccelerometer from "./MotionSensor"
import Player from "./Player"
import useStore from "./store"

const zoomIn = new Vector3(0, 0, 5)

function ZoomIn({ to = zoomIn } = {}) {
  useFrame(({ camera }) => {
    camera.position.lerp(to, 0.05)
  })

  return null
}

const lookAt = new Vector3(0, 0, 0)

export default function Scene() {
  const input = useRef([0, 0, 0])

  useAccelerometer({
    onMotion: (acceleration) =>
      void ((input.current[0] = acceleration[0]),
      (input.current[1] = acceleration[1]),
      (input.current[2] = acceleration[2]))
  })

  const lp = useRef()
  const [playingState, setPlayingState] = useState(false)
  const [started, setStarted] = useState(true)
  const { size, mouse: _mouse } = useThree()
  const { progress } = useProgress()
  const side = useStore((state) => state.side)

  useFrame(({ camera }) => {
    input.current[0] = _mouse.x
    input.current[1] = _mouse.y

    // lookAt.x = lerp(lookAt.x, input.current[0] * 0.2, 0.0075)
    // lookAt.y = lerp(lookAt.y, input.current[1] * 0.2, 0.005)
    // camera.lookAt(lookAt)
  })

  return (
    <>
      <color attach="background" args={["white"]} />
      <ambientLight intensity={2.9} />
      <pointLight position={[5, 1, -3]} intensity={1} />
      <color attach="background" args={["#111"]} />
      <Suspense fallback={null}>
        <LP
          progress={progress}
          started={started}
          playingState={playingState}
          ref={lp}
          mouse={input.current}
          position={[0, 0, 0]}
          onStart={() => {
            setPlayingState(1)
          }}
          onStop={() => {
            setPlayingState(0)
          }}
          onPlay={() => {
            setPlayingState(2)
          }}
          onPause={() => {
            setPlayingState(1)
          }}
        />
      </Suspense>
      <Player
        side={side}
        isPlaying={playingState}
        isStarted={playingState === 1}
      />
      <Html fullscreen>
        <Ui
          progress={progress}
          started={started}
          playingState={playingState}
          onStart={() => setStarted(true)}
        />
      </Html>
    </>
  )
}
