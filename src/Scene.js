import React, { Suspense, useEffect, useRef, useState } from "react"
import Background from "./Background"
import { ContactShadows, Html, Shadow, Stars, Text, useProgress } from "drei"
import Ui from "./Ui"
import { useFrame, useThree } from "react-three-fiber"
import Crystals from "./Crystals"
import { Vector3 } from "three"
import Text3d from "./Text3d"
import MorphMesh from "./MorphMesh"
import FboParticles from "./Particles"

const zoomIn = new Vector3(0, 0, 2)

function ZoomIn() {
  const { viewport, invalidate, forceResize } = useThree()
  const resized = useRef(false)
  useFrame(({ camera, clock }) => {
    if (camera.position.z >= 2.1) {
      camera.position.lerp(zoomIn, 0.025)
    } else if (!resized.current) {
      resized.current = true
    }
  })

  return null
}

const centerVec = new Vector3(0, 0, 0)
export default function Scene() {
  const mouse = useRef([0, 0])
  const [playingState, setPlayingState] = useState(0)
  const [started, setStarted] = useState(false)
  const { size, viewport } = useThree()
  const { active, progress, errors, item, loaded, total } = useProgress()

  useEffect(() => {
    const onMouseMove = (evt) => {
      mouse.current[0] = -1 + (evt.x / size.width) * 2
      mouse.current[1] = -1 + (evt.y / size.height) * 2
    }

    window.addEventListener("mousemove", onMouseMove, { passive: true })

    return () => {
      window.removeEventListener("mousemove", onMouseMove)
    }
  }, [size.width, size.height])

  return (
    <>
      <ambientLight intensity={0.9} />
      <pointLight position={[5, 1, 3]} intensity={1} />
      {/* 
      <pointLight position={[-5, -1, 0]} intensity={1} />
      <spotLight
        intensity={0.63}
        position={[-30, 30, 10]}
        angle={0.2}
        penumbra={1}
      /> */}
      <Suspense fallback={null}>
        {started && <ZoomIn />}
        <Background
          started={started}
          playingState={playingState}
          position={[0, 0, -1]}
          mouse={mouse.current}
        />
        <MorphMesh />
      </Suspense>
      <FboParticles />
      <Html fullscreen>
        <Ui
          progress={progress}
          started={started}
          onStart={() => setStarted(true)}
        />
      </Html>
    </>
  )
}
