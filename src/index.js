import React from "react"
import ReactDOM from "react-dom"
import { Canvas } from "react-three-fiber"
import { ACESFilmicToneMapping, sRGBEncoding } from "three"
import Scene from "./Scene"
import "./styles.css"

function App() {
  return (
    <Canvas
      pixelRatio={1}
      gl={{
        powerPreference: "high-performance",
        alpha: false,
        antialias: false,
        stencil: false,
        depth: false
      }}
      shadowMap
      colorManagement
      onCreated={({ gl }) => {
        gl.toneMapping = ACESFilmicToneMapping
        gl.outputEncoding = sRGBEncoding
      }}
      camera={{
        fov: 50,
        position: [0, 0, 2]
      }}>
      <Scene />
    </Canvas>
  )
}

ReactDOM.render(<App />, document.getElementById("root"))
