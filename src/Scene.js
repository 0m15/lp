import { Html, useProgress } from "drei"
import React, {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState
} from "react"
import { useFrame, useThree } from "react-three-fiber"
import LP from "./LP"
import Player from "./Player"
import useStore from "./store"
import Ui from "./Ui"

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
      hasInteracted.current = true
    }

    // if (side === "A") {
    //   document.body.classList.remove("sideB")
    // } else {
    //   document.body.classList.add("sideB")
    // }
  }, [side, playingState])

  useFrame(({ clock }) => {
    input.current[0] = _mouse.x
    input.current[1] = _mouse.y

    //detect interaction to hide hints
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
  // const onPlayVideo = useCallback(() => {
  //   setPlayingState(3)
  // }, [])
  const onPause = useCallback(() => {
    setPlayingState(1)
  }, [])

  const input = useRef([0, 0, 0])

  return (
    <>
      {/* <color attach="background" args={["black", 0]} /> */}
      <ambientLight intensity={1} />
      <pointLight position={[150, 10, 100]} intensity={0.6} color="#AC3BDD" />
      <pointLight
        position={[-150, -10, -100]}
        intensity={0.6}
        color="#81D96C"
      />
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
          //onPlayVideo={onPlayVideo}
        />
      </Suspense>
      <Player side={side} />
      <Html fullscreen>
        <Ui progress={progress} hintVisibility={hintVisibility} />
      </Html>
    </>
  )
}
