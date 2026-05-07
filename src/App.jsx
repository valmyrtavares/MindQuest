import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';

// Components
import MatrixRain from './components/MatrixRain';
import Menu from './components/Menu';
import HeroPrompt from './components/HeroPrompt';
import MathChallenge from './components/MathChallenge';
import ProgressiveChallenge from './components/ProgressiveChallenge';
import TabuadaChallenge from './components/TabuadaChallenge';

function App() {
  const [path, setPath] = useState(window.location.pathname);
  const [heroName, setHeroName] = useState(localStorage.getItem('hero_name') || '');

  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (newPath) => {
    const fullPath = newPath === '/' ? '/' : `/${newPath}`;
    window.history.pushState({}, '', fullPath);
    setPath(fullPath);
  };

  const handleHeroConfirm = (name) => {
    setHeroName(name);
    localStorage.setItem('hero_name', name);
  };

  const renderContent = () => {
    // If hero name is not set, always show the prompt except for the home menu
    if ((path !== '/' && path !== '') && !heroName) {
      return <HeroPrompt key="hero" onConfirm={handleHeroConfirm} />;
    }

    switch (path) {
      case '/':
      case '':
        return <Menu key="menu" onNavigate={navigate} />;
      case '/math':
        return <MathChallenge key="math" heroName={heroName} onBack={() => navigate('/')} />;
      case '/soma':
        return <ProgressiveChallenge key="soma" type="soma" heroName={heroName} onBack={() => navigate('/')} />;
      case '/tabuada':
        return <TabuadaChallenge key="tabuada" heroName={heroName} onBack={() => navigate('/')} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-screen relative z-10">
            <h1 className="text-4xl font-bold glow-text mb-4">404 - LOST IN THE MATRIX</h1>
            <Button onClick={() => navigate('/')} className="matrix-button">RETURN TO BASE</Button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen text-green-500 selection:bg-green-500 selection:text-black font-mono">
      <MatrixRain />
      
      <main className="relative z-10">
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </main>

      <Toaster />
    </div>
  );
}

export default App;
