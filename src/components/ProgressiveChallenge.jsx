import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Award } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

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
  return { expression: '1 + 1', answer: 2 };
}

const ProgressiveChallenge = ({ type, heroName, onBack }) => {
  const PHASES = [
    { id: 'units', title: 'UNIDADES', description: 'Somas simples com números de 1 a 9.' },
    { id: 'expanded', title: 'DEZENAS', description: 'Somas com números maiores, de 1 a 30.' },
    { id: 'negative_units', title: 'NEGATIVOS (UNIDADES)', description: 'Agora incluiremos números negativos para testar sua mente.' },
    { id: 'negative_expanded', title: 'NEGATIVOS (DEZENAS)', description: 'Números positivos e negativos entre 1 e 30.' },
    { id: 'triple_terms', title: 'SEQUÊNCIA TRIPLA', description: 'Três números em sequência para processamento rápido.' }
  ];

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
    if (savedProgress && savedProgress !== PHASES[0].id) {
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
              <span className="text-xs opacity-50 uppercase tracking-widest">{type === 'soma' ? 'Somas' : 'Desafio'} | {currentPhaseInfo.title}</span>
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

export default ProgressiveChallenge;
