import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Props {
  text: string;
}

export const MorphingTitle: React.FC<Props> = ({ text }) => {
  const letters = Array.from(text);
  
  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.04 * i },
    }),
  };
  
  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      className="flex overflow-hidden"
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          variants={child}
          className="text-8xl sm:text-9xl font-bold tracking-tighter inline-block"
          style={{
            textShadow: '0 0 25px rgba(255,255,255,0.5)',
            fontFamily: 'system-ui, sans-serif',
            fontVariationSettings: '"wght" 800',
            fontStretch: 'expanded',
          }}
        >
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </motion.div>
  );
};
