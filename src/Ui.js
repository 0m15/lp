import React, { useRef } from "react"
import Text from "./Text"

import { Flex, Box } from "@react-three/flex"
import { useFrame, useThree } from "react-three-fiber"
import lerp from "lerp"

export default function Ui() {
  const text1 = useRef()

  return (
    <div className="ui">
      <div className="top center">
        <div className="fs1 ttu">&lt;band name&gt;</div>
        <div className="fs2 ttu">&lt;album name&gt;</div>
      </div>
      <div className="bottom center fs6 ttu ls3 a4">
        &copy; 2020 dna records
      </div>
      <div className="bottom right fs3 ttu">share+</div>
    </div>
  )
  // return (
  //   <group>
  //     <mesh position={[-0.5, 1, 0]}>
  //       <circleBufferGeometry args={[0.04, 32, 32]} />
  //       <meshStandardMaterial color="#fff" />
  //     </mesh>
  //     <Text
  //       center
  //       ref={text1}
  //       position={[0, 0.9, 0]}
  //       letterSpacing={0.2}
  //       fontSize={0.05}
  //       alpha={0.2}
  //       text="NOME BAND">
  //       {/* <meshPhongMaterial attach="material" color="white" transparent /> */}
  //     </Text>
  //     <Text
  //       position={[0, -0.93, 0]}
  //       //position={[0, -viewport.height / 2 + 0.05, 0]}
  //       color="#fff"
  //       letterSpacing={0.3}
  //       fontSize={0.015}>
  //       &copy; 2020 DNA RECORDS - ALL RIGHTS RESERVED. THIS SITE USE SOME
  //       COOKIES AND THIRD PART SERVICES. BY CLICKING ANYWHERE ON THE SITE, OR
  //       USING IT, YOU AGREE TO THE COOKIE POLICY.
  //     </Text>
  //   </group>
  // )
}
