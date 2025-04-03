import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface DimensionalInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const DimensionalInput: React.FC<DimensionalInputProps> = ({ 
  label, 
  error, 
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div className="mb-4">
      <motion.div 
        className="relative"
        animate={{
          scale: isFocused ? 1.02 : 1,
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Background effect */}
        <motion.div 
          className={`absolute inset-0 rounded-lg ${isFocused ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 blur-sm' : 'bg-white/5'}`}
          layoutId={`input-bg-${label.replace(/\s+/g, '')}`}
        />
        
        {/* Label */}
        <motion.label
          className="block text-sm font-medium text-white/80 mb-1 ml-2"
          htmlFor={props.id}
          animate={{
            y: isFocused ? -2 : 0,
            color: isFocused ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.8)',
          }}
        >
          {label}
        </motion.label>
        
        {/* Input */}
        <input
          className="w-full bg-transparent text-white border-0 focus:ring-0 relative z-10 p-3 rounded-lg"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
      </motion.div>
      
      {/* Error message */}
      {error && (
        <motion.p 
          className="mt-1 text-pink-500 text-sm ml-2"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};
