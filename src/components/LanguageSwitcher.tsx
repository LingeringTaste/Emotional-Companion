import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="language-switcher">
      <button 
        className={i18n.language === 'en' ? 'active' : ''} 
        onClick={() => changeLanguage('en')}
      >
        English
      </button>
      <button 
        className={i18n.language === 'zh' ? 'active' : ''} 
        onClick={() => changeLanguage('zh')}
      >
        中文
      </button>
      <button 
        className={i18n.language === 'es' ? 'active' : ''} 
        onClick={() => changeLanguage('es')}
      >
        Español
      </button>

      <style>
        {`
        .language-switcher {
          display: flex;
          gap: 10px;
          margin-bottom: 10px;
        }
        
        .language-switcher button {
          padding: 5px 10px;
          background-color: #f0f0f0;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }
        
        .language-switcher button.active {
          background-color: #4c84ff;
          color: white;
          border-color: #4c84ff;
        }
        
        .language-switcher button:hover:not(.active) {
          background-color: #e0e0e0;
        }
        `}
      </style>
    </div>
  );
};

export default LanguageSwitcher; 