import React from "react"
import Text from "./Text"

import { Flex, Box } from "@react-three/flex"
import { useThree } from "react-three-fiber"

export default function Ui() {
  const { viewport, size } = useThree()

  return (
    <group>
      <mesh
        position={[
          -viewport.width / 2 + 0.075,
          viewport.height / 2 - 0.075,
          0
        ]}>
        <circleBufferGeometry args={[0.04, 32, 32]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <Text
        center
        position={[0, viewport.height / 2 - 0.15, 0]}
        letterSpacing={0.2}
        fontSize={0.05}>
        NOME BAND
      </Text>
      <Text position={[0, -0.9, 0]} color="#fff" fontSize={0.025}>
        &copy; 2020 dna - all rights reserved
      </Text>
    </group>
  )
}
