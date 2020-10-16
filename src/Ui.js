import React, { useRef } from "react"
import { a, useTransition, useSpring } from "@react-spring/web"
import Text from "./Text"
import { useFrame, useThree } from "react-three-fiber"
import lerp from "lerp"

function Transition({ t, ...props }) {
  return t((style, active) => {
    return active && <a.div style={style} {...props} />
  })
}

export default function Ui({ progress, onStart, started }) {
  const text1 = useRef()

  const enter = useTransition(started, {
    from: { opacity: 0, y: -10 },
    enter: { opacity: 1, y: 0 }
  })

  const leave = useTransition(!started, {
    from: { opacity: 1 },
    leave: { opacity: 0 }
  })

  const leaveProgress = useTransition(progress < 100, {
    from: { opacity: 1 },
    leave: { opacity: 0 }
  })

  return (
    <div className="ui" onClick={started ? null : onStart}>
      <div className="top center">
        <Transition t={enter} className="fs3 ttu">
          band name
        </Transition>
        <Transition t={enter} className="fs4 ttu">
          album name
        </Transition>
      </div>
      {progress >= 100 && (
        <div className="center middle">
          <Transition t={leave} className="fs5 ttu ls5">
            ~ tap to discover ~
          </Transition>
        </div>
      )}
      <div className="middle center" style={{ color: "#fff" }}>
        <Transition t={leaveProgress}>{progress}%</Transition>
      </div>
      <div className="bottom center fs6 ttu ls3 a4">
        &copy; 2020 dna records
      </div>
      {started && (
        <Transition t={enter} className="bottom right fs4 ttu ls4">
          share+
        </Transition>
      )}
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
