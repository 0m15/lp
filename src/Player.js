import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useLoader, useThree, useUpdate } from "react-three-fiber"
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
  useEffect(() => {
    const audio = document.getElementById(side === "A" ? "trackA" : "trackB")

    if (isPlaying === 2) {
      audio.play()
    } else {
      audio.pause()
      audio.currentTime = 0
    }
  }, [isPlaying, side])

  return null
}
