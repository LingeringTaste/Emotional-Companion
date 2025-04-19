export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  audioUrl?: string; // For character responses
}

export interface Conversation {
  id: string;
  characterId: string;
  messages: Message[];
} 