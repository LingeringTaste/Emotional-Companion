import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CharacterSelector from './components/CharacterSelector';
import ChatInterface from './components/ChatInterface';
import LanguageSwitcher from './components/LanguageSwitcher';
import { Character, characters } from './models/Character';

// These configurations would typically be loaded from environment variables
// in a production application
const CONFIG = {
  languageModel: {
    endpoint: process.env.REACT_APP_AZURE_OPENAI_ENDPOINT || 'YOUR_AZURE_OPENAI_ENDPOINT',
    apiKey: process.env.REACT_APP_AZURE_OPENAI_API_KEY || 'YOUR_AZURE_OPENAI_API_KEY',
    deploymentName: process.env.REACT_APP_GPT4O_DEPLOYMENT_NAME || 'YOUR_GPT4O_DEPLOYMENT_NAME'
  },
  speechToText: {
    subscriptionKey: process.env.REACT_APP_AZURE_SPEECH_KEY || 'YOUR_AZURE_SPEECH_KEY',
    region: process.env.REACT_APP_AZURE_SPEECH_REGION || 'YOUR_AZURE_SPEECH_REGION'
  },
  textToSpeech: {
    subscriptionKey: process.env.REACT_APP_AZURE_SPEECH_KEY || 'YOUR_AZURE_SPEECH_KEY',
    region: process.env.REACT_APP_AZURE_SPEECH_REGION || 'YOUR_AZURE_SPEECH_REGION'
  }
};

const App: React.FC = () => {
  const { t } = useTranslation();
  const [selectedCharacter, setSelectedCharacter] = useState<Character>(characters[0]);

  const handleCharacterSelect = (character: Character) => {
    setSelectedCharacter(character);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>{t('app.title')}</h1>
        <p>{t('app.subtitle')}</p>
        <div className="language-container">
          <LanguageSwitcher />
        </div>
      </header>

      <main className="app-main">
        <CharacterSelector
          selectedCharacterId={selectedCharacter.id}
          onCharacterSelect={handleCharacterSelect}
        />
        
        <ChatInterface
          selectedCharacter={selectedCharacter}
          languageModelConfig={CONFIG.languageModel}
          speechToTextConfig={CONFIG.speechToText}
          textToSpeechConfig={CONFIG.textToSpeech}
        />
      </main>

      <footer className="app-footer">
        <p>{t('footer.poweredBy')}</p>
      </footer>

      <style>
        {`
        .app {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .app-header {
          text-align: center;
          margin-bottom: 40px;
        }
        
        .app-header h1 {
          font-size: 2.5rem;
          color: #333;
          margin-bottom: 10px;
        }
        
        .app-header p {
          font-size: 1.2rem;
          color: #666;
        }
        
        .language-container {
          display: flex;
          justify-content: center;
          margin-top: 20px;
        }
        
        .app-main {
          margin-bottom: 40px;
        }
        
        .app-footer {
          text-align: center;
          padding: 20px 0;
          color: #999;
          font-size: 0.9rem;
          border-top: 1px solid #eee;
        }
        `}
      </style>
    </div>
  );
};

export default App; 