import React, { Suspense, useCallback, useRef } from 'react'
import { useFrame, useLoader } from 'react-three-fiber'
import { TextureLoader } from 'three'

function Side({ textureUrl, ...props }) {
  const [map] = useLoader(TextureLoader, ['./' + textureUrl])

  return (
    <mesh position={[0, 0, 0]} {...props}>
      <planeBufferGeometry attach="geometry" args={[3, 3, 1]} />
      <meshBasicMaterial map={map} attach="material" />
    </mesh>
  )
}

function LP() {
  const group = useRef()
  const onClick = useCallback(() => {
    console.log('xxclick')
  }, [])
  return (
    <group ref={group} onClick={onClick}>
      <Side textureUrl="cover-front.jpg" />
      <Side textureUrl="cover-back.jpg" position={[0, 0, -0.01]} />
    </group>
  )
}

export default function Scene() {
  return (
    <Suspense fallback={null}>
      <LP />
    </Suspense>
  )
}
