import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useFrame, useLoader, useThree, useUpdate } from "react-three-fiber"
import {
  AudioLoader,
  AudioListener,
  Audio,
  AudioAnalyser,
  DataTexture
} from "three"

// const listener = new AudioListener()
// const loader = new AudioLoader()
// const trackDummy = new Audio(listener)

// const trackA = new Audio(listener)
// const trackB = new Audio(listener)

// const fftSize = 512

export default function Player({ side = "A", dataTexture, isPlaying = false }) {
  const willPause = useRef(false)
  const audio = useMemo(
    () => document.getElementById(side === "A" ? "trackA" : "trackB"),
    [side]
  )

  useEffect(() => {
    if (isPlaying === 2) {
      audio.volume = 0.9
      audio.play()
      willPause.current = false
    } else {
      willPause.current = true
    }
  }, [isPlaying, side])

  useFrame(() => {
    if (willPause.current && audio.volume > 0) {
      audio.volume = Math.max(0, audio.volume - 0.015)
    } else if (audio.volume <= 0) {
      audio.pause()
      audio.currentTime = 0
    }
  })

  return null
}
