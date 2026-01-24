import React, { useState, useRef } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { User } from '../types';
import { Lock, Save, Camera, Upload } from 'lucide-react';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdatePassword: (oldPass: string, newPass: string) => Promise<boolean>;
  onUpdateAvatar?: (base64: string) => void; // New optional prop
}

export const UserProfile: React.FC<UserProfileProps> = ({ 
  isOpen, 
  onClose, 
  user,
  onUpdatePassword,
  onUpdateAvatar
}) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState<{type: 'success'|'error', text: string} | null>(null);
  
  // Avatar state
  const [avatarPreview, setAvatarPreview] = useState(user.avatar);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarPreview(result);
        if (onUpdateAvatar) {
           onUpdateAvatar(result); // In a real app, you might wait for save click, but sync here for simplicity
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    if (newPassword !== confirmPassword) {
      setMsg({ type: 'error', text: 'A nova senha e a confirmação não coincidem.' });
      return;
    }

    if (newPassword.length < 3) {
      setMsg({ type: 'error', text: 'A senha deve ter pelo menos 3 caracteres.' });
      return;
    }

    const success = await onUpdatePassword(oldPassword, newPassword);
    
    if (success) {
      setMsg({ type: 'success', text: 'Senha alterada com sucesso!' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(onClose, 1500);
    } else {
      setMsg({ type: 'error', text: 'Senha atual incorreta.' });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Perfil do Usuário" size="md">
      <div className="space-y-6">
        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="relative group">
            <img 
              src={avatarPreview} 
              alt={user.name} 
              className="w-16 h-16 rounded-full border-2 border-white dark:border-gray-600 shadow-sm object-cover" 
            />
            {onUpdateAvatar && (
              <div 
                className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="text-white w-6 h-6" />
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{user.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user.email || user.username}</p>
            <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              {user.department} • {user.role}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <Lock size={16} /> Alterar Senha
          </h4>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Senha Atual</label>
              <input 
                type="password" 
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-blue-500 outline-none"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nova Senha</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmar Nova Senha</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-blue-500 outline-none"
                  required
                />
              </div>
            </div>

            {msg && (
              <div className={`text-sm p-2 rounded ${msg.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
                {msg.text}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button type="submit">
                <Save size={16} className="mr-2" /> Salvar Senha
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
};