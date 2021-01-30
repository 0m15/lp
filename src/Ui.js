import React, { useEffect, useRef, useState } from "react"
import { a, useTransition, useTrail, useSpring } from "@react-spring/web"
import {
  ArrowBendLeftUp,
  ArrowLeft,
  ArrowRight,
  ArrowUUpLeft,
  Plus,
  YoutubeLogo
} from "phosphor-react"
import { Keyframes, animated, config } from "react-spring/renderprops"
import delay from "delay"

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

const Hint = Keyframes.Spring({
  off: { opacity: 0 },
  flash: async (next, cancel) => {
    while (true) {
      await next({ from: { opacity: 0 }, opacity: 1 })
      await delay(350)
      await next({ opacity: 0 })
      await delay(500)
    }
  }
})

export default function Ui({ progress, hintVisibility }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const prog = useSpring({
    value: progress
  })

  const menuItems = useTrail(4, {
    opacity: isMenuOpen ? 1 : 0,
    height: isMenuOpen ? 1 : 0,
    y: isMenuOpen ? 0 : -5,
    config: {
      delay: 1000
    }
  })

  useEffect(() => {}, [])

  return (
    <div className="ui">
      <Transition
        className="center middle loader full abs"
        prop={progress < 100}>
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
        <Hint state={hintVisibility} native>
          {(styles) => (
            <animated.div style={{ marginTop: 480, ...styles }}>
              <ArrowLeft color=" rgb(234, 112, 255)" size={20} />
              <ArrowRight color=" rgb(234, 112, 255)" size={20} />
              <div className="ls5">swipe/scroll</div>
            </animated.div>
          )}
        </Hint>
        <Hint state={hintVisibility} native>
          {(styles) => (
            <animated.div
              className="abs"
              style={{ marginLeft: -320, ...styles }}>
              <ArrowBendLeftUp color=" rgb(234, 112, 255)" size={20} />
            </animated.div>
          )}
        </Hint>
      </div>
      <Transition
        height={40}
        className="abs bottom right"
        prop={!isMenuOpen}
        onClick={() => {
          setIsMenuOpen(!isMenuOpen)
        }}>
        <YoutubeLogo color=" rgb(234, 112, 255)" size={40} />
      </Transition>
      <Transition prop={isMenuOpen} className="ui bottom menu">
        <div>
          <Reveal height={30} style={menuItems[0]} className="fs3 mb oh">
            spotify
          </Reveal>
          <Reveal height={30} style={menuItems[1]} className="fs3 mb oh">
            youtube
          </Reveal>
          <Reveal height={30} style={menuItems[2]} className="fs3 mb oh">
            link 1
          </Reveal>
          <Reveal height={30} style={menuItems[3]} className="fs3 mb oh">
            link 2
          </Reveal>
        </div>
      </Transition>
      <Transition prop={isMenuOpen} className="ui full">
        <iframe
          width="720"
          height="403"
          src="https://www.youtube.com/embed/2Z4m4lnjxkY?controls=0&rel=0"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen></iframe>
      </Transition>
      <Transition
        prop={isMenuOpen}
        className="abs bottom right"
        onClick={() => {
          setIsMenuOpen(!isMenuOpen)
        }}>
        <ArrowUUpLeft color=" rgb(234, 112, 255)" size={40} />
      </Transition>
    </div>
  )
}
