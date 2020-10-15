import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { extend, useFrame, useLoader } from "react-three-fiber"
import { DoubleSide, TextureLoader, VideoTexture } from "three"
import lerp from "lerp"
import VideoMaterial from "./VideoMaterial"
import Video from "./Video"
import Text from "./Text"

extend({ VideoMaterial })

const SIDE_A = 0
const SIDE_B = 1
const SHOW_VINYL = 2
const PLAYING = 3

const DT = 0.075

const Vinyl = React.forwardRef((props, ref) => {
  const [map, normalMap, bumpMap, specularMap] = useLoader(TextureLoader, [
    "/vinyl-a.png",
    "/vinyl-a-normal.png",
    "/vinyl-a-bump.png",
    "/vinyl-a-spec.png"
  ])

  return (
    <mesh {...props} ref={ref} castShadow receiveShadow>
      <circleBufferGeometry attach="geometry" args={[0.45, 64]} />
      <meshPhongMaterial
        //specularMap={specularMap}
        normalMap={normalMap}
        specular="grey"
        bumpMap={bumpMap}
        map={map}
        attach="material"
        bumpScale={0.0005}
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
      <planeBufferGeometry attach="geometry" args={[1, 1, 1]} />
      <meshPhongMaterial
        specularMap={bumpMap}
        specular="rgb(130, 130, 130)"
        bumpMap={bumpMap}
        map={map}
        attach="material"
        {...materialProps}
      />
    </mesh>
  )
}

export default function LP() {
  const group = useRef()
  const vinyl = useRef()

  const [lpState, setLpState] = useState(() => SIDE_A)
  const [vinylState, setVinylState] = useState(0)

  const onClickSide = useCallback(
    (sideId) => (event) => {
      if (lpState === sideId) {
        event.stopPropagation()
        setLpState(lpState === SIDE_A ? SIDE_B : SIDE_A)
      }
    },
    [lpState]
  )

  const onClickVinyl = useCallback(() => {
    if (vinylState < SHOW_VINYL) {
      return setVinylState(SHOW_VINYL)
    } else if (vinylState < PLAYING) {
      return setVinylState(PLAYING)
    }

    setVinylState(SIDE_A)
  }, [vinylState])

  useFrame(({ clock }) => {
    if (!vinyl.current || !group.current) return

    if (lpState === SIDE_B && group.current.rotation.y > -Math.PI) {
      group.current.rotation.y = lerp(group.current.rotation.y, -Math.PI, DT)
    }

    if (lpState === SIDE_A && group.current.rotation.y < 0) {
      group.current.rotation.y = lerp(group.current.rotation.y, 0, DT)
    }

    if (vinylState === SHOW_VINYL && vinyl.current.position.y < 2.5) {
      group.current.position.y = lerp(group.current.position.y, -0.25, DT)
      vinyl.current.position.y = lerp(vinyl.current.position.y, 0.75, DT)
    }

    if (vinylState === PLAYING) {
      vinyl.current.rotation.z += 0.01
    }

    if (vinylState !== SHOW_VINYL && vinylState !== PLAYING) {
      group.current.position.y = lerp(group.current.position.y, 0, DT)
      vinyl.current.position.y = lerp(vinyl.current.position.y, 0.1, DT)
    }
  })

  useEffect(() => {
    const video = document.getElementById("video")
    document.addEventListener("click", function () {
      if (vinylState === SHOW_VINYL) {
        video.play()
      }
    })
  }, [vinylState])

  return (
    <>
      <group ref={group}>
        <Side
          onPointerDown={onClickSide(SIDE_A)}
          name="A"
          textureUrl="cover-front-a.jpg"
          materialProps={{
            bumpScale: 0.0015
          }}
        />
        <Side
          onPointerDown={onClickSide(SIDE_B)}
          name="B"
          textureUrl="cover-front-a.jpg"
          position={[0, 0, -0.02]}
          rotation={[0, Math.PI, 0]}
          materialProps={{
            bumpScale: 0.0015
          }}
        />
        <Vinyl
          onPointerDown={onClickVinyl}
          ref={vinyl}
          position={[0, 0.1, -0.01]}
        />
      </group>
      {vinylState === PLAYING && (
        <Video position={[0, -0.235, lpState === SIDE_A ? 0.001 : 0.02]} />
      )}
      <Text
        position={[0, vinylState >= SHOW_VINYL ? -0.9 : -0.65, 0]}
        color="#fff"
        fontSize={0.05}>
        {lpState === SIDE_A && "Side A)"}
        {lpState === SIDE_B && "Side B)"}
        {vinylState === SHOW_VINYL && " - Hit again to play"}
        {vinylState > SHOW_VINYL && " - Hit again to stop"}
      </Text>
    </>
  )
}
