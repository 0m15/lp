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
import LP from "./LP"
import Swarm from "./Swarm"
import lerp from "lerp"

const zoomIn = new Vector3(0, 0, 3)
const zoomIn2 = new Vector3(0, 0, 1)

function ZoomIn({ to = zoomIn } = {}) {
  useFrame(({ camera }) => {
    camera.position.lerp(to, 0.05)
  })

  return null
}

function Grid({ ...props }) {
  return (
    <gridHelper args={[22, 20, 0x000000, 0x111111]} position={[0, -1, -10]} />
  )
}

const centerVec = new Vector3(0, 0, 0)
export default function Scene() {
  const mouse = useRef([0, 0])
  const lp = useRef()
  const [playingState, setPlayingState] = useState(false)
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
        <Background
          started={started}
          playingState={playingState}
          position={[0, 4, -20]}
          mouse={mouse.current}
        />
        <LP
          started={started}
          ref={lp}
          position={[0, 0, -3]}
          onPlay={() => {
            setPlayingState(true)
          }}
          onPause={() => {
            setPlayingState(false)
          }}
        />
        {started && <Swarm mouse={mouse} />}
      </Suspense>
      <Grid />
      {started && !playingState && <ZoomIn />}
      {playingState && <ZoomIn to={zoomIn2} />}
      {/* <Crystals /> */}
      {/* <FboParticles /> */}
      <Html fullscreen>
        <Ui
          progress={progress}
          started={started}
          playingState={playingState}
          onStart={() => setStarted(true)}
        />
      </Html>
    </>
  )
}
