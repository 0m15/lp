import React from "react"
import ReactDOM from "react-dom"
import { Canvas } from "react-three-fiber"
import { ACESFilmicToneMapping, sRGBEncoding } from "three"
import Scene from "./Scene"
import "./styles.css"

function App() {
  //const gpu = useDetectGPU()

  return (
    <Canvas
      pixelRatio={Math.min(2, window.devicePixelRatio)}
      colorManagement
      gl={{
        powerPreference: "high-performance",
        antialias: false
      }}
      onCreated={({ gl }) => {
        gl.toneMapping = ACESFilmicToneMapping
        gl.outputEncoding = sRGBEncoding
      }}
      camera={{
        fov: 50,
        position: [0, 0, 3]
      }}>
      <Scene />
    </Canvas>
  )
}

ReactDOM.render(<App />, document.getElementById("root"))
