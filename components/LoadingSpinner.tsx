
import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="w-12 h-12 border-2 border-[#39ff14]/10 border-t-[#39ff14] rounded-full"
      />
      <p className="font-orbitron text-[#39ff14]/60 text-[8px] font-bold uppercase tracking-[0.5em]">Linking Network...</p>
    </div>
  );
};

export default LoadingSpinner;
