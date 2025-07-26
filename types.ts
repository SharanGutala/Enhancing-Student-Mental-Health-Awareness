
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

export enum GameMode {
  CHAT = 'CHAT',
  GAME = 'GAME',
}

export enum Player {
  X = 'X',
  O = 'O',
}

export type SquareValue = Player | null;
