import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useFrame, useLoader, useThree, useUpdate } from "react-three-fiber"
import {
  AudioLoader,
  AudioListener,
  Audio,
  AudioAnalyser,
  DataTexture
} from "three"
import useStore from "./store"

export default function Player({ dataTexture }) {
  const { side, playingState } = useStore((state) => ({
    side: state.side,
    playingState: state.playingState
  }))

  const willPause = useRef(false)
  const audio = useMemo(
    () => document.getElementById(side === "A" ? "trackA" : "trackB"),
    [side]
  )

  useEffect(() => {
    if (playingState === 2 || playingState === 3) {
      audio.volume = 0.9
      audio.play()
      willPause.current = false
    } else {
      willPause.current = true
    }
  }, [playingState, side])

  useFrame(() => {
    if (willPause.current && audio.volume > 0) {
      audio.volume = Math.max(0, audio.volume - 0.015)
    } else if (audio.volume <= 0) {
      audio.pause()
    }
  })

  return null
}
