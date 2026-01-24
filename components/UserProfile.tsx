
import React, { useState, useRef } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { User, Role } from '../types';
import { Lock, Save, Camera, Upload, Eye, EyeOff } from 'lucide-react';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdatePassword: (oldPass: string, newPass: string) => Promise<boolean>;
  onUpdateAvatar?: (base64: string) => void;
  onUpdateRole?: (newRole: Role) => void;
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  EDITOR: 'Editor',
  READER: 'Leitor'
};

export const UserProfile: React.FC<UserProfileProps> = ({ 
  isOpen, 
  onClose, 
  user,
  onUpdatePassword,
  onUpdateAvatar,
  onUpdateRole
}) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Visibility States
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
           onUpdateAvatar(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const calculatePasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length > 7) score++;
    if (pass.length > 10) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score; // 0 to 5
  };

  const passwordStrength = calculatePasswordStrength(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    if (newPassword !== confirmPassword) {
      setMsg({ type: 'error', text: 'A nova senha e a confirmação não coincidem.' });
      return;
    }

    if (passwordStrength < 3) {
      setMsg({ type: 'error', text: 'A senha é muito fraca. Use letras maiúsculas, números e símbolos.' });
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
        {/* Header Profile */}
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
                title="Alterar Avatar"
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
          
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-none mb-1">{user.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{user.email || user.username}</p>
            
            <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200 border border-gray-200 dark:border-gray-500">
                    {user.department || 'Geral'}
                </span>
                
                {/* Permite que qualquer usuário altere seu cargo para fins de teste/demo, desde que a função seja passada */}
                {onUpdateRole ? (
                    <div className="relative inline-flex">
                        <select 
                            value={user.role} 
                            onChange={(e) => onUpdateRole(e.target.value as Role)}
                            className="appearance-none pl-2.5 pr-6 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-800 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 hover:bg-blue-200 dark:hover:bg-blue-800 uppercase"
                        >
                            <option value="READER">Leitor</option>
                            <option value="EDITOR">Editor</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-blue-800 dark:text-blue-200">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-800 uppercase">
                        {ROLE_LABELS[user.role] || user.role}
                    </span>
                )}
            </div>
          </div>
        </div>

        {/* Change Password Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <Lock size={16} /> Alterar Senha
          </h4>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Senha Atual</label>
              <div className="relative">
                <input 
                    type={showOldPassword ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-blue-500 outline-none transition-shadow"
                    required
                />
                <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
                >
                    {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nova Senha</label>
                <div className="relative">
                    <input 
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-blue-500 outline-none transition-shadow"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
                    >
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>
                {/* Strength Meter */}
                {newPassword && (
                    <div className="mt-2 flex gap-1 h-1">
                        {[1, 2, 3, 4, 5].map(step => (
                            <div 
                                key={step} 
                                className={`flex-1 rounded-full transition-colors duration-300 ${passwordStrength >= step 
                                    ? (passwordStrength < 3 ? 'bg-red-500' : passwordStrength < 4 ? 'bg-yellow-500' : 'bg-green-500') 
                                    : 'bg-gray-200 dark:bg-gray-600'}`} 
                            />
                        ))}
                    </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmar Nova Senha</label>
                <div className="relative">
                    <input 
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-blue-500 outline-none transition-shadow"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
                    >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>
              </div>
            </div>

            {msg && (
              <div className={`text-sm p-3 rounded-lg flex items-center gap-2 ${msg.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
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
