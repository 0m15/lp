import React, { Suspense, useCallback, useRef, useState } from "react"
import { useFrame, useLoader } from "react-three-fiber"
import { BackSide, DoubleSide, FrontSide, TextureLoader, Vector3 } from "three"
import lerp from "lerp"

let vinylTranslate = new Vector3(0, 0, 0)
const Vinyl = React.forwardRef((props, ref) => {
  const [map] = useLoader(TextureLoader, ["/vinyl.jpg"])

  return (
    <mesh {...props} ref={ref}>
      <circleBufferGeometry attach="geometry" args={[1.25, 32]} />
      <meshBasicMaterial map={map} attach="material" side={DoubleSide} />
    </mesh>
  )
})

function Side({ textureUrl, ...props }) {
  const [map] = useLoader(TextureLoader, ["/" + textureUrl])

  return (
    <mesh position={[0, 0, 0]} {...props}>
      <planeBufferGeometry attach="geometry" args={[3, 3, 1]} />
      <meshBasicMaterial map={map} attach="material" />
    </mesh>
  )
}

function LP() {
  const group = useRef()
  const vinyl = useRef()

  const [side, setSide] = useState("A")
  const [showVinyl, setShowVynil] = useState(0)

  const onClick = useCallback(
    (sideId) => (event) => {
      console.log({ event: event })

      if (side === sideId) {
        event.stopPropagation()
        setSide(side === "A" ? "B" : "A")
      }
    },
    [side]
  )

  let rotation = 0

  console.log({ vinyl })

  useFrame(({ clock }) => {
    //group.current.rotation.set(0, clock.getElapsedTime(), 0)
    if (side === "B" && group.current.rotation.y > -Math.PI) {
      rotation = -Math.PI
    }

    if (side === "A" && group.current.rotation.y > 0) {
      rotation = 0
    }

    if (vinyl.current && showVinyl === 1 && vinyl.current.position.y < 2.5) {
      group.current.position.y = lerp(group.current.position.y, -1.5, 0.05)
      vinyl.current.position.y = lerp(vinyl.current.position.y, 2.5, 0.05)
    }

    if (showVinyl === 2) {
      vinyl.current.rotation.z += 0.01
    }

    if (vinyl.current && !showVinyl) {
      group.current.position.y = lerp(group.current.position.y, 0, 0.05)
      vinyl.current.position.y = lerp(vinyl.current.position.y, 0.5, 0.05)
    }

    group.current.rotation.y = lerp(group.current.rotation.y, rotation, 0.05)
  })

  return (
    <>
      <group ref={group}>
        <Side
          onPointerDown={onClick("A")}
          name="A"
          textureUrl="cover-front.jpg"
        />
        <Side
          onPointerDown={onClick("B")}
          name="B"
          textureUrl="cover-back.jpg"
          position={[0, 0, -0.02]}
          rotation={[0, Math.PI, 0]}
        />
        <Vinyl
          onPointerDown={() => {
            if (!showVinyl) {
              return setShowVynil(1)
            }

            if (showVinyl === 1) {
              return setShowVynil(2)
            }

            setShowVynil(0)
          }}
          ref={vinyl}
          position={[0, 0.5, -0.01]}
        />
      </group>
    </>
  )
}

export default function Scene() {
  console.log("scene")
  return (
    <Suspense fallback={null}>
      <LP />
    </Suspense>
  )
}
