import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { SupportedLanguage } from '../types';
import { LANGUAGES } from '../lib/translate';
import { Globe, Check } from 'lucide-react';

interface TranslationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTranslate: (languages: SupportedLanguage[]) => void;
  isTranslating: boolean;
}

export const TranslationModal: React.FC<TranslationModalProps> = ({ 
  isOpen, 
  onClose, 
  onTranslate,
  isTranslating 
}) => {
  const [selectedLangs, setSelectedLangs] = useState<SupportedLanguage[]>([]);

  const toggleLang = (code: SupportedLanguage) => {
    if (selectedLangs.includes(code)) {
      setSelectedLangs(selectedLangs.filter(l => l !== code));
    } else {
      setSelectedLangs([...selectedLangs, code]);
    }
  };

  const handleRun = () => {
    if (selectedLangs.length > 0) {
      onTranslate(selectedLangs);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Traduzir Documento">
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg flex gap-3">
          <Globe className="text-blue-600 shrink-0" />
          <div>
            <h4 className="font-medium text-blue-900">Tradução Automática (LibreTranslate)</h4>
            <p className="text-sm text-blue-700 mt-1">
              Selecione os idiomas de destino. O sistema irá gerar uma versão localizada preservando a formatação.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => toggleLang(lang.code)}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                selectedLangs.includes(lang.code)
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{lang.flag}</span>
                <span className="font-medium">{lang.name}</span>
              </div>
              {selectedLangs.includes(lang.code) && <Check size={18} />}
            </button>
          ))}
        </div>

        <div className="pt-4 flex justify-end gap-2 border-t border-gray-100 mt-4">
          <Button variant="ghost" onClick={onClose} disabled={isTranslating}>
            Cancelar
          </Button>
          <Button onClick={handleRun} disabled={selectedLangs.length === 0 || isTranslating}>
            {isTranslating ? 'Traduzindo...' : `Traduzir para ${selectedLangs.length} Idioma(s)`}
          </Button>
        </div>
      </div>
    </Modal>
  );
};