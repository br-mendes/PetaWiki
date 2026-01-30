import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ToastProvider, useToast } from './components/Toast';
import { FullPageLoader } from './components/LoadingSpinner';

// Component imports with error boundaries
const LazyLoginPage = React.lazy(() => import('./components/LoginPage').then(module => ({ default: module.LoginPage })));
const LazyHomePage = React.lazy(() => import('./components/HomePage').then(module => ({ default: module.HomePage })));

// Types
interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  department?: string;
  themePreference?: 'light' | 'dark';
  isMock?: boolean;
}

interface SystemSettings {
  appName: string;
  logoCollapsedUrl: string;
  logoExpandedUrl: string;
  layoutMode: 'SIDEBAR' | 'NAVBAR';
  [key: string]: any;
}

const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  appName: 'Peta Wiki',
  logoCollapsedUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="50" fill="%232563eb"/%3E%3Ctext x="50" y="50" dy=".35em" text-anchor="middle" fill="white" font-size="40" font-weight="bold"%3EPW%3C/text%3E%3C/svg%3E',
  logoExpandedUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 90"%3E%3Crect width="160" height="90" fill="%232563eb"/%3E%3Ctext x="50%" y="50%" dy=".35em" text-anchor="middle" fill="white" font-size="24" font-weight="bold"%3EPeta Wiki%3C/text%3E%3C/svg%3E',
  layoutMode: 'SIDEBAR'
};

const MOCK_USERS: User[] = [
  {
    id: 'mock_admin',
    username: 'admin',
    email: 'admin@petawiki.com',
    password: 'admin',
    name: 'Admin',
    role: 'ADMIN',
    avatar: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="50" fill="%23111827"/%3E%3Ctext x="50" y="50" dy=".35em" text-anchor="middle" fill="white" font-size="40" font-weight="bold"%3EA%3C/text%3E%3C/svg%3E',
    department: 'Gestão'
  }
];

const SESSION_KEY = 'peta_wiki_session';
const INACTIVITY_LIMIT = 15 * 60 * 1000;

// Simple AppContent component
const AppContent = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const params = useParams();

  // State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(DEFAULT_SYSTEM_SETTINGS);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<string>('HOME');

  // Session restoration
  useEffect(() => {
    const restoreSession = () => {
      const savedSession = localStorage.getItem(SESSION_KEY);
      if (savedSession) {
        try {
          const { user, lastActive } = JSON.parse(savedSession);
          const now = Date.now();
          if (now - lastActive < INACTIVITY_LIMIT) {
            if (user.isMock) {
              setIsDarkMode((user.themePreference || 'light') === 'dark');
              setCurrentUser(user);
              setIsAuthenticated(true);
              return;
            }
            
            // Mock database user for now
            setCurrentUser(user);
            setIsAuthenticated(true);
            setIsDarkMode((user.themePreference || 'light') === 'dark');
          }
        } catch (error) {
          console.error('Failed to restore session:', error);
        }
      }
      setIsLoading(false);
    };

    restoreSession();
  }, []);

  // Simple handlers
  const handleLogin = (username: string, password: string) => {
    console.log('handleLogin called with:', username);
    
    // Mock authentication
    if (username === 'admin' && password === 'admin') {
      const admin = { ...MOCK_USERS[0], isMock: true, themePreference: 'light' as const };
      setCurrentUser(admin);
      setIsAuthenticated(true);
      setIsDarkMode(false);
      localStorage.setItem(SESSION_KEY, JSON.stringify({ user: admin, lastActive: Date.now() }));
      toast.success(`Bem-vindo, ${admin.name}!`);
    } else {
      toast.error('Usuário ou senha inválidos.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
    setIsAuthenticated(false);
    setCurrentView('HOME');
    toast.success('Logout realizado com sucesso.');
  };

  const handleToggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (currentUser) {
      const updatedUser = { ...currentUser, themePreference: newMode ? 'dark' : 'light' };
      setCurrentUser(updatedUser);
      const sessionData = { user: updatedUser, lastActive: Date.now() };
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    }
  };

  // URL handling
  useEffect(() => {
    const path = window.location.pathname;
    console.log('Processing URL:', path);

    if (path === '/') {
      setCurrentView('HOME');
    } else if (path.startsWith('/notificacoes')) {
      setCurrentView('NOTIFICATIONS');
    } else if (path.startsWith('/admin')) {
      setCurrentView('ADMIN_SETTINGS');
    } else if (path.startsWith('/analytics')) {
      setCurrentView('ANALYTICS');
    } else if (path.startsWith('/revisoes')) {
      setCurrentView('REVIEW_CENTER');
    }
  }, [params]);

  // Loading state
  if (isLoading) {
    return <FullPageLoader text="Inicializando sistema..." />;
  }

  // Authentication
  if (!isAuthenticated || !currentUser) {
    return (
      <React.Suspense fallback={<FullPageLoader text="Carregando..." />}>
        <LazyLoginPage
          onLogin={handleLogin}
          onSignUp={() => {}}
          settings={systemSettings}
        />
      </React.Suspense>
    );
  }

  // Main app view
  return (
    <div className={`flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200`}>
      {/* Header */}
      <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <div 
            onClick={() => setCurrentView('HOME')}
            className="flex items-center gap-3 cursor-pointer"
          >
            <img 
              src={systemSettings.logoCollapsedUrl} 
              alt="Logo" 
              className="w-8 h-8 object-contain rounded" 
            />
            <span className="font-bold text-lg text-blue-900 dark:text-blue-400">
              {systemSettings.appName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleTheme}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            title={isDarkMode ? "Modo Claro" : "Modo Escuro"}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>

          <div className="relative">
            <button
              onClick={() => setCurrentView('NOTIFICATIONS')}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="Notificações"
            >
              🔔
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
          </div>

          <div className="relative">
            <button
              className="flex items-center gap-2 p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="Menu"
            >
              <img 
                src={currentUser.avatar || ''} 
                alt="Avatar" 
                className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-600" 
              />
              <span className="font-medium hidden sm:block">{currentUser.name}</span>
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Sair
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {currentView === 'HOME' && (
          <div className="p-8 max-w-5xl mx-auto">
            <div className="text-center py-16">
              <img
                src={systemSettings.logoCollapsedUrl}
                alt="Logo"
                className="w-24 h-24 mx-auto mb-6 rounded-xl shadow-md p-2 bg-white object-contain"
              />
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
                Bem-vindo ao {systemSettings.appName}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto mb-8">
                Sistema de documentação corporativa funcionando!
              </p>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Status do Sistema</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
                  <div className="text-sm">
                    <span className="text-green-500">✅</span> Carregado
                  </div>
                  <div className="text-sm">
                    <span className="text-green-500">✅</span> Login OK
                  </div>
                  <div className="text-sm">
                    <span className="text-yellow-500">⏳</span> Database
                  </div>
                  <div className="text-sm">
                    <span className="text-yellow-500">⏳</span> Componentes
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'NOTIFICATIONS' && (
          <div className="p-8 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Notificações
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Sistema de notificações em desenvolvimento.
              </p>
            </div>
          </div>
        )}

        {currentView === 'ADMIN_SETTINGS' && (
          <div className="p-8 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Configurações Admin
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Painel administrativo em desenvolvimento.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const App = () => {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppContent />} />
          <Route path="/categoria/:categoryId" element={<AppContent />} />
          <Route path="/documento/:docId" element={<AppContent />} />
          <Route path="/documento/:docId/editar" element={<AppContent />} />
          <Route path="/novo" element={<AppContent />} />
          <Route path="/analytics" element={<AppContent />} />
          <Route path="/admin" element={<AppContent />} />
          <Route path="/notificacoes" element={<AppContent />} />
          <Route path="/revisoes" element={<AppContent />} />
          <Route path="/revisoes/:docId" element={<AppContent />} />
          <Route path="*" element={<AppContent />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
};

export default App;