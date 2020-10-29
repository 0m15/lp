import React, { useEffect, useRef, useState } from "react"
import { a, useTransition, useTrail, useSpring } from "@react-spring/web"
import { Plus } from "phosphor-react"

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
    immediate: false
  })

  return t((style, active) => {
    return active && <a.div style={style} {...props} />
  })
}

function Reveal({
  height = 100,
  style: { height: h, ...styleProps } = {},
  ...props
}) {
  return (
    <a.div
      style={{
        overflow: "hidden",
        ...styleProps,
        height: h.interpolate((d) => d * height)
      }}
      {...props}
    />
  )
}

export default function Ui({ progress, playingState, onStart, started }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isReady, setIsReady] = useState(false)

  const prog = useSpring({
    value: progress
  })

  const trail = useTrail(4, {
    opacity: started ? 1 : 0,
    height: started ? 1 : 0,
    //y: started ? 0 : -5,
    config: {
      duration: 1200
    }
  })

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
      {/* <div className="top center">
        <Reveal height={30} style={trail[0]} className="fs2 ttu oh">
          band name
        </Reveal>
      </div> */}
      <div className="center middle">
        <Transition prop={progress < 100}>
          <a.div className="fs1 ttu ls2 tc">
            {prog.value.interpolate((d) => `${d.toFixed(0)}%`)}
          </a.div>
          <a.div
            style={{
              marginTop: 2,
              width: prog.value.interpolate((d) => `${d.toFixed(0)}%`),
              height: 2,
              background: "currentColor"
            }}></a.div>
        </Transition>
        <Transition prop={isReady && !started} className="fs5 ttu ls5 abs">
          ~ launch ~
        </Transition>
        <Transition prop={started && !playingState} className="fs5 ls3 abs">
          <div style={{ marginTop: 360 }}>
            <div className="icon1">⬄</div>
          </div>
        </Transition>
        <Transition prop={started && !playingState} className="fs5 ls3 abs">
          <div
            style={{
              marginLeft: -360,
              transform: "rotate(90deg)"
            }}>
            <div className="icon1">⬄</div>
          </div>
        </Transition>
      </div>

      {/* <div className="bottom center fs6 ttu ls3 a3">
        &copy; 2020 dna records
      </div> */}
      {/* <div className="bottom center">
        <Reveal height={30} style={trail[2]} className="tc fs3 ttu ls1">
          album name
        </Reveal>
      </div> */}
      <div className="abs bottom right">
        <Reveal height={40} style={trail[3]} className=" fs3 ttu ls1">
          <Plus color="#fff" weight="thin" size={40} />
        </Reveal>
      </div>
    </div>
  )
}
