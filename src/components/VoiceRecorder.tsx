import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SpeechToTextService } from '../services/speechToText';

interface VoiceRecorderProps {
  onRecordingComplete: (text: string) => void;
  config: {
    subscriptionKey: string;
    region: string;
  };
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onRecordingComplete, config }) => {
  const { t } = useTranslation();
  const [isRecording, setIsRecording] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [speechService, setSpeechService] = useState<SpeechToTextService | null>(null);

  useEffect(() => {
    const service = new SpeechToTextService(config);
    setSpeechService(service);

    return () => {
      service.stopRecognition();
    };
  }, [config]);

  const toggleRecording = async () => {
    if (!speechService) return;

    if (isRecording) {
      setIsRecording(false);
      await speechService.stopRecognition();
    } else {
      setIsRecording(true);
      setInterimText('');
      
      speechService.startRecognition(
        (text) => {
          setInterimText(text);
        },
        (text) => {
          if (text.trim() !== '') {
            onRecordingComplete(text);
          }
          setIsRecording(false);
          setInterimText('');
        }
      );
    }
  };

  return (
    <div className="voice-recorder">
      <button 
        className={`record-button ${isRecording ? 'recording' : ''}`}
        onClick={toggleRecording}
      >
        {isRecording ? t('chat.stopResponse') : t('chat.speak')}
      </button>
      
      {isRecording && interimText && (
        <div className="interim-text">
          <p>{interimText}</p>
        </div>
      )}
      
      <style>
        {`
        .voice-recorder {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin: 20px 0;
        }
        
        .record-button {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background-color: #f0f0f0;
          border: none;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .record-button.recording {
          background-color: #ff4c4c;
          color: white;
          animation: pulse 1.5s infinite;
        }
        
        @keyframes pulse {
          0% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(255, 76, 76, 0.7);
          }
          70% {
            transform: scale(1.05);
            box-shadow: 0 0 0 10px rgba(255, 76, 76, 0);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(255, 76, 76, 0);
          }
        }
        
        .interim-text {
          margin-top: 20px;
          padding: 10px 20px;
          background-color: #f9f9f9;
          border-radius: 10px;
          max-width: 80%;
          text-align: center;
        }
        `}
      </style>
    </div>
  );
};

export default VoiceRecorder; 