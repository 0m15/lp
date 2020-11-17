import React, { useEffect, useRef, useState } from "react"
import { a, useTransition, useTrail, useSpring } from "@react-spring/web"
import {
  ArrowArcLeft,
  ArrowArcRight,
  ArrowBendLeftUp,
  ArrowBendUpLeft,
  ArrowBendUpRight,
  ArrowURightUp,
  ArrowUUpLeft,
  ArrowUUpRight,
  Plus
} from "phosphor-react"
import { useThree } from "react-three-fiber"

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
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showHint, setShowHint] = useState(false)

  const prog = useSpring({
    value: progress
  })

  // const trail = useTrail(4, {
  //   opacity: started ? 1 : 0,
  //   height: started ? 1 : 0,
  //   config: {
  //     duration: 1200
  //   }
  // })

  const menuItems = useTrail(4, {
    opacity: isMenuOpen ? 1 : 0,
    height: isMenuOpen ? 1 : 0,
    y: isMenuOpen ? 0 : -5,
    config: {
      delay: 1000
    }
  })

  useEffect(() => {
    if (progress < 100) return

    setTimeout(() => {
      setShowHint(true)
    }, 1000)

    setTimeout(() => {
      setShowHint(false)
    }, 1500)

    setTimeout(() => {
      setShowHint(true)
    }, 2500)

    setTimeout(() => {
      setShowHint(false)
    }, 3000)
  }, [progress])

  return (
    <div className="ui" onClick={started ? null : onStart}>
      <Transition prop={progress < 100} className="center middle loader full">
        <a.div className="fs3 ls2 tc">loading</a.div>
        <a.div
          style={{
            marginTop: 2,
            marginBottom: 6,
            width: prog.value.interpolate((d) => `${d.toFixed(0)}%`),
            height: 2,
            background: "currentColor"
          }}></a.div>
        <a.div className="fs6 ttu ls2 tc">
          {prog.value.interpolate((d) => `${d.toFixed(0)}%`)}
        </a.div>
      </Transition>
      <div className="center middle">
        <Transition prop={showHint} className="fs5 ls3 abs">
          <div style={{ marginTop: 320 }}>
            <ArrowBendUpLeft color=" rgb(234, 112, 255)" size={32} />
            <ArrowBendUpRight color=" rgb(234, 112, 255)" size={32} />
          </div>
        </Transition>
        <Transition prop={showHint} className="fs5 ls3 abs">
          <div
            style={{
              marginLeft: -320
            }}>
            <ArrowBendLeftUp color=" rgb(234, 112, 255)" size={32} />
          </div>
        </Transition>
      </div>
      <Transition prop={progress >= 100} className="abs fs5"></Transition>
      <div className="abs bottom right">
        <Transition
          height={40}
          prop={!isMenuOpen}
          className=" fs3 ttu ls1"
          onClick={() => {
            setIsMenuOpen(!isMenuOpen)
          }}>
          <Plus color=" rgb(234, 112, 255)" size={40} />
        </Transition>
      </div>
      <Transition prop={isMenuOpen} className="ui full">
        <div>
          <Reveal height={30} style={menuItems[0]} className="fs2 mb oh">
            spotify
          </Reveal>
          <Reveal height={30} style={menuItems[1]} className="fs2 mb oh">
            youtube
          </Reveal>
          <Reveal height={30} style={menuItems[2]} className="fs2 mb oh">
            link 1
          </Reveal>
          <Reveal height={30} style={menuItems[3]} className="fs2 mb oh">
            link 2
          </Reveal>
        </div>
        <div className="abs bottom right">
          <Transition
            height={40}
            prop={isMenuOpen}
            className=" fs3 ttu ls1"
            onClick={() => {
              setIsMenuOpen(!isMenuOpen)
            }}>
            <ArrowUUpLeft color=" rgb(234, 112, 255)" size={40} />
          </Transition>
        </div>
      </Transition>
    </div>
  )
}
