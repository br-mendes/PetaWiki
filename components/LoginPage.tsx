
import React, { useState } from 'react';
import { BookOpen, Shield, Users, Search, Lock, Mail, ArrowLeft, Send, Check, AlertCircle, User as UserIcon, Eye, EyeOff } from 'lucide-react';
import { Button } from './Button';
import { SystemSettings } from '../types';
import { sendPasswordResetEmail } from '../lib/email';
import { Modal } from './Modal';

interface LoginPageProps {
  onLogin: (username: string, password: string) => void;
  onSignUp: (name: string, email: string, password: string) => Promise<boolean>;
  settings: SystemSettings;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onSignUp, settings }) => {
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  
  // Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // New state for password visibility
  
  // Sign Up State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Forgot Password State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetMessage, setResetMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

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
    setError('');
    setIsLoading(true);

    if (isSignUpMode) {
      // Validate Sign Up
      if (newPassword !== confirmPassword) {
        setError('As senhas não coincidem.');
        setIsLoading(false);
        return;
      }
      
      if (passwordStrength < 3) {
        setError('A senha é muito fraca. Use letras maiúsculas, números e símbolos.');
        setIsLoading(false);
        return;
      }

      const success = await onSignUp(newName, newEmail, newPassword);
      if (success) {
         // Auto login logic handled by parent or ask user to login
         setIsSignUpMode(false);
         // Reset form
         setNewName('');
         setNewEmail('');
         setNewPassword('');
         setConfirmPassword('');
      }
    } else {
      // Login
      if (username && password) {
         onLogin(username, password); 
      } else {
        setError('Por favor, insira usuário e senha');
      }
    }
    setIsLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;

    setIsSendingReset(true);
    setResetMessage(null);

    const result = await sendPasswordResetEmail(resetEmail, settings);

    setIsSendingReset(false);
    
    if (result.success) {
        setResetMessage({ type: 'success', text: 'Se este e-mail estiver cadastrado, você receberá um link de redefinição.' });
        setTimeout(() => {
            setShowForgotModal(false);
            setResetMessage(null);
            setResetEmail('');
        }, 3000);
    } else {
        setResetMessage({ type: 'error', text: 'Erro ao enviar e-mail. Tente novamente.' });
    }
  };

  // Prefer Collapsed logo for Login page splash as requested
  const displayLogo = settings.logoCollapsedUrl || settings.logoExpandedUrl;

  // Use customized texts specific for LANDING PAGE, falling back to defaults
  const displayTitle = settings.landingTitle || settings.appName || 'Peta Wiki';
  const displayDescription = settings.landingDescription || 'O hub central para o conhecimento corporativo. Organize, compartilhe e colabore na documentação com segurança baseada em funções.';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-16 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-6 mb-6">
              {/* Logo aumentado para h-24 (mobile) e h-32 (desktop) para alinhar com texto de 2 linhas */}
              <img src={displayLogo} alt="Logo" className="h-24 w-24 md:h-32 md:w-32 bg-white rounded-xl p-3 object-contain shrink-0 shadow-lg" />
              {/* Regra 1 & 2: Ocupar até 2 linhas, alinhado ao centro (flex items-center no pai) */}
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight line-clamp-2 overflow-hidden text-ellipsis leading-tight">
                {displayTitle}
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-2xl whitespace-pre-line">
              {displayDescription}
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm font-medium text-blue-200">
               <span className="flex items-center gap-1"><Shield size={16}/> Segurança Empresarial</span>
               <span className="flex items-center gap-1"><Users size={16}/> Colaboração em Equipe</span>
               <span className="flex items-center gap-1"><Search size={16}/> Busca Inteligente</span>
            </div>
          </div>

          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-gray-800 dark:text-gray-200">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
              {isSignUpMode ? 'Criar Conta' : 'Faça login ou cadastre-se'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {isSignUpMode ? (
                /* SIGN UP FORM */
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome Completo</label>
                    <div className="relative">
                       <input 
                        type="text" 
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="João Silva"
                        required
                      />
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail Corporativo</label>
                    <div className="relative">
                      <input 
                        type="email" 
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="voce@empresa.com.br"
                        required
                      />
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Senha</label>
                    <div className="relative">
                      <input 
                        type="password" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="••••••••"
                        required
                      />
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    </div>
                    {/* Password Strength Meter */}
                    {newPassword && (
                        <div className="mt-2 flex gap-1 h-1">
                            {[1, 2, 3, 4, 5].map(step => (
                                <div 
                                    key={step} 
                                    className={`flex-1 rounded-full ${passwordStrength >= step 
                                        ? (passwordStrength < 3 ? 'bg-red-500' : passwordStrength < 4 ? 'bg-yellow-500' : 'bg-green-500') 
                                        : 'bg-gray-200 dark:bg-gray-600'}`} 
                                />
                            ))}
                        </div>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Mínimo 8 caracteres, números e símbolos.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmar Senha</label>
                    <div className="relative">
                      <input 
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="••••••••"
                        required
                      />
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    </div>
                  </div>
                </>
              ) : (
                /* LOGIN FORM */
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail</label>
                    <div className="relative">
                       <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        // Regra 3: Alteração do Placeholder
                        placeholder="seunome@empresa.com.br"
                      />
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Senha</label>
                    </div>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="••••••••"
                      />
                      {/* Left Icon (Lock) */}
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      
                      {/* Right Icon (Toggle Show) */}
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      >
                         {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    
                    <div className="text-right mt-1.5">
                        <button 
                            type="button" 
                            onClick={() => setShowForgotModal(true)}
                            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                            Esqueceu a senha?
                        </button>
                    </div>
                  </div>
                </>
              )}

              {error && <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded flex items-center gap-2"><AlertCircle size={16} /> {error}</div>}
              
              <div className="pt-2">
                <Button className="w-full py-3 text-lg" type="submit" disabled={isLoading}>
                  {isLoading ? 'Processando...' : (isSignUpMode ? 'Cadastrar' : 'Entrar')}
                </Button>
              </div>

              <div className="text-center pt-2">
                  <button 
                    type="button"
                    onClick={() => { setIsSignUpMode(!isSignUpMode); setError(''); }}
                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  >
                      {isSignUpMode 
                        ? 'Já tem uma conta? Fazer Login' 
                        : 'Não tem uma conta? Cadastre-se'}
                  </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="max-w-6xl mx-auto py-16 px-6 grid md:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
            <BookOpen size={24} />
          </div>
          <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Conhecimento Estruturado</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Organize documentos em categorias hierárquicas com profundidade de aninhamento ilimitada.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4">
            <Shield size={24} />
          </div>
          <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Acesso Baseado em Funções</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Permissões estritas para Admins, Editores e Leitores garantem integridade e segurança dos dados.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center text-green-600 dark:text-green-400 mb-4">
            <Users size={24} />
          </div>
          <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Ferramentas Colaborativas</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Tradução integrada, sugestões de IA e ferramentas de exportação para capacitar sua força de trabalho.
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal 
        isOpen={showForgotModal} 
        onClose={() => setShowForgotModal(false)} 
        title="Recuperação de Senha"
        size="sm"
      >
        <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
                Digite seu e-mail abaixo para receber um link de redefinição de senha.
            </p>
            <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="relative">
                    <input 
                        type="email" 
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="seu@email.com"
                        required
                    />
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                </div>

                {resetMessage && (
                    <div className={`text-sm p-3 rounded ${resetMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {resetMessage.text}
                    </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="ghost" type="button" onClick={() => setShowForgotModal(false)}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={isSendingReset || !resetEmail}>
                        {isSendingReset ? 'Enviando...' : <span className="flex items-center gap-2"><Send size={14} /> Enviar Link</span>}
                    </Button>
                </div>
            </form>
        </div>
      </Modal>
    </div>
  );
};
