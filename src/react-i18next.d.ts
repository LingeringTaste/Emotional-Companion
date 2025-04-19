import 'react-i18next';

// Extend the module to include missing exports
declare module 'react-i18next' {
  export const initReactI18next: any;
  export function useTranslation(ns?: string | string[], options?: any): {
    t: (key: string, options?: any) => string;
    i18n: any;
    ready: boolean;
  };
  
  interface Resources {
    translation: typeof import('../public/locales/en/translation.json');
  }
}
