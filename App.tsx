import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ToastProvider, useToast } from './components/Toast';
import { FullPageLoader } from './components/LoadingSpinner';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DocumentView } from './components/DocumentView';
import { DocumentEditor } from './components/DocumentEditor';
import { HomePage } from './components/HomePage';

// Component imports with error boundaries
const LazyLoginPage = React.lazy(() => import('./components/LoginPage').then(module => ({ default: module.LoginPage })));
const LazyTemplateSelector = React.lazy(() => import('./components/TemplateSelector').then(module => ({ default: module.TemplateSelector })));
const LazyReviewCenter = React.lazy(() => import('./components/ReviewCenter').then(module => ({ default: module.ReviewCenter })));
const LazyAnalyticsDashboard = React.lazy(() => import('./components/AnalyticsDashboard').then(module => ({ default: module.AnalyticsDashboard })));
const LazyAdminSettings = React.lazy(() => import('./components/AdminSettings').then(module => ({ default: module.AdminSettings })));
const LazyUserProfile = React.lazy(() => import('./components/UserProfile').then(module => ({ default: module.UserProfile })));
const LazyCategoryModal = React.lazy(() => import('./components/CategoryModal').then(module => ({ default: module.CategoryModal })));

// Mock data
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

const MOCK_CATEGORIES: Category[] = [
  {
    id: 'cat1',
    name: 'Geral',
    parentId: null,
    description: 'Documentos gerais',
    icon: 'folder',
    order: 0
  },
  {
    id: 'cat2',
    name: 'Políticas',
    parentId: null,
    description: 'Políticas da empresa',
    icon: 'shield',
    order: 1
  },
  {
    id: 'cat3',
    name: 'Manuais',
    parentId: 'cat2',
    description: 'Manuais de procedimentos',
    icon: 'book',
    order: 0
  }
];

const MOCK_DOCUMENTS: Document[] = [
  {
    id: 'doc1',
    title: 'Política de Privacidade',
    content: '<h1>Política de Privacidade</h1><p>Esta é a política de privacidade da empresa...</p>',
    categoryId: 'cat2',
    status: 'PUBLISHED',
    authorId: 'mock_admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['política', 'privacidade']
  },
  {
    id: 'doc2',
    title: 'Manual do Colaborador',
    content: '<h1>Manual do Colaborador</h1><p>Bem-vindo à empresa!</p>',
    categoryId: 'cat3',
    status: 'PUBLISHED',
    authorId: 'mock_admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['manual', 'colaborador']
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

  // Data state
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [templates, setTemplates] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  // Favorites
  const [favoriteDocIds, setFavoriteDocIds] = useState<string[]>([]);
  const [docFilter, setDocFilter] = useState<'ALL' | 'FAVORITES'>('ALL');

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
            
            setCurrentUser(user);
            setIsAuthenticated(true);
            setIsDarkMode((user.themePreference || 'light') === 'dark');
          }
        } catch (error) {
          console.error('Failed to restore session:', error);
        }
      }
      
      // Initialize mock data
      setTimeout(() => {
        setCategories(MOCK_CATEGORIES);
        setDocuments(MOCK_DOCUMENTS);
        setActiveCategoryId('cat1');
        setIsLoading(false);
      }, 500);
    };

    restoreSession();
  }, []);

  // Simple handlers
  const handleLogin = (username: string, password: string) => {
    console.log('handleLogin called with:', username);
    
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
  };

  const handleSelectCategory = (category: Category) => {
    setActiveCategoryId(category.id);
    setCurrentView('CATEGORY_VIEW');
  };

  const handleSelectDocument = (document: Document) => {
    setCurrentView('DOCUMENT_VIEW');
  };

  const handleCreateDocument = () => {
    setCurrentView('DOCUMENT_CREATE');
  };

  // URL handling
  useEffect(() => {
    const path = window.location.pathname;
    console.log('Processing URL:', path);

    if (path === '/' || path === '') {
      setCurrentView('HOME');
    } else if (path.startsWith('/categoria/')) {
      const catId = path.split('/')[2];
      if (catId) {
        const cat = categories.find(c => c.id === catId);
        if (cat) {
          setActiveCategoryId(cat.id);
          setCurrentView('CATEGORY_VIEW');
        }
      }
    } else if (path.startsWith('/documento/')) {
      const parts = path.split('/');
      if (parts.length >= 3) {
        const docId = parts[2];
        const action = parts[3];
        const doc = documents.find(d => d.id === docId);
        if (doc) {
          setCurrentView(action === 'editar' ? 'DOCUMENT_EDIT' : 'DOCUMENT_VIEW');
        }
      }
    } else if (path.startsWith('/notificacoes')) {
      setCurrentView('NOTIFICATIONS');
    } else if (path.startsWith('/admin')) {
      setCurrentView('ADMIN_SETTINGS');
    } else if (path.startsWith('/analytics')) {
      setCurrentView('ANALYTICS');
    } else if (path.startsWith('/revisoes')) {
      setCurrentView('REVIEW_CENTER');
    }
  }, [categories, documents]);

  // Helpers
  const categoryTree = useMemo(() => categories, [categories]);
  const visibleDocuments = useMemo(() => documents.filter(d => !d.deletedAt), [documents]);
  const isAdminOrEditor = currentUser?.role === 'ADMIN' || currentUser?.role === 'EDITOR';
  const isNavbarMode = systemSettings.layoutMode === 'NAVBAR';

  // Build category path
  const getCategoryPath = (categoryId: string | null): string => {
    if (!categoryId) return '';
    const category = categories.find(c => c.id === categoryId);
    if (!category) return '';
    const path = [category.name];
    let parent = category.parentId;
    while (parent) {
      const parentCategory = categories.find(c => c.id === parent);
      if (parentCategory) {
        path.unshift(parentCategory.name);
        parent = parentCategory.parentId;
      } else {
        break;
      }
    }
    return path.join(' > ');
  };

  // Update documents with category paths
  const documentsWithPaths = useMemo(() => {
    return visibleDocuments.map(doc => ({
      ...doc,
      categoryPath: getCategoryPath(doc.categoryId)
    }));
  }, [visibleDocuments]);

  const commonProps = {
    categories: categoryTree,
    documents: documentsWithPaths,
    activeCategoryId,
    user: currentUser,
    systemSettings,
    onNavigateHome: () => setCurrentView('HOME'),
    onCreateCategory: () => {},
    onLogout: handleLogout,
    onOpenProfile: () => {},
    toggleTheme: handleToggleTheme,
    isDarkMode,
    onNavigateToAnalytics: () => setCurrentView('ANALYTICS'),
    onNavigateToReviewCenter: () => setCurrentView('REVIEW_CENTER'),
    onNavigateToNotifications: () => setCurrentView('NOTIFICATIONS'),
    onSelectCategory: handleSelectCategory,
    onSelectDocument: handleSelectDocument,
    onOpenDocumentById: (docId: string) => {
      const doc = documents.find(d => d.id === docId);
      if (doc) handleSelectDocument(doc);
    },
    onOpenReviewCenterByDocId: (docId: string) => {
      const doc = documents.find(d => d.id === docId);
      if (doc) setCurrentView('REVIEW_CENTER');
    },
    docFilter,
    onToggleFavorites: () => setDocFilter(prev => (prev === 'FAVORITES' ? 'ALL' : 'FAVORITES')),
    favoriteCount: favoriteDocIds.length,
    onOpenDocumentById: (docId: string) => handleSelectDocument,
    onOpenReviewCenterByDocId: (docId: string) => setCurrentView('REVIEW_CENTER'),
    searchQuery: '',
    onSearch: () => {},
  };

  const renderMainContent = () => {
    switch (currentView) {
      case 'HOME':
        return (
          <div className="p-4 sm:p-8 max-w-5xl mx-auto">
            <div className="text-center py-16">
              <img
                src={systemSettings.logoCollapsedUrl}
                alt="Logo"
                className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 rounded-xl shadow-md p-2 bg-white object-contain"
              />
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-4">
                Bem-vindo ao {systemSettings.appName}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto mb-8">
                Sistema de documentação corporativa.
              </p>
              {isAdminOrEditor && (
                <button
                  onClick={handleCreateDocument}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg"
                >
                  Criar Documento
                </button>
              )}
            </div>
          </div>
        );

      case 'CATEGORY_VIEW':
        const activeCategory = categories.find(c => c.id === activeCategoryId);
        const categoryDocs = activeCategory ? documents.filter(d => d.categoryId === activeCategory.id) : [];
        
        return (
          <div className="p-4 sm:p-8 max-w-5xl mx-auto">
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="min-w-0">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white truncate">
                    {activeCategory?.name || 'Categoria'}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                    {activeCategory ? getCategoryPath(activeCategory.id) : ''}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    {categoryDocs.length} documento(s)
                  </p>
                </div>

                {isAdminOrEditor && (
                  <button
                    onClick={handleCreateDocument}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Criar Documento
                  </button>
                )}
              </div>

              <div className="mt-6">
                {categoryDocs.length === 0 ? (
                  <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-10 text-center text-gray-500 dark:text-gray-400">
                    <p className="text-sm">Nenhum documento nesta pasta.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    {categoryDocs.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => handleSelectDocument(doc)}
                        className="w-full text-left px-4 py-3 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        title={doc.title}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 text-gray-400">
                            <FileText size={16} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-900 dark:text-white truncate">{doc.title}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              Atualizado em {new Date(doc.updatedAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'DOCUMENT_VIEW':
        const doc = documents.find(d => selectedDocId === d.id);
        if (!doc) return null;

        return (
          <div className="p-4 sm:p-8 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {doc.title}
                </h1>
                <button
                  onClick={handleCreateDocument}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Editar
                </button>
              </div>

              <div className="prose dark:prose-invert text-gray-800 dark:text-gray-300">
                <div dangerouslySetInnerHTML={{ __html: doc.content }} />
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                <p>Autor: {currentUser?.name}</p>
                <p>Categoria: {getCategoryPath(doc.categoryId)}</p>
                <p>Tags: {doc.tags.join(', ')}</p>
                <p>Criado em: {new Date(doc.createdAt).toLocaleString()}</p>
                <p>Atualizado em: {new Date(doc.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        );

      case 'NOTIFICATIONS':
        return (
          <div className="p-4 sm:p-8 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Notificações
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Sistema de notificações em desenvolvimento.
              </p>
            </div>
          </div>
        );

      default:
      return null;
       }
      };

      restoreSession();
  }, []);

  // Mock data
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

  // Simple handlers
  const handleLogin = (username: string, password: string) => {
    console.log('handleLogin called with:', username);
    
    // Mock authentication
    if (username === 'admin' && password === 'admin') {
      const admin = MOCK_USERS[0];
      admin.isMock = true;
      admin.themePreference = 'light';
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
  }

  // State vars needed for render
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [reviewCenterDocId, setReviewCenterDocId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResultDocs, setSearchResultDocs] = useState<Document[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryModalParentId, setCategoryModalParentId] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

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