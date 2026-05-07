import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const HeroPrompt = ({ onConfirm }) => {
  const [name, setName] = useState('');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
        <Card className="matrix-card p-8 text-center">
          <h2 className="text-3xl font-bold mb-6 glow-text tracking-tighter uppercase">
            IDENTIFICAÇÃO NECESSÁRIA
          </h2>
          <p className="text-xl mb-8 opacity-80 uppercase tracking-tight">
            Qual é o nome do Heroi que aceita o desafio?
          </p>
          <Input 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && name.trim() && onConfirm(name)}
            placeholder="_NOME_HEROI"
            className="matrix-input text-2xl h-16 mb-8 text-center"
            autoFocus
          />
          <Button 
            onClick={() => name.trim() && onConfirm(name)}
            className="w-full matrix-button py-8 text-xl font-bold"
            disabled={!name.trim()}
          >
            ACEITAR DESAFIO
          </Button>
        </Card>
      </motion.div>
    </div>
  );
};

export default HeroPrompt;
