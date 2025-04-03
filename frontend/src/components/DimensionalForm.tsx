import React from 'react';
import { motion } from 'framer-motion';

interface DimensionalFormProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const DimensionalForm: React.FC<DimensionalFormProps> = ({ 
  children, 
  title, 
  subtitle 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative z-10 w-full max-w-md overflow-hidden"
    >
      {/* Background glow effects */}
      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/30 via-pink-500/30 to-blue-600/30 rounded-2xl blur-xl"></div>
      <div className="absolute inset-0 bg-black rounded-2xl backdrop-blur-xl"></div>
      
      {/* Form container */}
      <motion.div 
        className="relative backdrop-blur-sm bg-black/50 rounded-2xl p-8 border border-white/10 overflow-hidden"
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2, type: "spring" }}
      >
        {/* Animated orbs */}
        <motion.div 
          className="absolute w-40 h-40 rounded-full bg-purple-500/20 -top-20 -right-20 blur-xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.2, 0.3]
          }}
          transition={{ 
            duration: 5, 
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        <motion.div 
          className="absolute w-40 h-40 rounded-full bg-pink-500/20 -bottom-20 -left-20 blur-xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{ 
            duration: 7, 
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        
        {/* Form title */}
        <motion.div 
          className="mb-6 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-3xl font-bold text-white">{title}</h2>
          {subtitle && (
            <p className="mt-2 text-gray-300">{subtitle}</p>
          )}
        </motion.div>
        
        {/* Form content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {children}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
