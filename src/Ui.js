import { a, useSpring, useTrail, useTransition } from "@react-spring/web"
import delay from "delay"
import {
  ArrowBendLeftUp,
  ArrowLeft,
  ArrowRight,
  ArrowUUpLeft,
  YoutubeLogo
} from "phosphor-react"
import React, { useState } from "react"
import { animated, Keyframes } from "react-spring/renderprops"

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

export default function Ui({ progress, hintVisibility, side }) {
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

  const videoId = side === "A" ? "t_oCaVYruxI" : "Rh5NIarELt4"

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
              <ArrowLeft color="currentColor" size={20} />
              <ArrowRight color="currentColor" size={20} />
              <div className="ls5">swipe/scroll</div>
            </animated.div>
          )}
        </Hint>
        <Hint state={hintVisibility} native>
          {(styles) => (
            <animated.div
              className="abs"
              style={{ marginLeft: -320, ...styles }}>
              <ArrowBendLeftUp color="currentColor" size={20} />
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
        <YoutubeLogo color="currentColor" size={40} />
      </Transition>
      <Transition prop={isMenuOpen} className="ui bottom menu">
        <div>
          <Reveal height={40} style={menuItems[0]} className="fs3 mb oh">
            <a
              target="_blank"
              title="Brujas on spotify"
              href="https://open.spotify.com/artist/2fyaN7UII85mJsKOkUrmcM">
              <img width={40} height={40} src="/spotify-512.png" />
            </a>
          </Reveal>
          <Reveal height={40} style={menuItems[1]} className="fs3 mb oh">
            <a
              target="_blank"
              title="Brujas on youtube"
              href="https://www.youtube.com/channel/UCUDZ_56ZsDRS308o-khK8IA">
              <img width={40} height={40} src="/youtube-512.webp" />
            </a>
          </Reveal>
          <Reveal height={40} style={menuItems[1]} className="fs3 mb oh">
            <a
              target="_blank"
              title="Brujas on instagram"
              href="https://www.instagram.com/bru__jas/">
              <img width={40} height={40} src="/instagram-512.png" />
            </a>
          </Reveal>
        </div>
      </Transition>
      <Transition prop={isMenuOpen} className="ui full">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&modestbranding=1&showinfo=0&rel=0&iv_load_policy=3&theme=light`}
          width="100%"
          height="480"
          style={{ marginTop: -30, maxWidth: 1080 }}
          frameborder="0"></iframe>
      </Transition>
      <Transition
        prop={isMenuOpen}
        className="abs bottom right"
        onClick={() => {
          setIsMenuOpen(!isMenuOpen)
        }}>
        <ArrowUUpLeft color="currentColor" size={40} />
      </Transition>
    </div>
  )
}
