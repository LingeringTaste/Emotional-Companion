import i18next from 'i18next';

interface TextToSpeechConfig {
  subscriptionKey: string;
  region: string;
}

// Map of i18next language codes to voice IDs by gender
const voiceMap: Record<string, Record<string, string>> = {
  'en': {
    'male': 'en-US-GuyNeural',
    'female': 'en-US-JennyNeural',
    'child': 'en-US-JasonNeural'
  },
  'zh': {
    'male': 'zh-CN-YunxiNeural',
    'female': 'zh-CN-XiaoxiaoNeural',
    'child': 'zh-CN-YunxiNeural'
  },
  'es': {
    'male': 'es-ES-AlvaroNeural',
    'female': 'es-ES-ElviraNeural',
    'child': 'es-ES-AlvaroNeural'
  }
};

export class TextToSpeechService {
  private config: TextToSpeechConfig;
  private player: HTMLAudioElement | null = null;

  constructor(config: TextToSpeechConfig) {
    this.config = config;
    this.player = new Audio();
  }

  public async synthesizeSpeech(text: string, voiceId: string): Promise<string> {
    try {
      // Determine the appropriate voice for the current language
      const currentLanguage = i18next.language || 'en';
      let finalVoiceId = voiceId;
      
      // If the current language doesn't match the voice ID language prefix, 
      // use an appropriate voice for the current language
      if (!voiceId.startsWith(currentLanguage)) {
        // Extract gender hint from original voice ID
        let gender = 'male';
        if (voiceId.includes('Jenny') || voiceId.includes('Elvira') || voiceId.includes('Xiaoxiao')) {
          gender = 'female';
        } else if (voiceId.includes('Jason')) {
          gender = 'child';
        }
        
        // Select voice based on current language and gender
        finalVoiceId = voiceMap[currentLanguage]?.[gender] || voiceId;
      }
      
      const response = await fetch(`https://${this.config.region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': this.config.subscriptionKey,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3'
        },
        body: this.createSSML(text, finalVoiceId)
      });

      if (!response.ok) {
        throw new Error(`Text-to-speech request failed with status: ${response.status}`);
      }

      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error synthesizing speech:', error);
      throw error;
    }
  }

  private createSSML(text: string, voiceId: string): string {
    // Determine the xml:lang attribute based on voiceId
    let langCode = 'en-US';
    if (voiceId.startsWith('zh-')) {
      langCode = 'zh-CN';
    } else if (voiceId.startsWith('es-')) {
      langCode = 'es-ES';
    }
    
    return `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="${langCode}">
        <voice name="${voiceId}">
          <mstts:express-as style="chat">
            ${this.escapeXML(text)}
          </mstts:express-as>
        </voice>
      </speak>
    `;
  }

  private escapeXML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  public playAudio(audioUrl: string): void {
    if (this.player) {
      this.player.pause();
      this.player.src = audioUrl;
      this.player.play();
    }
  }

  public stopAudio(): void {
    if (this.player) {
      this.player.pause();
      this.player.currentTime = 0;
    }
  }
} 