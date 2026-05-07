import React, { useState } from 'react';
import { motion as fm } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Award } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

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
      <fm.div
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
              <fm.p 
                className="text-4xl sm:text-6xl font-mono font-bold bg-green-500/10 p-6 rounded-none border-l-4 border-green-500 inline-block"
              >
                {problem.expression}
              </fm.p>
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
      </fm.div>
    </div>
  );
};

export default MathChallenge;
