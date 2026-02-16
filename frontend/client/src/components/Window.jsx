import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Minus, Maximize2 } from 'lucide-react';

const Window = ({ id, title, children, onClose, onMinimize, isActive, onFocus, initialDimensions }) => {
  const constraintsRef = useRef(null);
  
  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ 
        x: initialDimensions.x, 
        y: initialDimensions.y, 
        scale: 0.95, 
        opacity: 0 
      }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        boxShadow: isActive ? "0 25px 50px -12px rgba(0, 0, 0, 0.5)" : "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
      }}
      exit={{ scale: 0.9, opacity: 0, transition: { duration: 0.1 } }}
      onMouseDown={onFocus}
      style={{ 
        width: initialDimensions.width, 
        height: initialDimensions.height,
        position: 'absolute',
        zIndex: isActive ? 50 : 10
      }}
      className={`flex flex-col rounded-lg overflow-hidden border border-slate-700 bg-slate-800 shadow-2xl ${isActive ? '' : 'opacity-90'}`}
    >
      {/* Title Bar */}
      <div 
        className={`h-9 flex items-center justify-between px-3 select-none cursor-grab active:cursor-grabbing border-b border-slate-700/50 ${isActive ? 'bg-slate-700' : 'bg-slate-800'}`}
      >
        <span className="text-xs font-medium text-slate-200">{title}</span>
        <div className="flex items-center gap-2" onMouseDown={(e) => e.stopPropagation()}>
          <button 
            onClick={onMinimize}
            className="p-1 hover:bg-white/10 rounded group"
          >
            <Minus size={12} className="text-slate-400 group-hover:text-white" />
          </button>
          <button 
            className="p-1 hover:bg-white/10 rounded group"
          >
             {/* Maximize not implemented fully yet, keeping for visuals */}
            <Maximize2 size={12} className="text-slate-400 group-hover:text-white" />
          </button>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-red-500 rounded group transition-colors"
          >
            <X size={12} className="text-slate-400 group-hover:text-white" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-slate-900/95 p-1 relative">
        {children}
      </div>
      
    </motion.div>
  );
};

export default Window;
