import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle, XCircle, Award, BookOpen, Repeat, Cpu, Terminal, Zap, Brain } from 'lucide-react';

// --- Matrix Rain Component ---
const MatrixRain = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const characters = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const fontSize = 16;
    const columns = Math.floor(width / fontSize);
    const drops = Array(columns).fill(1);

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 5, 0, 0.05)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#00ff41';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="matrix-bg" />;
};

// --- Game Logic Helpers ---
const TOTAL_QUESTIONS = 10;
const OPERATORS = ['+', '-', '*', '/'];

function generateProblem() {
  const numCount = Math.random() < 0.5 ? 3 : 4;
  let expression = '';
  let currentExpressionForEval = '';
  
  let firstNum = Math.floor(Math.random() * 10) + 1;
  expression += firstNum;
  currentExpressionForEval += firstNum;

  for (let i = 1; i < numCount; i++) {
    const operator = OPERATORS[Math.floor(Math.random() * OPERATORS.length)];
    let nextNum;

    if (operator === '/') {
      const possibleDivisors = [];
      for (let j = 1; j <= 10; j++) {
        const currentVal = eval(currentExpressionForEval);
        if (currentVal % j === 0 && currentVal / j <= 20 && currentVal / j >= 1) {
          possibleDivisors.push(j);
        }
      }
      if (possibleDivisors.length > 0) {
        nextNum = possibleDivisors[Math.floor(Math.random() * possibleDivisors.length)];
      } else {
        return generateProblem(); 
      }
    } else if (operator === '*') {
      nextNum = Math.floor(Math.random() * 5) + 1; 
    } else {
      nextNum = Math.floor(Math.random() * 10) + 1;
    }
    
    expression += ` ${operator} ${nextNum}`;
    currentExpressionForEval += ` ${operator} ${nextNum}`;

    try {
      let tempAnswer = eval(currentExpressionForEval);
      if (!Number.isFinite(tempAnswer) || Math.floor(tempAnswer) !== tempAnswer) {
        return generateProblem();
      }
    } catch (e) {
      return generateProblem();
    }
  }

  let answer;
  try {
    answer = eval(currentExpressionForEval);
    if (!Number.isFinite(answer) || Math.floor(answer) !== answer) {
      return generateProblem();
    }
  } catch (e) {
    return generateProblem();
  }
  
  return { expression, answer };
}

// --- Menu Component ---
const Menu = ({ onNavigate }) => {
  const options = [
    { id: 'soma', title: 'Somas', icon: <Zap className="mr-2" />, active: false },
    { id: 'math', title: 'Calculo Mestre', icon: <Terminal className="mr-2" />, active: true },
    { id: 'logic', title: 'Lógica Pura', icon: <Brain className="mr-2" />, active: false },
    { id: 'history', title: 'Fatos & Mitos', icon: <BookOpen className="mr-2" />, active: false },
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

// --- MathChallenge Component ---
const MathChallenge = ({ onBack }) => {
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [score, setScore] = useState(0);
  const [problem, setProblem] = useState(generateProblem());
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e) => {
    setUserAnswer(e.target.value);
    setIsCorrect(null);
    setShowFeedback(false);
  };

  const handleSubmit = () => {
    const userAnswerNum = parseFloat(userAnswer);
    if (isNaN(userAnswerNum)) {
      toast({
        title: "ERRO DE ENTRADA",
        description: "ENTRADA NÃO NUMÉRICA DETECTADA.",
        variant: "destructive",
      });
      return;
    }

    if (userAnswerNum === problem.answer) {
      setScore(score + 1);
      setIsCorrect(true);
      toast({
        title: "SUCESSO",
        description: "CALCULO CORRETO.",
        className: "matrix-card border-green-500",
      });
    } else {
      setIsCorrect(false);
      toast({
        title: "FALHA",
        description: `VALOR ESPERADO: ${problem.answer}.`,
        variant: "destructive",
      });
    }
    setShowFeedback(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < TOTAL_QUESTIONS) {
      setCurrentQuestion(currentQuestion + 1);
      setProblem(generateProblem());
      setUserAnswer('');
      setIsCorrect(null);
      setShowFeedback(false);
    } else {
      setGameOver(true);
      // Save high score to localStorage
      const savedHigh = localStorage.getItem('math_high_score') || 0;
      if (score > savedHigh) {
        localStorage.setItem('math_high_score', score);
      }
    }
  };

  const restartGame = () => {
    setCurrentQuestion(1);
    setScore(0);
    setProblem(generateProblem());
    setUserAnswer('');
    setIsCorrect(null);
    setShowFeedback(false);
    setGameOver(false);
  };

  if (gameOver) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md matrix-card text-center">
          <CardHeader>
            <div className="flex justify-center mb-4"><Award className="h-16 w-16 text-yellow-400 glow-text" /></div>
            <CardTitle className="text-4xl font-bold tracking-tighter">SESSÃO FINALIZADA</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl mb-6">PONTUAÇÃO: <span className="text-green-400 font-bold">{score}/{TOTAL_QUESTIONS}</span></p>
            <p className="text-sm opacity-70">Sua inteligência foi aumentada em {(score/TOTAL_QUESTIONS * 10).toFixed(1)}%.</p>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button onClick={restartGame} className="w-full matrix-button py-6">REINICIAR</Button>
            <Button onClick={onBack} variant="ghost" className="text-xs opacity-50">VOLTAR AO MENU</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <motion.div
        key={currentQuestion}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full max-w-lg"
      >
        <Card className="matrix-card">
          <CardHeader>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs opacity-50 uppercase tracking-widest">Calculo Mestre</span>
              <span className="text-xs opacity-50 uppercase tracking-widest">Q: {currentQuestion}/{TOTAL_QUESTIONS}</span>
            </div>
            <CardTitle className="text-3xl font-bold text-center glow-text">
              RESOLVA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="text-center">
              <motion.p 
                className="text-4xl sm:text-6xl font-mono font-bold bg-green-500/10 p-6 rounded-none border-l-4 border-green-500 inline-block"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
              >
                {problem.expression}
              </motion.p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <Input
                type="number"
                value={userAnswer}
                onChange={handleInputChange}
                onKeyPress={(e) => e.key === 'Enter' && !showFeedback && handleSubmit()}
                placeholder="_ENTRADA_DADOS"
                className="matrix-input text-2xl h-16 text-center"
                autoFocus
                disabled={showFeedback}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            {!showFeedback ? (
              <Button onClick={handleSubmit} className="w-full matrix-button py-6 text-xl">
                ENVIAR
              </Button>
            ) : (
              <Button onClick={handleNextQuestion} className="w-full matrix-button py-6 text-xl bg-green-500/20">
                PRÓXIMO {'>'}{'>'}
              </Button>
            )}
            <Button onClick={onBack} variant="ghost" className="text-xs opacity-30 mt-4">ABORTAR SESSÃO</Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

// --- Main App Component ---
function App() {
  const [path, setPath] = useState(window.location.pathname);

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

  return (
    <div className="min-h-screen text-green-500 selection:bg-green-500 selection:text-black">
      <MatrixRain />
      
      <main className="relative z-10">
        <AnimatePresence mode="wait">
          {path === '/' || path === '' ? (
            <Menu key="menu" onNavigate={navigate} />
          ) : path === '/math' ? (
            <MathChallenge key="math" onBack={() => navigate('/')} />
          ) : (
            <div className="flex flex-col items-center justify-center min-h-screen">
              <h1 className="text-4xl font-bold glow-text mb-4">404 - LOST IN THE MATRIX</h1>
              <Button onClick={() => navigate('/')} className="matrix-button">RETURN TO BASE</Button>
            </div>
          )}
        </AnimatePresence>
      </main>

      <Toaster />
    </div>
  );
}

export default App;