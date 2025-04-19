import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Message } from '../models/Conversation';
import { Character } from '../models/Character';
import VoiceRecorder from './VoiceRecorder';
import { LanguageModelService } from '../services/languageModel';
import { TextToSpeechService } from '../services/textToSpeech';

interface ChatInterfaceProps {
  selectedCharacter: Character;
  languageModelConfig: {
    endpoint: string;
    apiKey: string;
    deploymentName: string;
  };
  speechToTextConfig: {
    subscriptionKey: string;
    region: string;
  };
  textToSpeechConfig: {
    subscriptionKey: string;
    region: string;
  };
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  selectedCharacter,
  languageModelConfig,
  speechToTextConfig,
  textToSpeechConfig
}) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isResponding, setIsResponding] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStreamedResponse, setCurrentStreamedResponse] = useState('');
  
  const languageModelService = useRef<LanguageModelService>(
    new LanguageModelService(languageModelConfig)
  );
  
  const textToSpeechService = useRef<TextToSpeechService>(
    new TextToSpeechService(textToSpeechConfig)
  );
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentStreamedResponse]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleUserInput = async (text: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: text,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsResponding(true);
    
    // Start streaming the response
    setIsStreaming(true);
    setCurrentStreamedResponse('');
    
    try {
      // Stream response tokens
      const fullResponse = await languageModelService.current.streamingResponse(
        selectedCharacter.promptTemplates,
        text,
        (token) => {
          setCurrentStreamedResponse(prev => prev + token);
        }
      );
      
      // Process complete response
      const characterMessage: Message = {
        id: Date.now().toString(),
        content: fullResponse,
        isUser: false,
        timestamp: new Date()
      };
      
      // Add character message
      setMessages(prev => [...prev, characterMessage]);
      
      // Convert text to speech
      try {
        const audioUrl = await textToSpeechService.current.synthesizeSpeech(
          fullResponse,
          selectedCharacter.voiceId
        );
        
        // Update message with audio URL
        setMessages(prev => 
          prev.map(msg => 
            msg.id === characterMessage.id 
              ? { ...msg, audioUrl } 
              : msg
          )
        );
        
        // Play the audio
        textToSpeechService.current.playAudio(audioUrl);
      } catch (error) {
        console.error('Error converting text to speech:', error);
      }
    } catch (error) {
      console.error('Error getting response:', error);
    } finally {
      setIsResponding(false);
      setIsStreaming(false);
      setCurrentStreamedResponse('');
    }
  };

  const stopResponse = () => {
    textToSpeechService.current.stopAudio();
    // In a real implementation, we would also need to cancel the LLM streaming
  };

  return (
    <div className="chat-interface">
      <div className="character-header">
        <div className="character-avatar">
          <img src={selectedCharacter.imageUrl} alt={t(`characters.${selectedCharacter.id}.name`)} />
        </div>
        <h2>{t('character.talkingWith', { name: t(`characters.${selectedCharacter.id}.name`) })}</h2>
      </div>
      
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-state">
            <p>{t('chat.startPrompt', { name: t(`characters.${selectedCharacter.id}.name`) })}</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`message ${message.isUser ? 'user-message' : 'character-message'}`}
              >
                <div className="message-content">
                  <p>{message.content}</p>
                  {!message.isUser && message.audioUrl && (
                    <button 
                      className="replay-button"
                      onClick={() => textToSpeechService.current.playAudio(message.audioUrl!)}
                    >
                      🔊
                    </button>
                  )}
                </div>
                <div className="message-timestamp">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
            
            {isStreaming && (
              <div className="message character-message streaming">
                <div className="message-content">
                  <p>{currentStreamedResponse || '...'}</p>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="input-area">
        {isResponding ? (
          <button className="stop-button" onClick={stopResponse}>
            {t('chat.stopResponse')}
          </button>
        ) : (
          <VoiceRecorder 
            onRecordingComplete={handleUserInput} 
            config={speechToTextConfig}
          />
        )}
      </div>
      
      <style>
        {`
        .chat-interface {
          display: flex;
          flex-direction: column;
          height: calc(100vh - 300px);
          min-height: 500px;
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
          background-color: #fff;
        }
        
        .character-header {
          display: flex;
          align-items: center;
          padding: 15px 20px;
          background-color: #f5f5f5;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .character-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          overflow: hidden;
          margin-right: 15px;
        }
        
        .character-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #888;
        }
        
        .message {
          max-width: 80%;
          padding: 12px 15px;
          border-radius: 15px;
          animation: fadeIn 0.3s ease;
        }
        
        .user-message {
          align-self: flex-end;
          background-color: #e1f5fe;
          border-bottom-right-radius: 5px;
        }
        
        .character-message {
          align-self: flex-start;
          background-color: #f5f5f5;
          border-bottom-left-radius: 5px;
        }
        
        .message-content {
          display: flex;
          align-items: center;
        }
        
        .message-content p {
          margin: 0;
          word-break: break-word;
        }
        
        .replay-button {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 18px;
          margin-left: 10px;
          padding: 5px;
          border-radius: 50%;
          transition: background-color 0.2s;
        }
        
        .replay-button:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }
        
        .message-timestamp {
          font-size: 11px;
          color: #999;
          margin-top: 5px;
          text-align: right;
        }
        
        .streaming {
          opacity: 0.8;
        }
        
        .input-area {
          padding: 20px;
          border-top: 1px solid #e0e0e0;
          display: flex;
          justify-content: center;
        }
        
        .stop-button {
          padding: 10px 20px;
          background-color: #ff4c4c;
          color: white;
          border: none;
          border-radius: 20px;
          font-size: 16px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .stop-button:hover {
          background-color: #e63939;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        `}
      </style>
    </div>
  );
};

export default ChatInterface; 