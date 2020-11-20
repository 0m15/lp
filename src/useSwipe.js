import { useEffect, useRef } from "react"

export default function useSwipe() {
  const mouse = useRef()

  useEffect(() => {
    const onMouseMove = () => {}

    document.addEventListener("mousemove", onMouseMove, { passive: true })
  })
}
