"use client";

import { cn } from "~/lib/utils";
import { motion } from "framer-motion";

interface AnimateEnterProps {
  className?: string;
  delay?: number;
  children: React.ReactNode;
}

export function AnimateEnter(props: AnimateEnterProps) {
  const { className, delay, children } = props;
  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeInOut", delay: delay }}
    >
      {children}
    </motion.div>
  );
}
