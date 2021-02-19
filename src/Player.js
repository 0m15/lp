import { useEffect, useMemo, useRef } from "react"
import { useFrame } from "react-three-fiber"
import useStore from "./store"

const isIOS =
  /iPad|iPhone|iPod/.test(navigator.platform) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)

export default function Player({ dataTexture }) {
  const { side, playingState } = useStore((state) => ({
    side: state.side,
    playingState: state.playingState
  }))

  const audioA = useMemo(() => document.getElementById("trackA"), [])
  const audioB = useMemo(() => document.getElementById("trackB"), [])

  const willPause = useRef(false)
  const prevPlayingState = useRef(playingState)
  const audio = side === "A" ? audioA : audioB

  useEffect(() => {
    if (side === "A" && audioB.volume > 0) {
      //audioB.volume = 0
      audioB.pause()
    }
    if (side === "B" && audioA.volume > 0) {
      audioA.pause()
      //audioA.volume = 0
    }

    if (playingState === 2) {
      audio.volume = 0.9
      audio.play()
      willPause.current = false
    } else if (prevPlayingState.current === 2) {
      if (isIOS) {
        audio.pause()
        prevPlayingState.current = playingState
        return
      }
      willPause.current = true
    }

    prevPlayingState.current = playingState
  }, [playingState, side])

  useFrame(() => {
    if (isIOS) return

    if (willPause.current && audio.volume > 0) {
      audio.volume = Math.max(0, audio.volume - 0.015)
    } else if (audio.volume <= 0 && willPause.current) {
      willPause.current = false
      audio.volume = 0
      audio.pause()
    }
  })

  return null
}
