import * as THREE from "three"
import React, { useMemo } from "react"
import { useLoader, useUpdate } from "react-three-fiber"

export default function ({
  children,
  vAlign = "center",
  hAlign = "center",
  size = 1,
  color = "#000000",
  ...props
}) {
  const font = useLoader(THREE.FontLoader, "/LibreBaskerville.json")
  const config = useMemo(
    () => ({
      font,
      size: 10,
      height: 1,
      curveSegments: 32,
      bevelEnabled: true,
      bevelThickness: 6,
      bevelSize: 2,
      bevelOffset: 0,
      bevelSegments: 8
    }),
    [font]
  )
  const mesh = useUpdate(
    (self) => {
      const size = new THREE.Vector3()
      self.geometry.computeBoundingBox()
      self.geometry.boundingBox.getSize(size)
      self.position.x =
        hAlign === "center" ? -size.x / 2 : hAlign === "right" ? 0 : -size.x
      self.position.y =
        vAlign === "center" ? -size.y / 2 : vAlign === "top" ? 0 : -size.y
    },
    [children]
  )
  return (
    <group {...props} scale={[0.1 * size, 0.1 * size, 0.1]}>
      <mesh ref={mesh}>
        <textGeometry attach="geometry" args={[children, config]} />
        <meshNormalMaterial attach="material" />
      </mesh>
    </group>
  )
}
