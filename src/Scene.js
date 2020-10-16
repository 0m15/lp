import React, { Suspense, useEffect, useRef } from "react"
import LP from "./LP"
import {
  EffectComposer,
  DepthOfField,
  Bloom,
  Noise,
  Vignette,
  ToneMapping,
  SSAO,
  ChromaticAberration
} from "@react-three/postprocessing"
import Background from "./Background"
import { BlendFunction } from "postprocessing"
import { ContactShadows, Html, Shadow, Stars, Text, useProgress } from "drei"
import Ui from "./Ui"
import { useFrame, useThree } from "react-three-fiber"
import Crystals from "./Crystals"
import { Vector3 } from "three"
import Text3d from "./Text3d"

const zoomIn = new Vector3(0, 0, 2)

function ZoomIn() {
  const { viewport, invalidate, forceResize } = useThree()
  const resized = useRef(false)
  useFrame(({ camera, clock }) => {
    if (camera.position.z >= 2.1) {
      camera.position.lerp(zoomIn, 0.075)
      console.log("lerp")
      console.log(viewport.width)
    } else if (!resized.current) {
      resized.current = true
    }
  })

  return null
}

export default function Scene() {
  const { size, viewport } = useThree()
  const mouse = useRef([0, 0])
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
        <ZoomIn />
        <Background position={[0, 0, -1]} mouse={mouse.current} />
        <LP />
        {/* <Text3d position={[0, viewport.height - 2, -20]}>Text</Text3d> */}
      </Suspense>

      {/* <EffectComposer>
        <ChromaticAberration offset={[0.001, 0.001, 0.001]} />
        <Vignette eskil={false} offset={0.25} darkness={0.65} />
      </EffectComposer> */}
      <Html fullscreen>
        {progress < 100 && <div style={{ color: "#fff" }}>{progress}%</div>}
        <Ui />
      </Html>
    </>
  )
}
