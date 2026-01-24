import React, { useState } from 'react';
import { BookOpen, Shield, Users, Search, Lock, Mail, ArrowLeft, Send } from 'lucide-react';
import { Button } from './Button';
import { SystemSettings } from '../types';
import { sendPasswordResetEmail } from '../lib/email';
import { Modal } from './Modal';

interface LoginPageProps {
  onLogin: (username: string) => void;
  settings: SystemSettings;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, settings }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Forgot Password State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetMessage, setResetMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') {
      onLogin(username);
    } else if (username && password) {
       // Allow other mock users to login if they exist in the mock list in App.tsx
       onLogin(username); 
    } else {
      setError('Por favor, insira usuário e senha');
    }
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-20 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-4 mb-6">
              <img src={displayLogo} alt="Logo" className="h-16 w-16 bg-white rounded-xl p-2 object-contain" />
              {/* Only show text name if it exists, matching sidebar logic slightly but adapting for Hero Layout */}
              {settings.appName && <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">{settings.appName}</h1>}
            </div>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-2xl">
              O hub central para o conhecimento corporativo. Organize, compartilhe e colabore na documentação com segurança baseada em funções.
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm font-medium text-blue-200">
               <span className="flex items-center gap-1"><Shield size={16}/> Segurança Empresarial</span>
               <span className="flex items-center gap-1"><Users size={16}/> Colaboração em Equipe</span>
               <span className="flex items-center gap-1"><Search size={16}/> Busca Inteligente</span>
            </div>
          </div>

          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-gray-800 dark:text-gray-200">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">Login do Sistema</h2>
            
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Usuário / Email</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="ex: admin"
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Senha</label>
                    <button 
                        type="button" 
                        onClick={() => setShowForgotModal(true)}
                        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                        Esqueceu a senha?
                    </button>
                </div>
                <div className="relative">
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="••••••••"
                  />
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                </div>
              </div>

              {error && <div className="text-red-500 text-sm">{error}</div>}
              
              <div className="pt-2">
                <Button className="w-full py-3 text-lg" type="submit">
                  Entrar
                </Button>
              </div>

              <div className="text-center text-xs text-gray-400 mt-4">
                <p>Credenciais de Demonstração:</p>
                <p>Admin: <strong>admin / admin</strong></p>
                <p>Editor: <strong>sarah / 123</strong></p>
                <p>Leitor: <strong>bob / 123</strong></p>
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