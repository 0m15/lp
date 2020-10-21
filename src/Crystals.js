import React, { useRef, useMemo, useEffect } from "react"
import { useFrame, useThree } from "react-three-fiber"
import BackfaceMaterial from "./BackfaceMaterial"
import RefractionMaterial from "./RefractionMaterial"
import { WebGLRenderTarget, Object3D } from "three"

// material taken from https://codesandbox.io/embed/r3f-moksha-f1ixt
export default function Crystals({ count = 10, ...props }) {
  const mesh = useRef()

  const { size, gl } = useThree()
  const ratio = gl.getPixelRatio()

  const [
    envFbo,
    backfaceFbo,
    backfaceMaterial,
    refractionMaterial
  ] = useMemo(() => {
    const envFbo = new WebGLRenderTarget(
      size.width * ratio,
      size.height * ratio
    )
    const backfaceFbo = new WebGLRenderTarget(
      size.width * ratio,
      size.height * ratio
    )
    const backfaceMaterial = new BackfaceMaterial()
    const refractionMaterial = new RefractionMaterial({
      envMap: envFbo.texture,
      backfaceMap: backfaceFbo.texture,
      resolution: [size.width * ratio, size.height * ratio]
    })
    return [envFbo, backfaceFbo, backfaceMaterial, refractionMaterial]
  }, [size, ratio])

  let initialTarget
  useFrame(({ gl, clock, scene, camera }) => {
    const t = clock.getElapsedTime()
    if (!initialTarget) initialTarget = gl.getRenderTarget()

    //mesh.current.position.set(Math.cos(t) * 0.25, Math.sin(t) * 0.25, mesh.current.position.z)
    mesh.current.rotation.set(0, -clock.getElapsedTime() * 0.25, 0)

    gl.autoClear = false
    camera.layers.set(0)
    gl.setRenderTarget(envFbo)
    gl.clearColor()
    gl.render(scene, camera)
    gl.clearDepth()
    camera.layers.set(1)
    mesh.current.material = backfaceMaterial
    gl.setRenderTarget(backfaceFbo)
    gl.clearDepth()
    gl.render(scene, camera)
    camera.layers.set(0)
    gl.setRenderTarget(null)
    gl.render(scene, camera)
    gl.clearDepth()
    camera.layers.set(1)
    mesh.current.material = refractionMaterial
    gl.render(scene, camera)
  })

  return (
    <mesh ref={mesh} layers={1} {...props}>
      <dodecahedronBufferGeometry attach="geometry" args={[0.5]} />
      {/* <sphereBufferGeometry attach="geometry" args={[0.6, 32, 32]} /> */}
      {/* <coneBufferGeometry attach="geometry" args={[1.25, 2, 4]} /> */}
    </mesh>
  )
}
