import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Timer, RefreshCcw, ArrowLeft } from 'lucide-react';

const TabuadaChallenge = ({ heroName = 'RECRUTA', onBack }) => {
  const [selectedTable, setSelectedTable] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const timerRef = useRef(null);

  const TOTAL_QUESTIONS = 20;

  useEffect(() => {
    if (startTime && !gameOver) {
      timerRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [startTime, gameOver]);

  const startChallenge = (table) => {
    const newQuestions = [];
    for (let i = 0; i < TOTAL_QUESTIONS; i++) {
      const multiplier = Math.floor(Math.random() * 10) + 1;
      newQuestions.push({
        num1: table,
        num2: multiplier,
        answer: table * multiplier
      });
    }
    setQuestions(newQuestions);
    setSelectedTable(table);
    setCurrentIndex(0);
    setScore(0);
    setElapsedTime(0);
    setStartTime(Date.now());
    setGameOver(false);
    setUserAnswer('');
    setShowFeedback(false);
  };

  const handleSubmit = () => {
    const val = parseInt(userAnswer);
    const correct = val === questions[currentIndex].answer;
    
    if (correct) {
      setScore(s => s + 1);
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
    }
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (currentIndex < TOTAL_QUESTIONS - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer('');
      setIsCorrect(null);
      setShowFeedback(false);
    } else {
      setGameOver(true);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) return `${mins} min e ${secs} seg`;
    return `${secs} segundos`;
  };

  if (!selectedTable) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Card className="matrix-card p-8 text-center">
            <h2 className="text-3xl font-bold mb-6 glow-text tracking-tighter uppercase">TABUADAS</h2>
            <p className="text-lg mb-8 opacity-80 uppercase">Escolha sua arma, {heroName}:</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                <Button 
                  key={num} 
                  onClick={() => startChallenge(num)}
                  variant="outline"
                  className="matrix-button py-6 text-xl"
                >
                  {num}
                </Button>
              ))}
            </div>

            <Button onClick={onBack} variant="outline" className="w-full border-green-500/50 opacity-70 hover:opacity-100">
              <ArrowLeft className="mr-2 h-4 w-4" /> VOLTAR AO MENU
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }


  if (gameOver) {
    const success = score >= 17;
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md matrix-card text-center p-8">
          {success ? <Award className="h-20 w-20 text-yellow-400 mx-auto mb-4 glow-text" /> : <RefreshCcw className="h-20 w-20 text-pink-500 mx-auto mb-4 opacity-70" />}
          <h2 className={`text-4xl font-bold mb-4 tracking-tighter ${success ? 'text-green-400' : 'text-pink-400 opacity-80'}`}>
            {success ? 'MISSÃO CUMPRIDA!' : 'TENTE DE NOVO'}
          </h2>
          <p className="text-2xl mb-2">{heroName.toUpperCase()}</p>
          <p className="text-xl mb-4">PONTUAÇÃO: <span className={success ? 'text-green-400 font-bold' : 'text-pink-400'}>{score}/{TOTAL_QUESTIONS}</span></p>
          <p className="text-lg opacity-80 mb-8 flex items-center justify-center gap-2">
            <Timer className="h-5 w-5" /> TEMPO: {formatTime(elapsedTime)}
          </p>

          {success ? (
            <div className="space-y-4">
              <p className="text-sm opacity-60 uppercase mb-4">Você superou a Tabuada do {selectedTable}!</p>
              <Button onClick={() => setSelectedTable(null)} className="w-full matrix-button py-6 text-xl">ESCOLHER OUTRA</Button>
            </div>
          ) : (
            <Button onClick={() => startChallenge(selectedTable)} className="w-full matrix-button py-6 text-xl bg-pink-500/20 border-pink-500/50">RECOMEÇAR TABUADA DO {selectedTable}</Button>
          )}
          <Button onClick={onBack} variant="ghost" className="w-full mt-4 opacity-50 uppercase text-xs">SAIR</Button>
        </Card>
      </div>
    );
  }

  const current = questions[currentIndex];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-lg relative">
        <div className="absolute -top-14 left-0 text-xs opacity-50 uppercase tracking-widest">
          Tabuada do {selectedTable} | {heroName}
        </div>
        <div className="absolute -top-14 right-0 text-xl font-bold glow-text opacity-90 flex gap-4 uppercase tracking-tighter">
          <span className="flex items-center gap-1"><Timer className="h-4 w-4" /> {elapsedTime}s</span>
          <span>{currentIndex + 1}/{TOTAL_QUESTIONS}</span>
        </div>

        <Card className="matrix-card">
          <CardHeader>
            <CardTitle className={`text-4xl font-bold text-center transition-colors duration-500 ${isCorrect === true ? 'text-green-400' : isCorrect === false ? 'text-pink-400' : 'text-green-500'}`}>
              {isCorrect === true ? 'CORRETO' : isCorrect === false ? 'INCORRETO' : 'PROCESSANDO...'}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-8 pb-8">
            <div className="text-center">
              <motion.p 
                key={currentIndex}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-6xl sm:text-8xl font-mono font-bold bg-green-500/5 p-8 border-l-8 border-green-500 inline-block"
              >
                {current.num1} <span className="text-green-600">×</span> {current.num2}
              </motion.p>
            </div>

            <div className="flex flex-col items-center gap-6">
              <Input
                type="number"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !showFeedback && handleSubmit()}
                placeholder="_?"
                className="matrix-input text-5xl h-24 text-center"
                autoFocus
                disabled={showFeedback}
              />

              <AnimatePresence>
                {showFeedback && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`w-full p-4 text-center rounded-none border ${isCorrect ? 'bg-green-500/10 border-green-500' : 'bg-pink-500/10 border-pink-500/50 text-pink-400'}`}
                  >
                    {!isCorrect && <p className="text-xl font-bold">{current.num1} × {current.num2} = {current.answer}</p>}
                    <p className="text-sm opacity-70 uppercase mt-1">{isCorrect ? 'Excelente processamento' : 'Erro de sistema detectado'}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            {!showFeedback ? (
              <Button onClick={handleSubmit} className="w-full matrix-button py-8 text-2xl" disabled={!userAnswer}>
                VERIFICAR
              </Button>
            ) : (
              <Button onClick={handleNext} className="w-full matrix-button py-8 text-2xl bg-green-500/20">
                PRÓXIMO {currentIndex + 1 < TOTAL_QUESTIONS ? '>>' : 'FINALIZAR'}
              </Button>
            )}
            <Button onClick={() => setSelectedTable(null)} variant="ghost" className="w-full py-4 text-sm opacity-40 hover:opacity-100 uppercase font-bold tracking-widest border-green-500/10 border">CANCELAR</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default TabuadaChallenge;
