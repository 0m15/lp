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
import { Text } from "drei"
import Ui from "./Ui"
import { useFrame, useThree } from "react-three-fiber"

export default function Scene() {
  const { size } = useThree()
  const mouse = useRef([0, 0])

  useEffect(() => {
    const onMouseMove = (evt) => {
      mouse.current[0] = -1 + (evt.x / size.width) * 2
      mouse.current[1] = -1 + (evt.y / size.height) * 2
    }

    window.addEventListener("mousemove", onMouseMove, { passive: true })

    return () => {
      window.removeEventListener("mousemove", onMouseMove)
    }
  }, [])

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[5, 1, 3]} intensity={1} />
      <pointLight position={[-5, -1, 0]} intensity={1} />
      <spotLight
        intensity={0.63}
        position={[-30, 30, 10]}
        angle={0.2}
        penumbra={1}
        castShadow
      />
      <Suspense fallback={null}>
        <Background receiveShadow position={[0, 0, -1]} mouse={mouse.current} />
        <LP />
      </Suspense>
      <Ui />
      <EffectComposer>
        {/* <DepthOfField
          focusDistance={0}
          focalLength={0.02}
          bokehScale={2}
          height={480}
        /> */}
        {/* <ChromaticAberration offset={[0.005, 0.001, 0.001]} /> */}
        {/* <Bloom luminanceThreshold={0} luminanceSmoothing={0.9} height={300} /> */}
        {/* <Noise opacity={0.05} blendFunction={BlendFunction.OVERLAY} /> */}
        <Vignette eskil={false} offset={0.25} darkness={0.25} />
        {/* <SSAO /> */}
      </EffectComposer>
    </>
  )
}
