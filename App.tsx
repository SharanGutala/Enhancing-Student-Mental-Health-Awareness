import React, { useState, useCallback } from 'react';
import { GameMode } from './types';
import ChatInterface from './components/ChatInterface';
import TicTacToeGame from './components/TicTacToeGame';
import SettingsMenu from './components/SettingsMenu';
import { BotIcon } from './components/IconComponents';

export type FontSize = 'sm' | 'base' | 'lg';
export type FontFamily = 'mono' | 'sans';

export default function App(): React.ReactNode {
  const [mode, setMode] = useState<GameMode>(GameMode.CHAT);
  const [fontSize, setFontSize] = useState<FontSize>('base');
  const [fontFamily, setFontFamily] = useState<FontFamily>('mono');

  const switchToGame = useCallback(() => setMode(GameMode.GAME), []);
  const switchToChat = useCallback(() => setMode(GameMode.CHAT), []);

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen p-4 font-${fontFamily}`}>
      <div className="w-full max-w-2xl h-[95vh] md:h-[90vh] bg-white flex flex-col border-2 border-black shadow-hard">
        <header className="flex items-center justify-between p-4 border-b-2 border-black">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-accent border-2 border-black text-black">
              <BotIcon />
            </div>
            <div>
              <h1 className="text-xl font-bold uppercase text-black">KRISH</h1>
              <p className="text-sm text-gray-600">Wellness Companion</p>
            </div>
          </div>
          <SettingsMenu
            fontSize={fontSize}
            setFontSize={setFontSize}
            fontFamily={fontFamily}
            setFontFamily={setFontFamily}
          />
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50">
          {mode === GameMode.CHAT ? (
            <ChatInterface onSwitchToGame={switchToGame} fontSize={fontSize} />
          ) : (
            <TicTacToeGame onSwitchToChat={switchToChat} />
          )}
        </main>
      </div>
    </div>
  );
}