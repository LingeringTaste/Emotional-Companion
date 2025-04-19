import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';
import i18next from 'i18next';

interface SpeechToTextConfig {
  subscriptionKey: string;
  region: string;
}

// Map of i18next language codes to speech recognition language codes
const languageMap: Record<string, string> = {
  'en': 'en-US',
  'zh': 'zh-CN',
  'es': 'es-ES'
};

export class SpeechToTextService {
  private recognizer: SpeechSDK.SpeechRecognizer | null = null;
  private config: SpeechToTextConfig;

  constructor(config: SpeechToTextConfig) {
    this.config = config;
  }

  public startRecognition(onInterimResult: (text: string) => void, onFinalResult: (text: string) => void): void {
    const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(this.config.subscriptionKey, this.config.region);
    
    // Set the speech recognition language based on the current UI language
    const currentLanguage = i18next.language || 'en';
    speechConfig.speechRecognitionLanguage = languageMap[currentLanguage] || 'en-US';

    const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
    this.recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

    this.recognizer.recognizing = (_, event) => {
      onInterimResult(event.result.text);
    };

    this.recognizer.recognized = (_, event) => {
      if (event.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
        onFinalResult(event.result.text);
      }
    };

    this.recognizer.startContinuousRecognitionAsync();
  }

  public stopRecognition(): Promise<void> {
    return new Promise((resolve) => {
      if (this.recognizer) {
        this.recognizer.stopContinuousRecognitionAsync(
          () => {
            this.recognizer?.close();
            this.recognizer = null;
            resolve();
          },
          (error) => {
            console.error('Error stopping recognition:', error);
            this.recognizer = null;
            resolve();
          }
        );
      } else {
        resolve();
      }
    });
  }
} 