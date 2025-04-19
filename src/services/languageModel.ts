import i18next from 'i18next';

interface LanguageModelConfig {
  endpoint: string;
  apiKey: string;
  deploymentName: string;
}

export class LanguageModelService {
  private config: LanguageModelConfig;

  constructor(config: LanguageModelConfig) {
    this.config = config;
  }

  public async generateResponse(prompt: string, userInput: string): Promise<string> {
    try {
      // Get current language
      const currentLanguage = i18next.language || 'en';
      
      // Adjust prompt based on language
      let adjustedPrompt = prompt;
      if (currentLanguage === 'zh') {
        adjustedPrompt += " 请用中文回答.";
      } else if (currentLanguage === 'es') {
        adjustedPrompt += " Por favor, responde en español.";
      }
      
      const response = await fetch(`${this.config.endpoint}/openai/deployments/${this.config.deploymentName}/chat/completions?api-version=2023-05-15`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.config.apiKey
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: adjustedPrompt },
            { role: 'user', content: userInput }
          ],
          max_tokens: 800,
          temperature: 0.7,
          top_p: 0.95,
          stream: false
        })
      });

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating response:', error);
      
      // Error message in the current language
      if (i18next.language === 'zh') {
        return '很抱歉，处理您的请求时遇到了错误。';
      } else if (i18next.language === 'es') {
        return 'Lo siento, he encontrado un error al procesar tu solicitud.';
      }
      return 'I apologize, but I encountered an error processing your request.';
    }
  }

  public async streamingResponse(
    prompt: string, 
    userInput: string, 
    onToken: (token: string) => void
  ): Promise<string> {
    try {
      // Get current language
      const currentLanguage = i18next.language || 'en';
      
      // Adjust prompt based on language
      let adjustedPrompt = prompt;
      if (currentLanguage === 'zh') {
        adjustedPrompt += " 请用中文回答.";
      } else if (currentLanguage === 'es') {
        adjustedPrompt += " Por favor, responde en español.";
      }
      
      const response = await fetch(`${this.config.endpoint}/openai/deployments/${this.config.deploymentName}/chat/completions?api-version=2023-05-15`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.config.apiKey
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: adjustedPrompt },
            { role: 'user', content: userInput }
          ],
          max_tokens: 800,
          temperature: 0.7,
          top_p: 0.95,
          stream: true
        })
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim() !== '' && line.trim() !== 'data: [DONE]');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const jsonStr = line.slice(6);
                const json = JSON.parse(jsonStr);
                if (json.choices && json.choices[0]?.delta?.content) {
                  const token = json.choices[0].delta.content;
                  fullText += token;
                  onToken(token);
                }
              } catch (e) {
                console.error('Error parsing streaming response:', e);
              }
            }
          }
        }
      }

      return fullText;
    } catch (error) {
      console.error('Error in streaming response:', error);
      
      // Error message in the current language
      if (i18next.language === 'zh') {
        return '很抱歉，处理您的请求时遇到了错误。';
      } else if (i18next.language === 'es') {
        return 'Lo siento, he encontrado un error al procesar tu solicitud.';
      }
      return 'I apologize, but I encountered an error processing your request.';
    }
  }
}