import React, {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState
} from "react"
import { Html, useProgress } from "drei"
import { useFrame, useThree } from "react-three-fiber"
import { Vector3 } from "three"
import LP from "./LP"
import useAccelerometer from "./MotionSensor"
import Player from "./Player"
import Ui from "./Ui"
import useStore from "./store"

export default function Scene() {
  const lp = useRef()
  const hasInteracted = useRef(false)

  const { playingState, side, setPlayingState } = useStore((state) => ({
    setPlayingState: state.setPlayingState,
    playingState: state.playingState,
    side: state.side
  }))
  const [hintVisibility, setHintVisibility] = useState("off")

  const { mouse: _mouse } = useThree()
  const { progress } = useProgress()

  useEffect(() => {
    if ((side !== "A" || playingState > 0) && !hasInteracted.current) {
      console.log("xxx")
      hasInteracted.current = true
    }
  }, [side, playingState])

  useFrame(({ clock, camera }) => {
    input.current[0] = _mouse.x
    input.current[1] = _mouse.y

    //detect interaction to show hints
    if (hasInteracted.current) {
      if (hintVisibility !== "off") setHintVisibility("off")
      return
    }

    const t = clock.getElapsedTime()

    if (t > 3 && hintVisibility !== "flash") {
      setHintVisibility("flash")
    }
  })

  const onStart = useCallback(() => {
    setPlayingState(1)
  }, [])
  const onStop = useCallback(() => {
    setPlayingState(0)
  }, [])
  const onPlay = useCallback(() => {
    setPlayingState(2)
  }, [])
  const onPlayVideo = useCallback(() => {
    setPlayingState(3)
  }, [])
  const onPause = useCallback(() => {
    setPlayingState(1)
  }, [])

  const input = useRef([0, 0, 0])

  useAccelerometer({
    onMotion: (acceleration) =>
      void ((input.current[0] = acceleration[0]),
      (input.current[1] = acceleration[1]),
      (input.current[2] = acceleration[2]))
  })

  return (
    <>
      <color attach="background" args={["white"]} />
      <ambientLight intensity={1} />
      <pointLight position={[150, 10, 100]} intensity={0.6} color="#AC3BDD" />
      <pointLight
        position={[-150, -10, -100]}
        intensity={0.6}
        color="#81D96C"
      />
      <color attach="background" args={["#130915"]} />
      <Suspense fallback={null}>
        <LP
          progress={progress}
          ref={lp}
          mouse={input.current}
          position={[0, 0, 0]}
          onStart={onStart}
          onStop={onStop}
          onPlay={onPlay}
          onPause={onPause}
          onPlayVideo={onPlayVideo}
        />
      </Suspense>
      <Player side={side} />
      <Html fullscreen>
        <Ui progress={progress} hintVisibility={hintVisibility} />
      </Html>
    </>
  )
}
