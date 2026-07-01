"use client"

import { motion, type HTMLMotionProps } from "motion/react"

type FadeInProps = HTMLMotionProps<"div"> & {
  delay?: number
}

/** İçeriği hafifçe yukarı kaydırarak yumuşak bir giriş animasyonu uygular. */
export function FadeIn({ delay = 0, children, ...props }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
