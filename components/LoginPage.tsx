import React, { useState } from 'react';
import { Lock, Mail, AlertCircle } from 'lucide-react';
import { SystemSettings } from '../types';

interface LoginPageProps {
  onLogin: (username: string, password: string) => void;
  onSignUp: (name: string, email: string, password: string) => Promise<boolean>;
  settings: SystemSettings;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, settings }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const displayLogo = settings.logoCollapsedUrl || settings.logoExpandedUrl;
  const displayTitle = settings.appName || 'Peta Wiki';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!username || !password) {
        setError('Por favor, insira usuário e senha');
        setIsLoading(false);
        return;
      }

      onLogin(username, password);
    } catch (error: any) {
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors">
      <div className={`${'bg-gradient-to-r from-blue-700 to-blue-900'} text-white py-16 px-6 transition-colors duration-500`}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-6 mb-6">
              <img 
                src={displayLogo} 
                alt="Logo" 
                className="h-24 w-24 md:h-32 md:w-32 bg-white rounded-xl p-3 object-contain shadow-lg" 
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="50" fill="%232563eb"/%3E%3Ctext x="50" y="50" dy=".35em" text-anchor="middle" fill="white" font-size="40" font-weight="bold"%3EPW%3C/text%3E%3C/svg%3E';
                }}
              />
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight line-clamp-2 overflow-hidden text-ellipsis leading-tight">
                {displayTitle}
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl whitespace-pre-line">
              O hub central para o conhecimento corporativo.
            </p>
          </div>

          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-gray-800 dark:text-gray-200">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
              Faça login
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 dark:bg-red-900/20 dark:border-red-800">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Usuário
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="admin"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Senha
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="admin"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? '👁️' : '👁️‍♂️'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>

            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
              Use: admin / admin
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};