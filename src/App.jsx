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

// --- Challenge Logic Helpers ---
function generateProblemByType(type, phase) {
  const getRand = (max, includeNegative = false) => {
    let num = Math.floor(Math.random() * max) + 1;
    if (includeNegative && Math.random() > 0.5) num *= -1;
    return num;
  };

  if (type === 'soma') {
    if (phase === 'units') {
      const a = getRand(9); const b = getRand(9);
      return { expression: `${a} + ${b}`, answer: a + b };
    }
    if (phase === 'expanded') {
      const a = getRand(30); const b = getRand(30);
      return { expression: `${a} + ${b}`, answer: a + b };
    }
    if (phase === 'negative_units') {
      const a = getRand(9, true); const b = getRand(9, true);
      const op = b < 0 ? '-' : '+';
      return { expression: `${a} ${op} ${Math.abs(b)}`, answer: a + b };
    }
    if (phase === 'negative_expanded') {
      const a = getRand(30, true); const b = getRand(30, true);
      const op = b < 0 ? '-' : '+';
      return { expression: `${a} ${op} ${Math.abs(b)}`, answer: a + b };
    }
    if (phase === 'triple_terms') {
      const a = getRand(30, true); const b = getRand(30, true); const c = getRand(30, true);
      const op1 = b < 0 ? '-' : '+'; const op2 = c < 0 ? '-' : '+';
      return { expression: `${a} ${op1} ${Math.abs(b)} ${op2} ${Math.abs(c)}`, answer: a + b + c };
    }
  }

  if (type === 'subtracao') {
    if (phase === 'units') {
      let a = getRand(9); let b = getRand(9);
      if (b > a) [a, b] = [b, a];
      return { expression: `${a} - ${b}`, answer: a - b };
    }
    if (phase === 'expanded') {
      let a = getRand(30); let b = getRand(30);
      if (b > a) [a, b] = [b, a];
      return { expression: `${a} - ${b}`, answer: a - b };
    }
    if (phase === 'negative_units') {
      const a = getRand(9, true); const b = getRand(9, true);
      const op = b < 0 ? '+' : '-';
      return { expression: `${a} ${op} ${Math.abs(b)}`, answer: a - b };
    }
    if (phase === 'negative_expanded') {
      const a = getRand(30, true); const b = getRand(30, true);
      const op = b < 0 ? '+' : '-';
      return { expression: `${a} ${op} ${Math.abs(b)}`, answer: a - b };
    }
    if (phase === 'triple_terms') {
      const a = getRand(30, true); const b = getRand(30, true); const c = getRand(30, true);
      const op1 = b < 0 ? '+' : '-'; const op2 = c < 0 ? '+' : '-';
      return { expression: `${a} ${op1} ${Math.abs(b)} ${op2} ${Math.abs(c)}`, answer: a - b - c };
    }
  }

  return { expression: '1 + 1', answer: 2 };
}

// --- Menu Component ---
const Menu = ({ onNavigate }) => {
  const options = [
    { id: 'soma', title: 'Somas', icon: <Zap className="mr-2" />, active: true },
    { id: 'subtracao', title: 'Subtrações', icon: <Repeat className="mr-2" />, active: true },
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

// --- HeroPrompt Component ---
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

// --- MathChallenge Component (Original) ---
const MathChallenge = ({ heroName, onBack }) => {
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
      toast({ title: "ERRO", description: "INSIRA UM NÚMERO.", variant: "destructive" });
      return;
    }

    if (userAnswerNum === problem.answer) {
      setScore(score + 1);
      setIsCorrect(true);
      toast({
        title: "CORRETO",
        description: `PARABÉNS ${heroName.toUpperCase()}! VOCÊ ACERTOU.`,
        className: "matrix-card border-green-500",
      });
    } else {
      setIsCorrect(false);
      toast({
        title: "FALHA",
        description: `NÃO FOI DESSA VEZ, ${heroName.toUpperCase()}!`,
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
    }
  };

  if (gameOver) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md matrix-card text-center p-8">
          <Award className="h-20 w-20 text-yellow-400 mx-auto mb-4 glow-text" />
          <h2 className="text-4xl font-bold mb-2 tracking-tighter">SESSÃO FINALIZADA</h2>
          <p className="text-xl opacity-70 mb-4 tracking-widest">{heroName.toUpperCase()}</p>
          <p className="text-2xl mb-8">PONTUAÇÃO: <span className="text-green-400">{score}/{TOTAL_QUESTIONS}</span></p>
          <Button onClick={() => { setGameOver(false); setScore(0); setCurrentQuestion(1); setProblem(generateProblem()); }} className="w-full matrix-button py-6 mb-4">REINICIAR</Button>
          <Button onClick={onBack} variant="outline" className="w-full py-4 text-sm opacity-80 hover:opacity-100 uppercase font-bold tracking-widest border-green-500/50">VOLTAR AO MENU</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <motion.div
        key={currentQuestion}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg"
      >
        <Card className="matrix-card">
          <CardHeader>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs opacity-50 uppercase tracking-widest">Calculo Mestre | {heroName}</span>
              <span className="text-xs opacity-50 uppercase tracking-widest">Q: {currentQuestion}/{TOTAL_QUESTIONS}</span>
            </div>
            <CardTitle className="text-3xl font-bold text-center glow-text uppercase">
              Resolva a Equação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="text-center">
              <motion.p 
                className="text-4xl sm:text-6xl font-mono font-bold bg-green-500/10 p-6 rounded-none border-l-4 border-green-500 inline-block"
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
                placeholder="_ENTRADA"
                className="matrix-input text-2xl h-16 text-center"
                autoFocus
                disabled={showFeedback}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            {!showFeedback ? (
              <Button onClick={handleSubmit} className="w-full matrix-button py-6 text-xl">
                PROCESSAR
              </Button>
            ) : (
              <Button onClick={handleNextQuestion} className="w-full matrix-button py-6 text-xl bg-green-500/20">
                PRÓXIMO
              </Button>
            )}
            <Button onClick={onBack} variant="ghost" className="w-full py-4 text-sm opacity-60 hover:opacity-100 uppercase font-bold tracking-widest border-green-500/20 border">ABORTAR MISSÃO</Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

// --- ProgressiveChallenge Component (Generic) ---
const ProgressiveChallenge = ({ type, heroName, onBack }) => {
  const SOMA_PHASES = [
    { id: 'units', title: 'UNIDADES', description: 'Operações simples com números de 1 a 9.' },
    { id: 'expanded', title: 'DEZENAS', description: 'Operações com números maiores, de 1 a 30.' },
    { id: 'negative_units', title: 'NEGATIVOS (UNIDADES)', description: 'Agora incluiremos números negativos para testar sua mente.' },
    { id: 'negative_expanded', title: 'NEGATIVOS (DEZENAS)', description: 'Números positivos e negativos entre 1 e 30.' },
    { id: 'triple_terms', title: 'SEQUÊNCIA TRIPLA', description: 'Três números em sequência para processamento rápido.' }
  ];

  const SUB_PHASES = [
    { id: 'negative_units', title: 'NEGATIVOS (UNIDADES)', description: 'Subtrações com números negativos. Ex: 3 - 7 = -4.' },
    { id: 'negative_expanded', title: 'NEGATIVOS (DEZENAS)', description: 'Desafio ampliado com números até 30.' },
    { id: 'triple_terms', title: 'SEQUÊNCIA TRIPLA', description: 'Três números em sequência. Ex: 15 - 8 - 12.' }
  ];

  const PHASES = type === 'soma' ? SOMA_PHASES : SUB_PHASES;
  const storageKey = `${type}_progress`;

  const [phase, setPhase] = useState(PHASES[0].id); 
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [problem, setProblem] = useState(generateProblemByType(type, PHASES[0].id));
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [phaseMessage, setPhaseMessage] = useState(null);
  const [resumePrompt, setResumePrompt] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const savedProgress = localStorage.getItem(storageKey);
    // Ensure the saved progress is valid for the current set of phases
    if (savedProgress && savedProgress !== PHASES[0].id && PHASES.some(p => p.id === savedProgress)) {
      setResumePrompt(savedProgress);
    }
  }, [type, storageKey]);

  const handleInputChange = (e) => {
    setUserAnswer(e.target.value);
    setIsCorrect(null);
    setShowFeedback(false);
  };

  const handleResume = (shouldResume) => {
    if (shouldResume && resumePrompt) {
      setPhase(resumePrompt);
      setProblem(generateProblemByType(type, resumePrompt));
    } else {
      setPhase(PHASES[0].id);
      setProblem(generateProblemByType(type, PHASES[0].id));
      localStorage.setItem(storageKey, PHASES[0].id);
    }
    setResumePrompt(null);
    setScore(0);
    setHits(0);
    setMisses(0);
    setCurrentQuestion(1);
  };

  const handleSubmit = () => {
    const userAnswerNum = parseInt(userAnswer);
    if (isNaN(userAnswerNum)) {
      toast({ title: "ERRO", description: "INSIRA UM NÚMERO.", variant: "destructive" });
      return;
    }

    if (userAnswerNum === problem.answer) {
      setScore(score + 1);
      setHits(hits + 1);
      setIsCorrect(true);
    } else {
      setMisses(misses + 1);
      setIsCorrect(false);
    }
    setShowFeedback(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < 10) {
      setCurrentQuestion(currentQuestion + 1);
      setProblem(generateProblemByType(type, phase));
      setUserAnswer('');
      setIsCorrect(null);
      setShowFeedback(false);
    } else {
      const currentPhaseIndex = PHASES.findIndex(p => p.id === phase);
      if (score >= 7) {
        if (currentPhaseIndex < PHASES.length - 1) {
          const nextPhase = PHASES[currentPhaseIndex + 1];
          localStorage.setItem(storageKey, nextPhase.id);
          setPhaseMessage({
            title: `Parabéns ${heroName}!`,
            text: nextPhase.description,
            nextId: nextPhase.id,
            success: true
          });
        } else {
          setGameOver(true);
        }
      } else {
        setPhaseMessage({
          title: `Tente de novo, ${heroName}`,
          text: `Seus acertos (${score}/10) são insuficientes para a próxima fase.`,
          nextId: phase,
          success: false
        });
      }
    }
  };

  const startNextPhase = () => {
    const nextPhaseId = phaseMessage.nextId;
    setPhase(nextPhaseId);
    setProblem(generateProblemByType(type, nextPhaseId));
    setCurrentQuestion(1);
    setScore(0);
    setHits(0);
    setMisses(0);
    setUserAnswer('');
    setIsCorrect(null);
    setShowFeedback(false);
    setPhaseMessage(null);
  };

  if (resumePrompt) {
    const resumePhaseInfo = PHASES.find(p => p.id === resumePrompt) || PHASES[0];
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md matrix-card text-center p-8">
          <h2 className="text-3xl font-bold mb-4 glow-text uppercase tracking-tighter">PROGRESSO DETECTADO</h2>
          <p className="text-xl mb-8 opacity-80 uppercase tracking-tight font-bold underline">Heroi: {heroName}</p>
          <p className="text-xl mb-8 opacity-80 uppercase">Estágio atual: <span className="text-green-400 font-bold">{resumePhaseInfo.title}</span></p>
          <div className="flex flex-col gap-4">
            <Button onClick={() => handleResume(true)} className="matrix-button py-6 text-xl">CONTINUAR JORNADA</Button>
            <Button onClick={() => handleResume(false)} variant="ghost" className="opacity-50 text-xs">RECOMEÇAR DO ZERO</Button>
          </div>
        </Card>
      </div>
    );
  }

  if (phaseMessage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md matrix-card text-center p-8">
          <h2 className={`text-4xl font-bold mb-4 uppercase tracking-tighter ${phaseMessage.success ? 'text-green-400' : 'text-pink-400 opacity-80'}`}>
            {phaseMessage.title}
          </h2>
          <p className="text-xl mb-8 opacity-80">{phaseMessage.text}</p>
          <Button onClick={startNextPhase} className="w-full matrix-button py-6 text-xl">
            {phaseMessage.success ? 'INICIAR PRÓXIMA FASE' : 'RECOMEÇAR FASE'}
          </Button>
        </Card>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md matrix-card text-center p-8">
          <Award className="h-20 w-20 text-yellow-400 mx-auto mb-4 glow-text" />
          <h2 className="text-4xl font-bold mb-2 tracking-tighter">MISSÃO CONCLUÍDA</h2>
          <p className="text-xl mb-4 opacity-70 tracking-widest">{heroName.toUpperCase()}</p>
          <p className="text-2xl mb-8">PONTUAÇÃO FINAL: <span className="text-green-400">{score}/10</span></p>
          <Button onClick={() => { setGameOver(false); setPhase(PHASES[0].id); setScore(0); setHits(0); setMisses(0); setCurrentQuestion(1); setProblem(generateProblemByType(type, PHASES[0].id)); }} className="w-full matrix-button py-6 mb-4">REPETIR JORNADA</Button>
          <Button onClick={onBack} variant="outline" className="w-full py-4 text-sm opacity-80 hover:opacity-100 uppercase font-bold tracking-widest border-green-500/50">VOLTAR AO MENU</Button>
        </Card>
      </div>
    );
  }

  const currentPhaseInfo = PHASES.find(p => p.id === phase) || PHASES[0];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-lg relative">
        <div className="absolute -top-14 left-0 text-xs opacity-50 uppercase tracking-widest hidden sm:block">
          Heroi: {heroName}
        </div>
        <div className="absolute -top-14 right-0 text-xl font-bold glow-text opacity-90 flex gap-4 uppercase tracking-tighter">
          <span>Q: {currentQuestion}/10</span>
          <span className="text-green-400">A: {hits}</span>
          <span className="text-pink-400">E: {misses}</span>
        </div>

        <Card className="matrix-card">
          <CardHeader>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs opacity-50 uppercase tracking-widest">{type === 'soma' ? 'Somas' : 'Subtrações'} | {currentPhaseInfo.title}</span>
            </div>
            <CardTitle className={`text-4xl font-bold text-center transition-colors duration-500 ${isCorrect === true ? 'text-green-400' : isCorrect === false ? 'text-pink-400 opacity-80' : 'text-green-500'}`}>
              {isCorrect === true ? 'CORRETO' : isCorrect === false ? 'INCORRETO' : 'RESOLVA'}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-8 pb-8">
            <div className="text-center">
              <motion.p 
                className="text-5xl sm:text-7xl font-mono font-bold bg-green-500/5 p-8 border-l-8 border-green-500 inline-block"
                key={problem.expression}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                {problem.expression}
              </motion.p>
            </div>

            <div className="flex flex-col items-center gap-6">
              <Input
                type="number"
                value={userAnswer}
                onChange={handleInputChange}
                onKeyPress={(e) => e.key === 'Enter' && !showFeedback && handleSubmit()}
                placeholder="_?"
                className="matrix-input text-4xl h-20 text-center"
                autoFocus
                disabled={showFeedback}
              />

              <AnimatePresence>
                {showFeedback && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`w-full p-6 text-center rounded-none border ${isCorrect ? 'bg-green-500/10 border-green-500' : 'bg-pink-500/10 border-pink-500/50 text-pink-400'}`}
                  >
                    {isCorrect ? (
                      <div className="space-y-1">
                        <p className="text-3xl font-bold uppercase tracking-tighter">Parabéns {heroName}</p>
                        <p className="text-xl opacity-90 uppercase">Resposta correta</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-lg opacity-80 uppercase mb-1">{heroName}, analise o erro:</p>
                        <p className="text-2xl font-bold uppercase">{problem.expression} = {problem.answer}</p>
                        <p className="text-lg opacity-80 italic">Sua resposta = {userAnswer || '?'}</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            {!showFeedback ? (
              <Button onClick={handleSubmit} className="w-full matrix-button py-8 text-2xl">
                VERIFICAR
              </Button>
            ) : (
              <Button onClick={handleNextQuestion} className="w-full matrix-button py-8 text-2xl bg-green-500/20">
                PRÓXIMO {'>'}{'>'}
              </Button>
            )}
            <Button onClick={onBack} variant="ghost" className="w-full py-4 text-sm opacity-60 hover:opacity-100 uppercase font-bold tracking-widest border-green-500/20 border">SAIR DA MISSÃO</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

// --- Main App Component ---
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

  return (
    <div className="min-h-screen text-green-500 selection:bg-green-500 selection:text-black">
      <MatrixRain />
      
      <main className="relative z-10">
        <AnimatePresence mode="wait">
          {path === '/' || path === '' ? (
            <Menu key="menu" onNavigate={navigate} />
          ) : !heroName ? (
            <HeroPrompt key="hero" onConfirm={handleHeroConfirm} />
          ) : path === '/math' ? (
            <MathChallenge key="math" heroName={heroName} onBack={() => navigate('/')} />
          ) : path === '/soma' ? (
            <ProgressiveChallenge key="soma" type="soma" heroName={heroName} onBack={() => navigate('/')} />
          ) : path === '/subtracao' ? (
            <ProgressiveChallenge key="subtracao" type="subtracao" heroName={heroName} onBack={() => navigate('/')} />
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
