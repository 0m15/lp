import React, { useEffect, useRef, useState } from "react"
import { a, useTransition, useSpring } from "@react-spring/web"
import Text from "./Text"
import { useFrame, useThree } from "react-three-fiber"
import lerp from "lerp"

function Transition({
  prop,
  delay = 0,
  enter = {},
  leave = {},
  from = {},
  ...props
}) {
  const t = useTransition(prop, {
    from: { opacity: 0, ...from },
    enter: { opacity: 1, ...enter },
    leave: { opacity: 0, ...leave },
    config: { duration: 1000 },
    delay,
    immediate: false
  })

  return t((style, active) => {
    return active && <a.div style={style} {...props} />
  })
}

export default function Ui({ progress, onStart, started }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (progress >= 100) {
      setTimeout(() => {
        setIsLoaded(true)
      }, 1000)
      setTimeout(() => {
        setIsReady(true)
      }, 3000)
    }
  }, [progress])

  return (
    <div className="ui" onClick={started ? null : onStart}>
      <div className="top center">
        <Transition prop={started} className="fs3 ttu">
          band name
        </Transition>
        <Transition prop={started} delay={500} className="fs4 ttu">
          album name
        </Transition>
      </div>
      <div className="center middle">
        <Transition
          delay={1500}
          prop={isReady && !started}
          className="fs5 ttu ls5">
          ~ launch ~
        </Transition>
      </div>
      <div className="middle center" style={{ width: 200 }}>
        <Transition prop={!isLoaded}>
          <div className="bottom left fs6 ttu ls5">loading</div>
          <div
            style={{
              marginTop: 2,
              width: progress + "%",
              height: 2,
              background: "currentColor"
            }}></div>
        </Transition>
      </div>
      <div className="bottom center fs6 ttu ls3 a3">
        &copy; 2020 dna records
      </div>
      <Transition prop={started} className="bottom left fs5 ttu ls4">
        listen+
      </Transition>
      <Transition prop={started} className="bottom right fs5 ttu ls4">
        share+
      </Transition>
    </div>
  )
}
