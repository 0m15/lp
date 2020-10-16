import { useRef, useMemo, useCallback, useEffect } from "react"
import {
  WebGLRenderTarget,
  NearestFilter,
  ShaderMaterial,
  DataTexture,
  RGBAFormat,
  FloatType,
  Scene,
  OrthographicCamera,
  BufferGeometry,
  BufferAttribute,
  Mesh
} from "three"

export default function useFbo({
  width = 512,
  height = 512,
  uniforms,
  name = "FBO",
  data,
  simulationShader,
  ...props
} = {}) {
  const scene = useMemo(() => {
    return new Scene()
  }, [])

  const camera = useMemo(() => new OrthographicCamera(-1, 1, 1, -1, 0, 1), [])

  const renderTarget = useMemo(() => {
    return [
      new WebGLRenderTarget(width, height, {
        minFilter: NearestFilter,
        magFilter: NearestFilter,
        format: RGBAFormat,
        type: FloatType,
        stencilBuffer: false,
        depthBuffer: false,
        depthWrite: false,
        depthTest: false,
        ...props
      }),
      new WebGLRenderTarget(width, height, {
        minFilter: NearestFilter,
        magFilter: NearestFilter,
        format: RGBAFormat,
        type: FloatType,
        stencilBuffer: false,
        depthBuffer: false,
        depthWrite: false,
        depthTest: false,
        ...props
      })
    ]
  }, [width, height, props])

  const positions = useMemo(() => {
    const t = new DataTexture(data, width, height, RGBAFormat, FloatType)
    t.needsUpdate = true
    return t
  }, [width, height, data])

  const simulationMaterial = useMemo(() => {
    return new ShaderMaterial(simulationShader)
  }, [simulationShader])

  const quad = useMemo(() => {
    //triangle
    //const vertices = new Float32Array([-1, -1, 3, -1, -1, 3])

    // quad
    const vertices = new Float32Array([
      -1,
      -1,
      0,
      1,
      -1,
      0,
      1,
      1,
      0,
      -1,
      -1,
      0,
      1,
      1,
      0,
      -1,
      1,
      0
    ])
    const temp = new BufferGeometry()
    temp.setAttribute("position", new BufferAttribute(vertices, 3))
    temp.setAttribute(
      "uv",
      new BufferAttribute(
        new Float32Array([0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0]),
        2
      )
    )
    return temp
  }, [])

  let index = useRef(0)

  const update = useCallback(
    ({ renderer, time }) => {
      const idx = index.current
      const currentTargetIndex = idx === 0 ? 1 : 0
      const prevTarget = renderTarget[idx]
      const currentTarget = renderTarget[currentTargetIndex]

      simulationMaterial.uniforms.positions.value = prevTarget.texture
      simulationMaterial.uniforms.time.value = time

      renderer.setRenderTarget(currentTarget)
      renderer.render(scene, camera)

      simulationMaterial.uniforms.oldPositions.value = currentTarget.texture

      index.current = currentTargetIndex
    },
    [renderTarget, scene, camera, simulationMaterial]
  )

  useEffect(() => {
    const mesh = new Mesh(quad, simulationMaterial)
    mesh.frustumCulled = false
    scene.add(mesh)
  }, [scene, quad, simulationMaterial])

  return {
    renderTarget,
    positions,
    simulationMaterial,
    scene,
    camera,
    quad,
    api: {
      update
    }
  }
}
