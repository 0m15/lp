import React, { useRef, useMemo, useEffect } from "react"
import { useFrame, useThree } from "react-three-fiber"
import {
  ShaderMaterial,
  BufferGeometry,
  BufferAttribute,
  Vector3,
  TextGeometry,
  ClampToEdgeWrapping,
  TetrahedronGeometry
} from "three"
import useFbo from "./Fbo"
import simulationShader from "./shaders/ParticlesSimulation"
import renderShader from "./shaders/ParticlesRender"

// turn 1 if you have a good gpu
const HIGH_PERFORMANCE = 0
const BUFFER_SIZE = HIGH_PERFORMANCE ? 512 : 256

function getMesh(mesh) {
  console.log(mesh.vertices)
  var len = mesh.vertices * 4
  var data = new Float32Array(len)

  for (var i = 0; i < len; i += 4) {
    var p = mesh.vertices[i]
    data[i] = p.x
    data[i + 1] = p.y
    data[i + 2] = p.z
    data[i + 3] = 0.5 //Math.random() * 0.2 + 0.1
  }

  return data
}

function getPoint(v, size) {
  v.x = Math.random() * 2 - 1
  v.y = Math.random() * 2 - 1
  v.z = Math.random() * 2 - 1
  if (v.length() > 1) return getPoint(v, size)
  return v.normalize().multiplyScalar(size)
}

function getSphere(count, size) {
  var len = count * 4
  var data = new Float32Array(len)
  var p = new Vector3()
  for (var i = 0; i < len; i += 4) {
    getPoint(p, size)
    data[i] = p.x
    data[i + 1] = p.y
    data[i + 2] = p.z
    data[i + 3] = Math.random() * 0.2 + 0.1
  }
  return data
}

export default function Particles() {
  const { size } = useThree()
  const points = useRef()
  const renderMaterial = useMemo(() => new ShaderMaterial(renderShader), [])
  const data = getSphere(BUFFER_SIZE * BUFFER_SIZE, 0.5) //getRandomData(BUFFER_SIZE, BUFFER_SIZE, BUFFER_SIZE)
  const data1 = getMesh(new TetrahedronGeometry(1, 4, 4))

  const {
    api: fbo,
    renderTarget,
    positions,
    scene: fboScene,
    camera: fboCamera,
    simulationMaterial
  } = useFbo({
    simulationShader,
    width: BUFFER_SIZE,
    height: BUFFER_SIZE,
    data
  })

  const particlesGeometry = useMemo(() => {
    const temp = new BufferGeometry()
    temp.setAttribute("position", new BufferAttribute(data, 4))
    return temp
  }, [data])

  useEffect(() => {
    simulationMaterial.uniforms.initial.value = positions
  }, [simulationMaterial, positions])

  const mouse = useRef({ x: 0, y: 0 })

  useEffect(() => {
    document.addEventListener("mousemove", onMouseMove)
    function onMouseMove(evt) {
      mouse.current = {
        x: -0.5 + evt.x / size.width,
        y: -0.5 + evt.y / size.height
      }
    }
  }, [size])

  useFrame(({ gl, clock }) => {
    points.current.position.z = 1.5
    points.current.geometry = particlesGeometry
    points.current.material = renderMaterial
    points.current.material.uniforms.positions.value = renderTarget[0].texture
    simulationMaterial.uniforms.uForcePosition.value = [
      mouse.current.x,
      mouse.current.y,
      0
    ]

    const prevRenderTarget = gl.getRenderTarget()
    fbo.update({ renderer: gl, time: clock.getElapsedTime() })

    gl.setRenderTarget(prevRenderTarget)
  })

  return <points ref={points} />
}
