import React, { Suspense } from "react"
import LP from "./LP"

export default function Scene() {
  return (
    <>
      {/* <ambientLight intensity={1.2} /> */}
      <pointLight position={[5, 1, 3]} intensity={1} />
      <pointLight position={[-5, -1, 0]} intensity={1} />
      <Suspense fallback={null}>
        <LP />
      </Suspense>
    </>
  )
}
