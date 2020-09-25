import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react"
import { extend, useFrame, useLoader } from "react-three-fiber"
import {
  AdditiveBlending,
  BackSide,
  DoubleSide,
  FrontSide,
  MultiplyBlending,
  TextureLoader,
  Vector3,
  VideoTexture
} from "three"
import lerp from "lerp"
import VideoMaterial from "./VideoMaterial"

extend({ VideoMaterial })

const Vinyl = React.forwardRef((props, ref) => {
  const [map, normalMap, bumpMap, specularMap] = useLoader(TextureLoader, [
    "/vinyl-a.png",
    "/vinyl-a-normal.png",
    "/vinyl-a-bump.png",
    "/vinyl-a-spec.png"
  ])

  return (
    <mesh {...props} ref={ref} castShadow receiveShadow>
      <circleBufferGeometry attach="geometry" args={[1.25, 64]} />
      <meshPhongMaterial
        //specularMap={specularMap}
        normalMap={normalMap}
        specular="grey"
        bumpMap={bumpMap}
        map={map}
        attach="material"
        bumpScale={0.001}
        side={DoubleSide}
      />
    </mesh>
  )
})

function Side({ textureUrl, materialProps, ...props }) {
  const [map, bumpMap] = useLoader(TextureLoader, [
    "/" + textureUrl,
    "/cover-bump.jpg"
  ])

  return (
    <mesh position={[0, 0, 0]} {...props} castShadow receiveShadow>
      <planeBufferGeometry attach="geometry" args={[3, 3, 1]} />
      <meshPhongMaterial
        specularMap={bumpMap}
        specular="white"
        bumpMap={bumpMap}
        map={map}
        attach="material"
        {...materialProps}
      />
    </mesh>
  )
}

function Video({ ...props }) {
  const material = useRef()
  const texture = useMemo(() => {
    return new VideoTexture(document.getElementById("video"))
  })

  useFrame(({ clock }) => {
    material.current.uniforms.time.value = clock.getElapsedTime() * 0.25
  })

  return (
    <mesh position={[0, 0, 0]} {...props}>
      <planeBufferGeometry attach="geometry" args={[3, 3, 1]} />
      <videoMaterial
        ref={material}
        uniforms-tInput-value={texture}
        attach="material"
      />
    </mesh>
  )
}

export default function LP() {
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

  useEffect(() => {
    const video = document.getElementById("video")
    document.addEventListener("click", function () {
      console.log("x")
      if (showVinyl === 2) {
        video.play()
      }
    })
  }, [showVinyl])

  return (
    <>
      <group ref={group}>
        <Side
          onPointerDown={onClick("A")}
          name="A"
          textureUrl="cover-front.jpg"
          materialProps={{
            bumpScale: showVinyl ? 0 : 0.0017
          }}
        />
        <Side
          onPointerDown={onClick("B")}
          name="B"
          textureUrl="cover-back.jpg"
          position={[0, 0, -0.02]}
          rotation={[0, Math.PI, 0]}
          materialProps={{
            bumpScale: showVinyl ? 0 : 0.0017
          }}
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
        {showVinyl === 2 && <Video position={[0, 0, 0.1]} />}
      </group>
    </>
  )
}
