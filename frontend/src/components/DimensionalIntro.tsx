import React from 'react';
import { motion } from 'framer-motion';

export const DimensionalIntro: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay: 1.2,
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 150,
      },
    },
  };

  return (
    <motion.div
      className="max-w-3xl text-center"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.p 
        className="text-xl md:text-2xl text-neutral-100 mb-8 leading-relaxed font-light"
        variants={itemVariants}
      >
        A personal dimensional cosmos to explore my creative universe
      </motion.p>
      
      <motion.div 
        className="flex flex-wrap justify-center gap-4 mb-10"
        variants={itemVariants}
      >
        <div className="px-4 py-2 rounded-full bg-indigo-500/20 backdrop-blur-md border border-indigo-400/30 text-indigo-100">
          photography
        </div>
        <div className="px-4 py-2 rounded-full bg-rose-500/20 backdrop-blur-md border border-rose-400/30 text-rose-100">
          code
        </div>
        <div className="px-4 py-2 rounded-full bg-amber-500/20 backdrop-blur-md border border-amber-400/30 text-amber-100">
          art
        </div>
        <div className="px-4 py-2 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 text-emerald-100">
          notes
        </div>
        <div className="px-4 py-2 rounded-full bg-sky-500/20 backdrop-blur-md border border-sky-400/30 text-sky-100">
          ideas
        </div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="relative group"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg blur opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
        <button className="relative px-8 py-3 bg-black rounded-lg text-white font-medium">
          Enter The Dimension
        </button>
      </motion.div>
    </motion.div>
  );
};
