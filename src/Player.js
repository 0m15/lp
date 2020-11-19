import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useLoader, useThree, useUpdate } from "react-three-fiber"
import {
  AudioLoader,
  AudioListener,
  Audio,
  AudioAnalyser,
  DataTexture
} from "three"

const listener = new AudioListener()
const loader = new AudioLoader()
const trackA = new Audio(listener)
const trackB = new Audio(listener)

const fftSize = 512

export default function Player({ side = "A", dataTexture, isPlaying = false }) {
  useEffect(() => {
    // create empty buffer
    var buffer = trackA.context.createBuffer(1, 1, 22050)

    window.addEventListener("click", () => {
      var source = trackA.context.createBufferSource()
      source.buffer = buffer
      source.connect(trackA.context.destination)
      source.start(0)
    })

    loader.load("/niente-192.mp3", (buffer) => {
      trackA.setBuffer(buffer)
      trackA.setLoop(false)
      trackA.setVolume(0.9)
    })
    loader.load("/due-192.mp3", (buffer) => {
      trackB.setBuffer(buffer)
      trackB.setLoop(false)
      trackB.setVolume(0.9)
    })
  }, [])

  useEffect(() => {
    if (isPlaying) {
      if (side === "A") {
        //trackB.hasPlaybackControl && trackB.stop()
        if (trackB.isPlaying && trackB.hasPlaybackControl) trackB.stop()
        trackA.play()
      } else {
        //trackA.hasPlaybackControl && trackA.stop()

        if (trackA.isPlaying && trackA.hasPlaybackControl) trackA.stop()
        trackB.play()
      }
    } else {
      trackA.isPlaying && trackA.hasPlaybackControl && trackA.stop()
      trackB.isPlaying && trackB.hasPlaybackControl && trackB.stop()
    }
  }, [isPlaying])

  return null
}
