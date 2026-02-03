import React, { useState, useRef } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { User, Role } from '../types';
import { Lock, Save, Camera, Upload, Eye, EyeOff, User as UserIcon, Briefcase } from 'lucide-react';
import { compressImage } from '../lib/image';
import { useToast } from './Toast';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdatePassword: (oldPass: string, newPass: string) => Promise<boolean>;
  onUpdateAvatar?: (base64: string) => void;
  onUpdateUser?: (data: Partial<User>) => Promise<void>;
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
  onUpdateUser
}) => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'PASSWORD'>('PROFILE');

  // Password State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Visibility States
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Profile Edit State
  const [editName, setEditName] = useState(user.name);
  const [editDepartment, setEditDepartment] = useState(user.department || '');

  const [msg, setMsg] = useState<{type: 'success'|'error', text: string} | null>(null);
  
  // Avatar state
  const [avatarPreview, setAvatarPreview] = useState(user.avatar);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Compress avatar (smaller dimensions needed)
        const result = await compressImage(file, 400, 0.7);
        setAvatarPreview(result);
        if (onUpdateAvatar) {
           onUpdateAvatar(result);
        }
      } catch (error) {
        console.error("Erro ao processar avatar", error);
        toast.error("Erro ao processar imagem.");
      }
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

  const handlePasswordSubmit = async (e: React.FormEvent) => {
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
      setTimeout(() => {
         setMsg(null);
         setActiveTab('PROFILE');
      }, 1500);
    } else {
      setMsg({ type: 'error', text: 'Senha atual incorreta.' });
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setMsg(null);
      if (onUpdateUser) {
          await onUpdateUser({ name: editName, department: editDepartment });
          setMsg({ type: 'success', text: 'Dados atualizados com sucesso.' });
          setTimeout(() => setMsg(null), 2000);
      }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Meu Perfil" size="md">
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
            <h3 className="text-base font-semibold text-gray-900 dark:text-white leading-none mb-1">{user.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{user.email || user.username}</p>
            
            <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-800 uppercase">
                    {ROLE_LABELS[user.role] || user.role}
                </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
           <button
             onClick={() => setActiveTab('PROFILE')}
             className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'PROFILE' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
           >
             Dados Pessoais
           </button>
           <button
             onClick={() => setActiveTab('PASSWORD')}
             className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'PASSWORD' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
           >
             Alterar Senha
           </button>
        </div>

        {/* Profile Form */}
        {activeTab === 'PROFILE' && (
             <form onSubmit={handleProfileSubmit} className="space-y-4 pt-2">
                <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome Completo</label>
                   <div className="relative">
                      <input 
                         type="text" 
                         value={editName}
                         onChange={(e) => setEditName(e.target.value)}
                         className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-blue-500 outline-none"
                      />
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                   </div>
                </div>

                <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cargo / Departamento</label>
                   <div className="relative">
                      <input 
                         type="text" 
                         value={editDepartment}
                         onChange={(e) => setEditDepartment(e.target.value)}
                         className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-blue-500 outline-none"
                         placeholder="Ex: Recursos Humanos"
                      />
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                   </div>
                   <p className="text-xs text-gray-500 mt-1">Este cargo será exibido em seus documentos.</p>
                </div>
                
                {msg && (
                    <div className={`text-sm p-3 rounded-lg flex items-center gap-2 ${msg.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
                        {msg.text}
                    </div>
                )}

                <div className="flex justify-end pt-2">
                   <Button type="submit">
                      <Save size={16} className="mr-2" /> Salvar Dados
                   </Button>
                </div>
             </form>
        )}

        {/* Change Password Form */}
        {activeTab === 'PASSWORD' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4 pt-2">
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
        )}
      </div>
    </Modal>
  );
};