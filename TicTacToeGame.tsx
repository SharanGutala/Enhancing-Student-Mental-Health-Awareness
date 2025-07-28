import React, { useState, useCallback, useEffect } from 'react';
import { SquareValue, Player } from '../types';
import { MessageSquare } from './IconComponents';


declare const confetti: any;

const calculateWinner = (squares: SquareValue[]): SquareValue => {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6],           // diagonals
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
};

const findBestMove = (currentBoard: SquareValue[]): number => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];

    const getWinningMove = (player: Player): number | null => {
        for (const line of lines) {
            const [a, b, c] = line;
            const lineValues = [currentBoard[a], currentBoard[b], currentBoard[c]];
            if (lineValues.filter(v => v === player).length === 2 && lineValues.includes(null)) {
                if (currentBoard[a] === null) return a;
                if (currentBoard[b] === null) return b;
                if (currentBoard[c] === null) return c;
            }
        }
        return null;
    };

    let move = getWinningMove(Player.O);
    if (move !== null) return move;

    move = getWinningMove(Player.X);
    if (move !== null) return move;

    if (currentBoard[4] === null) return 4;

    const corners = [0, 2, 6, 8].filter(i => currentBoard[i] === null);
    if (corners.length > 0) {
        return corners[Math.floor(Math.random() * corners.length)];
    }

    const sides = [1, 3, 5, 7].filter(i => currentBoard[i] === null);
    if (sides.length > 0) {
        return sides[Math.floor(Math.random() * sides.length)];
    }
    
    const available = currentBoard.map((val, idx) => val === null ? idx : null).filter(v => v !== null) as number[];
    return available.length > 0 ? available[0] : -1;
};


const Square = ({ value, onClick, disabled }: { value: SquareValue; onClick: () => void; disabled: boolean }): React.ReactNode => (
  <button
    className="w-20 h-20 md:w-24 md:h-24 bg-white border-2 border-black shadow-hard flex items-center justify-center text-5xl font-bold transition-all duration-75 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 active:shadow-none active:translate-y-px active:translate-x-px"
    onClick={onClick}
    disabled={disabled}
    aria-label={`Square ${value || 'empty'}`}
  >
    {value === Player.X && <span className="text-black">{Player.X}</span>}
    {value === Player.O && <span className="text-brand-accent">{Player.O}</span>}
  </button>
);

interface TicTacToeGameProps {
  onSwitchToChat: () => void;
}

const TicTacToeGame = ({ onSwitchToChat }: TicTacToeGameProps): React.ReactNode => {
  const [board, setBoard] = useState<SquareValue[]>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(true);
  const [isBotThinking, setIsBotThinking] = useState<boolean>(false);

  const winner = calculateWinner(board);
  const isDraw = !winner && board.every(Boolean);
  const isGameOver = !!winner || isDraw;

  useEffect(() => {
    if (!isPlayerTurn && !isGameOver) {
      setIsBotThinking(true);
      const botMoveTimeout = setTimeout(() => {
        const newBoard = board.slice();
        const bestMove = findBestMove(newBoard);
        if (bestMove !== -1) {
          newBoard[bestMove] = Player.O;
          setBoard(newBoard);
        }
        setIsPlayerTurn(true);
        setIsBotThinking(false);
      }, 1200);

      return () => clearTimeout(botMoveTimeout);
    }
  }, [isPlayerTurn, isGameOver, board]);

  // Effect for confetti celebration
  useEffect(() => {
    if (winner === Player.X) {
      const duration = 2 * 1000;
      const end = Date.now() + duration;
      const colors = ['#ef4444', '#ffffff'];

      (function frame() {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors,
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    }
  }, [winner]);


  const handlePlayerMove = useCallback((i: number) => {
    if (!isPlayerTurn || board[i] || isGameOver) return;
    
    const newBoard = board.slice();
    newBoard[i] = Player.X;
    setBoard(newBoard);
    setIsPlayerTurn(false);
  }, [isPlayerTurn, board, isGameOver]);

  const handleRestart = useCallback(() => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setIsBotThinking(false);
  }, []);

  let status;
  if (isBotThinking) {
    status = <span className="animate-pulse">KRISH is thinking...</span>;
  } else if (winner === Player.X) {
    status = "You won! Congratulations!";
  } else if (winner === Player.O) {
    status = "KRISH won. Better luck next time!";
  } else if (isDraw) {
    status = "It's a Draw!";
  } else {
    status = <>Your turn (<span className="text-black font-semibold">X</span>)</>;
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 bg-gray-50 text-black">
      <h2 className="text-3xl font-bold mb-4 uppercase">Play Tic-Tac-Toe</h2>
      <div className="text-xl mb-8 h-8 font-medium text-gray-700">{status}</div>
      <div className="grid grid-cols-3 gap-4 mb-8">
        {board.map((squareValue, i) => (
          <Square 
            key={i} 
            value={squareValue} 
            onClick={() => handlePlayerMove(i)} 
            disabled={!isPlayerTurn || isGameOver || !!squareValue}
          />
        ))}
      </div>
      <div className="flex gap-4">
        <button
          onClick={handleRestart}
          className="px-8 py-3 bg-brand-accent text-black font-semibold border-2 border-black shadow-hard transition-all hover:bg-red-400 active:shadow-none active:translate-y-px active:translate-x-px"
        >
          Restart Game
        </button>
        <button
          onClick={onSwitchToChat}
          className="px-8 py-3 flex items-center gap-2 bg-white text-black font-semibold border-2 border-black shadow-hard transition-all hover:bg-gray-100 active:shadow-none active:translate-y-px active:translate-x-px"
        >
          <MessageSquare /> Back to Chat
        </button>
      </div>
    </div>
  );
};

export default TicTacToeGame;