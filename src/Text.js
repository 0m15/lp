import { Text } from "drei"
import React, { forwardRef } from "react"

const TextImpl = forwardRef((props, ref) => {
  return (
    <Text
      ref={ref}
      color="white"
      font="/PressStart2P-Regular.woff"
      {...props}
    />
  )
})

export default TextImpl
