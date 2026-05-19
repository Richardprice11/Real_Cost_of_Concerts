"use client";

import { Music2 } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

type EmptyStateProps = {
  title?: string;
  message?: string;
  action?: React.ReactNode;
};

export function EmptyState({
  title = "Nothing here yet",
  message = "No concerts logged yet. Add your first concert to start seeing your dashboard.",
  action,
}: EmptyStateProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-base-300 bg-base-100/60 px-6 py-16 text-center shadow-sm"
      initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
    >
      <motion.div
        className="mb-4 rounded-full bg-primary/10 p-4 text-primary"
        animate={reduceMotion ? undefined : { y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <Music2 className="h-10 w-10" aria-hidden />
      </motion.div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-2 max-w-md text-base-content/70">{message}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </motion.div>
  );
}
