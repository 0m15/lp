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
const trackDummy = new Audio(listener)

const trackA = new Audio(listener)
const trackB = new Audio(listener)

const fftSize = 512
let isUnlocked = false

export default function Player({ side = "A", dataTexture, isPlaying = false }) {
  useEffect(() => {
    // create empty buffer
    window.addEventListener("touchstart", () => {
      if (isUnlocked) return
      var buffer = trackDummy.context.createBuffer(1, 1, 22050)
      var source = trackDummy.context.createBufferSource()
      source.buffer = buffer
      source.connect(trackDummy.context.destination)
      source.start(0)

      // by checking the play state after some time, we know if we're really unlocked
      setTimeout(function () {
        if (
          source.playbackState === source.PLAYING_STATE ||
          source.playbackState === source.FINISHED_STATE
        ) {
          isUnlocked = true
        }
      }, 0)
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
        if (trackB.isPlaying && trackB.hasPlaybackControl) trackB.stop()
        trackA.play()
      } else {
        if (trackA.isPlaying && trackA.hasPlaybackControl) trackA.stop()
        trackB.play()
      }
    } else {
      trackA.isPlaying && trackA.hasPlaybackControl && trackA.stop()
      trackB.isPlaying && trackB.hasPlaybackControl && trackB.stop()
    }
  }, [side, isPlaying])

  return null
}
