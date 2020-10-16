import { useDetectGPU } from "drei"
import React from "react"
import ReactDOM from "react-dom"
import { Canvas } from "react-three-fiber"
import { ACESFilmicToneMapping, sRGBEncoding } from "three"
import Scene from "./Scene"
import "./styles.css"

function App() {
  const gpu = useDetectGPU()
  console.log({ gpu })
  return (
    <Canvas
      pixelRatio={
        gpu.isMobile
          ? Math.min(2, window.devicePixelRatio)
          : Math.min(2, window.devicePixelRatio)
      }
      colorManagement
      concurrent
      gl={{
        powerPreference: "high-performance",
        alpha: false,
        antialias: false,
        stencil: false,
        depth: false
      }}
      onCreated={({ gl }) => {
        gl.toneMapping = ACESFilmicToneMapping
        gl.outputEncoding = sRGBEncoding
      }}
      camera={{
        fov: 50,
        position: [0, 0, 12]
      }}>
      <Scene />
    </Canvas>
  )
}

ReactDOM.render(<App />, document.getElementById("root"))
