"use client";

import { motion, useReducedMotion } from "motion/react";

type PageTransitionProps = {
  children: React.ReactNode;
  className?: string;
};

export function PageTransition({ children, className = "" }: PageTransitionProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
