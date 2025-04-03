import React from 'react';
import { motion } from 'framer-motion';

interface DimensionalDividerProps {
  text: string;
}

export const DimensionalDivider: React.FC<DimensionalDividerProps> = ({ text }) => {
  return (
    <div className="relative flex items-center py-4">
      <motion.div 
        className="flex-grow border-t border-white/10"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      />
      <motion.span 
        className="flex-shrink mx-4 text-sm text-white/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        {text}
      </motion.span>
      <motion.div 
        className="flex-grow border-t border-white/10"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      />
    </div>
  );
};
