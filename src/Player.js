import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useLoader, useThree, useUpdate } from "react-three-fiber"
import {
  AudioLoader,
  AudioListener,
  Audio,
  AudioAnalyser,
  DataTexture
} from "three"

const loader = new AudioLoader()
const fftSize = 512

export default function Player({ side = "A", dataTexture, isPlaying = false }) {
  const { camera } = useThree()

  const [audio, analyser] = useMemo(() => {
    const listener = new AudioListener()
    const audio = new Audio(listener)
    return [audio, new AudioAnalyser(audio, fftSize)]
  }, [camera])

  useEffect(() => {
    loader.load(side === "A" ? "/niente-192.mp3" : "/due-192.mp3", (buffer) => {
      audio.setBuffer(buffer)
      audio.setLoop(false)
      audio.setVolume(0.9)
      if (audio.isPlaying) {
        audio.stop()
        audio.play()
      }
    })
  }, [audio, side])

  useEffect(() => {
    if (!audio) return

    if (isPlaying && audio.hasPlaybackControl) {
      audio.play()
    } else if (audio.isPlaying) {
      audio.stop()
    }
  }, [isPlaying, audio])

  return null
}
