import React from 'react';
import { useTranslation } from 'react-i18next';
import { Character, characters } from '../models/Character';

interface CharacterSelectorProps {
  selectedCharacterId: string;
  onCharacterSelect: (character: Character) => void;
}

const CharacterSelector: React.FC<CharacterSelectorProps> = ({ 
  selectedCharacterId, 
  onCharacterSelect 
}) => {
  const { t } = useTranslation();
  
  return (
    <div className="character-selector">
      <h2>{t('character.select')}</h2>
      <div className="character-grid">
        {characters.map((character) => (
          <div 
            key={character.id}
            className={`character-card ${selectedCharacterId === character.id ? 'selected' : ''}`}
            onClick={() => onCharacterSelect(character)}
          >
            <div className="character-image">
              <img src={character.imageUrl} alt={t(`characters.${character.id}.name`)} />
            </div>
            <div className="character-info">
              <h3>{t(`characters.${character.id}.name`)}</h3>
              <p>{t(`characters.${character.id}.description`)}</p>
            </div>
          </div>
        ))}
      </div>
      
      <style>
        {`
        .character-selector {
          margin: 20px 0;
        }
        
        h2 {
          text-align: center;
          margin-bottom: 20px;
        }
        
        .character-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 20px;
        }
        
        .character-card {
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .character-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }
        
        .character-card.selected {
          border: 3px solid #4c84ff;
        }
        
        .character-image {
          height: 150px;
          overflow: hidden;
        }
        
        .character-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .character-info {
          padding: 15px;
        }
        
        .character-info h3 {
          margin: 0 0 10px 0;
        }
        
        .character-info p {
          margin: 0;
          font-size: 14px;
          color: #666;
        }
        `}
      </style>
    </div>
  );
};

export default CharacterSelector; 