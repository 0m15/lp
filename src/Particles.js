import React, { useRef, useMemo, useEffect, useState } from "react"
import { useFrame, useLoader, useThree } from "react-three-fiber"
import {
  ShaderMaterial,
  BufferGeometry,
  BufferAttribute,
  Vector3,
  TextGeometry,
  ClampToEdgeWrapping,
  TetrahedronGeometry,
  TextureLoader
} from "three"
import useFbo from "./Fbo"
import simulationShader from "./shaders/ParticlesSimulation"
import renderShader from "./shaders/ParticlesRender"

const BUFFER_SIZE = 64

function getPoint(v, size) {
  v.x = Math.random() * 2 - 1
  v.y = Math.random() * 2 - 1
  v.z = Math.random() * 2 - 1
  if (v.length() > 1) return getPoint(v, size)
  return v.normalize().multiplyScalar(size)
}

function getSphere(count, size) {
  var len = count * 3
  var data = new Float32Array(len)
  var colors = new Float32Array(len)

  var p = new Vector3()
  for (var i = 0; i < len; i += 3) {
    //getPoint(p, size)
    data[i] = Math.random() * 2 - 1 //Math.cos(i) + Math.random() * 0.05
    data[i + 1] = Math.random() * 2 - 1 //Math.sin(i) + Math.random() * 0.05
    data[i + 2] = Math.random() * 0.25 - 0.125

    colors[i] = Math.random()
    colors[i + 1] = Math.random()
    colors[i + 2] = Math.random()
    //data[i + 3] = Math.random() * 0.5
  }
  return [data, colors]
}

//returns a Float32Array buffer of 3D points after an image
function getImage(img, width, height, elevation) {
  var ctx = getContext(null, width, height)
  ctx.drawImage(img, 0, 0)

  var imgData = ctx.getImageData(0, 0, width, height)
  var iData = imgData.data

  var l = width * height
  var data = new Float32Array(l * 3)
  var colors = new Float32Array(l * 3)

  var threshold = 0.171
  var numPoints = 0

  for (let i = 0, j = 0; i < l; i++) {
    const j3 = j * 3
    const i4 = i * 4
    const grayscale =
      (iData[i4] / 255) * 0.299 +
      (iData[i4 + 1] / 255) * 0.587 +
      (iData[i4 + 2] / 255) * 0.114

    //if (grayscale >= threshold) continue

    data[j3] = -0.5 + ((i % width) / width) * 2 //+ Math.random() * 0.01
    data[j3 + 1] = 1 + (i / width / height) * -2
    data[j3 + 2] = 0 //grayscale * 2.5 //( parseInt( i / width ) - height * .5 );

    colors[j3] = iData[i4] / 255
    colors[j3 + 1] = iData[i4 + 1] / 255
    colors[j3 + 2] = iData[i4 + 2] / 255
    j++
  }
  return [data, colors]
}

function getCanvas(w, h) {
  var canvas = document.createElement("canvas")
  canvas.width = w || 512
  canvas.height = h || 512
  //document.body.appendChild(canvas)
  return canvas
}
function getContext(canvas, w, h) {
  canvas = canvas || getCanvas(w, h)
  canvas.width = w || canvas.width
  canvas.height = h || canvas.height
  return canvas.getContext("2d")
}

export default function Particles() {
  const { size } = useThree()
  const points = useRef()
  const renderMaterial = useMemo(() => new ShaderMaterial(renderShader), [])

  const sphere = getSphere(BUFFER_SIZE * BUFFER_SIZE, 1) //getRandomData(BUFFER_SIZE, BUFFER_SIZE, BUFFER_SIZE)
  //const data1 = getMesh(new TetrahedronGeometry(1, 4, 4))

  const [data, setData] = useState(() => {
    const [positions, colors] = getSphere(BUFFER_SIZE * BUFFER_SIZE, 1)

    return {
      positions,
      colors
    }
  })

  useEffect(() => {
    var img = new Image()
    img.onload = function (e) {
      console.log("loaded")
      const [positions, colors] = getImage(img, BUFFER_SIZE, BUFFER_SIZE, 0.1)
      //setData({ positions, colors })
      //setData(sphere)
    }
    img.src = "/cover-front-a.jpg"
  }, [])

  console.log({ data })

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
    data: data.positions
  })

  // const colors = useMemo(() => {
  //   const temp = new BufferGeometry()
  //   temp.setAttribute("color", new BufferAttribute(data.colors, 3))
  //   return temp
  // }, [])

  const particlesGeometry = useMemo(() => {
    const temp = new BufferGeometry()
    temp.setAttribute("position", new BufferAttribute(data.positions, 3))
    temp.setAttribute("colors", new BufferAttribute(data.colors, 3))
    return temp
  }, [data.positions])

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
    points.current.material.uniforms.positions.value = renderTarget[0].texture
    simulationMaterial.uniforms.uForcePosition.value = [mouse.x, mouse.y, 0]

    const prevRenderTarget = gl.getRenderTarget()
    fbo.update({ renderer: gl, time: clock.getElapsedTime() })

    gl.setRenderTarget(prevRenderTarget)
  })

  return (
    <points ref={points} position={[0, 0, 0]} frustumCulled={false}>
      <primitive attach="geometry" object={particlesGeometry} />
      <primitive attach="material" object={renderMaterial} />
    </points>
  )
}
