import React from 'react';
import { motion } from 'framer-motion';

interface DimensionalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'social';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const DimensionalButton: React.FC<DimensionalButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading = false,
  icon,
  ...props 
}) => {
  // Determine styles based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white';
      case 'secondary':
        return 'bg-white/10 hover:bg-white/15 text-white border border-white/20';
      case 'social':
        return 'bg-black/30 hover:bg-black/40 text-white border border-white/10';
      default:
        return 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white';
    }
  };

  return (
    <motion.button
      className={`relative rounded-lg px-4 py-2 font-medium transition-all ${getVariantStyles()} w-full flex justify-center items-center`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {/* Button glow effect */}
      <span className="absolute inset-0 rounded-lg opacity-0 hover:opacity-30 transition-opacity duration-300 bg-white blur-md"></span>
      
      {/* Loading spinner */}
      {isLoading ? (
        <motion.div 
          className="w-5 h-5 rounded-full border-2 border-white border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </>
      )}
      
      {/* Subtle particle effects */}
      {!isLoading && (
        <>
          <motion.span 
            className="absolute w-1 h-1 rounded-full bg-white opacity-80"
            animate={{
              y: [-10, 10],
              x: [-5, 5],
              opacity: [0, 1, 0],
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              repeatType: "loop",
              delay: Math.random() * 2
            }}
            style={{ left: `${20 + Math.random() * 60}%` }}
          />
          <motion.span 
            className="absolute w-1 h-1 rounded-full bg-white opacity-80"
            animate={{
              y: [-10, 10],
              x: [5, -5],
              opacity: [0, 1, 0],
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              repeatType: "loop",
              delay: Math.random() * 2
            }}
            style={{ left: `${20 + Math.random() * 60}%` }}
          />
        </>
      )}
    </motion.button>
  );
};
