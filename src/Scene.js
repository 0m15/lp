import React, { Suspense, useRef, useState } from "react"
import Background from "./Background"
import { Html, useProgress } from "drei"
import Ui from "./Ui"
import { useFrame, useThree } from "react-three-fiber"
import { Vector3 } from "three"
import LP from "./LP"
import useAccelerometer from "./MotionSensor"

const zoomIn = new Vector3(0, 0, 5)
const zoomIn2 = new Vector3(0, 0, 3)

const STATES = {
  0: "IDLE",
  1: "STARTED",
  2: "PLAYING"
}

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
  const [state, setState] = useState(STATES.IDLE)
  const { size, mouse: _mouse } = useThree()
  const { progress } = useProgress()

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
        {/* <Background
          started={started}
          playingState={playingState}
          position={[0, 0, 0]}
          mouse={input.current}
        /> */}
        <LP
          started={started}
          playingState={playingState}
          ref={lp}
          mouse={input.current}
          position={[0, 0, 0]}
          onPlay={() => {
            setPlayingState(true)
          }}
          onPause={() => {
            setPlayingState(false)
          }}
        />
      </Suspense>
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
