import React, { useState } from 'react';
import './styles.css';

declare global {
  interface Window {
    sendDataToGameLab?: (data: any) => void;
  }
}

export default function App() {
  const [targetNumber, setTargetNumber] = useState(() => Math.floor(Math.random() * 100) + 1);
  const [guess, setGuess] = useState('');
  const [feedback, setFeedback] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameOver) return;
    const numGuess = Number(guess);
    if (!numGuess || numGuess < 1 || numGuess > 100) {
      setFeedback('Please enter a number between 1 and 100.');
      return;
    }
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    let newFeedback = '';
    if (numGuess < targetNumber) {
      newFeedback = 'Too low!';
    } else if (numGuess > targetNumber) {
      newFeedback = 'Too high!';
    } else {
      newFeedback = `Correct! You guessed it in ${newAttempts} attempts.`;
      setGameOver(true);
    }
    setFeedback(newFeedback);

    if (typeof window.sendDataToGameLab === 'function') {
      window.sendDataToGameLab({
        event: 'guess',
        guess: numGuess,
        feedback: newFeedback,
        attempts: newAttempts,
        timestamp: new Date().toISOString()
      });
      if (newFeedback.startsWith('Correct')) {
        window.sendDataToGameLab({
          event: 'game_over',
          target: targetNumber,
          attempts: newAttempts,
          timestamp: new Date().toISOString()
        });
      }
    }

    setGuess('');
  };

  const handleReset = () => {
    const newTarget = Math.floor(Math.random() * 100) + 1;
    setTargetNumber(newTarget);
    setGuess('');
    setFeedback('');
    setAttempts(0);
    setGameOver(false);

    if (typeof window.sendDataToGameLab === 'function') {
      window.sendDataToGameLab({
        event: 'reset',
        newTarget,
        timestamp: new Date().toISOString()
      });
    }
  };

  return (
    <div className="App">
      <h1>Number Guessing Game</h1>
      <p>I'm thinking of a number between 1 and 100.</p>
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          min="1"
          max="100"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          disabled={gameOver}
        />
        <button type="submit" disabled={gameOver}>
          Guess
        </button>
      </form>
      {feedback && <p className="feedback">{feedback}</p>}
      <p>Attempts: {attempts}</p>
      {gameOver && (
        <button className="reset-button" onClick={handleReset}>
          Play Again
        </button>
      )}
    </div>
  );
}