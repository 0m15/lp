import { useEffect, useMemo, useRef } from "react"
class MotionSensor {
  acceleration = [0, 0, 0]

  constructor({ onMotion = (event) => {} } = {}) {
    document.addEventListener("click", () => {
      // iOS 13+
      if (typeof DeviceMotionEvent.requestPermission === "function") {
        DeviceMotionEvent.requestPermission()
          .then((response) => {
            if (response !== "granted") {
              console.log("Permission to use accelerometerdenied")
              return
            }
            window.addEventListener("devicemotion", (event) => {
              const { x, y, z } = event.accelerationIncludingGravity
              this.acceleration = [-x, -y, z]
              onMotion({ ...event, acceleration: this.acceleration })
            })
          })
          .catch(console.error)
      } else if (navigator.permissions) {
        navigator.permissions
          .query({ name: "accelerometer" })
          .then((results) => {
            if (
              results.length &&
              results.every((result) => result.state === "granted")
            ) {
              console.log("Permission to use accelerometerdenied")
              return
            }

            if (typeof window.Accelerometer !== "function") {
              console.log("Accelerometer not suppoerted")
              return
            }

            let accelerometer = new window.Accelerometer({ frequency: 60 })
            accelerometer.addEventListener("reading", (e) => {
              this.acceleration = [
                accelerometer.x,
                accelerometer.y,
                accelerometer.z
              ]
            })
            accelerometer.start()
          })
      }
    })
  }
}

export default function useAccelerometer({ onMotion }) {
  const acceleration = useRef([0, 0, 0])

  useEffect(() => {
    new MotionSensor({
      onMotion: (event) => {
        acceleration.current = event.acceleration
        onMotion && onMotion(acceleration.current)
      }
    })
  }, [])

  return acceleration
}
