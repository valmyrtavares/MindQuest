import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Zap, Repeat, Cpu, BookOpen, Terminal, Grid3X3 } from 'lucide-react';

const Menu = ({ onNavigate }) => {
  const options = [
    { id: 'soma', title: 'Somas', icon: <Zap className="mr-2" />, active: true },
    { id: 'tabuada', title: 'Tabuadas', icon: <Grid3X3 className="mr-2" />, active: true },
    { id: 'multi', title: 'Multiplicações', icon: <Cpu className="mr-2" />, active: false },
    { id: 'div', title: 'Divisões', icon: <BookOpen className="mr-2" />, active: false },
    { id: 'math', title: 'Calculo Mestre', icon: <Terminal className="mr-2" />, active: true },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl font-bold glow-text mb-2 tracking-tighter">PROJECT_MATH</h1>
        <p className="text-sm opacity-70 tracking-widest uppercase">System Initialization Success</p>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
        {options.map((opt, idx) => (
          <motion.div
            key={opt.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Button
              onClick={() => opt.active && onNavigate(opt.id)}
              className={`w-full matrix-button py-8 text-xl font-bold flex items-center justify-center ${!opt.active ? 'opacity-30 cursor-not-allowed' : ''}`}
              variant="outline"
            >
              {opt.icon}
              {opt.title}
            </Button>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-12 text-xs opacity-50 uppercase tracking-widest text-center"
      >
        A inteligência é um músculo.<br />Exercite-a.
      </motion.div>
    </div>
  );
};

export default Menu;
