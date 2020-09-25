import React, { Suspense } from "react"
import LP from "./LP"

export default function Scene() {
  return (
    <>
      {/* <ambientLight intensity={1.2} /> */}
      <pointLight position={[3, 5, 3]} intensity={1.5} />
      <pointLight position={[-3, 5, 0]} intensity={1.5} />
      <Suspense fallback={null}>
        <LP />
      </Suspense>
    </>
  )
}
