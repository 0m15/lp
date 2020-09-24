import React from 'react'
import ReactDOM from 'react-dom'
import { Canvas } from 'react-three-fiber'
import Scene from './Scene'
import './styles.css'

function App() {
  return (
    <Canvas>
      <Scene />
    </Canvas>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
