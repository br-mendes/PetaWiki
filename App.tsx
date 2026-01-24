
import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DocumentView } from './components/DocumentView';
import { DocumentEditor } from './components/DocumentEditor';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { CategoryModal } from './components/CategoryModal';
import { TemplateSelector } from './components/TemplateSelector';
import { LoginPage } from './components/LoginPage';
import { AdminSettings } from './components/AdminSettings';
import { UserProfile } from './components/UserProfile';
import { Role, Document, Category, User, DocumentTemplate, DocumentTranslation, SupportedLanguage, SystemSettings, DocumentVersion } from './types';
import { MOCK_TEMPLATES, DEFAULT_SYSTEM_SETTINGS } from './constants';
import { supabase } from './lib/supabase';
import { 
  buildCategoryTree, 
  getCategoryPath 
} from './lib/hierarchy';
import { translateDocument } from './lib/translate';

type ViewState = 'HOME' | 'DOCUMENT_VIEW' | 'DOCUMENT_EDIT' | 'DOCUMENT_CREATE' | 'TEMPLATE_SELECTION' | 'ANALYTICS';

export default function App() {
  // Auth & System State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(DEFAULT_SYSTEM_SETTINGS);
  
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
       return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  // App View State
  const [currentView, setCurrentView] = useState<ViewState>('HOME');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  
  // Data State
  const [documents, setDocuments] = useState<Document[]>([]);
  const [translations, setTranslations] = useState<DocumentTranslation[]>([]); 
  const [categories, setCategories] = useState<Category[]>([]); // Flat list
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Document State
  const [newDocTemplate, setNewDocTemplate] = useState<{content: string, tags: string[], templateId?: string} | null>(null);

  // Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryModalParentId, setCategoryModalParentId] = useState<string | null>(null);
  const [isAdminSettingsOpen, setIsAdminSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Computed Tree
  const categoryTree = useMemo(() => buildCategoryTree(categories), [categories]);

  // Apply Theme Effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Apply Dynamic Favicon Effect
  useEffect(() => {
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (link) {
      link.href = systemSettings.logoCollapsedUrl;
    } else {
      const newLink = document.createElement('link');
      newLink.rel = 'icon';
      newLink.href = systemSettings.logoCollapsedUrl;
      document.head.appendChild(newLink);
    }
    document.title = systemSettings.appName || 'Peta Wiki';
  }, [systemSettings.logoCollapsedUrl, systemSettings.appName]);

  // Initial Fetch - REAL DATA ONLY
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        console.log("Iniciando conexão com Supabase...");
        
        const [docsRes, catsRes, usersRes] = await Promise.all([
            supabase.from('documents').select('*'),
            supabase.from('categories').select('*'),
            supabase.from('users').select('*')
        ]);

        if (docsRes.error) throw new Error(`Erro Docs: ${docsRes.error.message}`);
        if (catsRes.error) throw new Error(`Erro Cats: ${catsRes.error.message}`);
        if (usersRes.error) throw new Error(`Erro Users: ${usersRes.error.message}`);

        // Mapper Documents
        const mappedDocs = (docsRes.data || []).map((d: any) => ({
          id: d.id,
          title: d.title,
          content: d.content,
          categoryId: d.category_id,
          status: d.status,
          authorId: d.author_id,
          createdAt: d.created_at,
          updatedAt: d.updated_at,
          views: d.views,
          tags: d.tags || [],
          categoryPath: '...',
          versions: [] 
        }));

        // Mapper Categories
        const mappedCats = (catsRes.data || []).map((c: any) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            parentId: c.parent_id,
            departmentId: c.department_id,
            order: c.order,
            docCount: c.doc_count,
            description: c.description,
            icon: c.icon
        }));

        // Mapper Users
        const mappedUsers = (usersRes.data || []).map((u: any) => ({
            id: u.id,
            username: u.username,
            email: u.email,
            password: u.password,
            name: u.name,
            role: u.role,
            department: u.department,
            avatar: u.avatar
        }));

        setDocuments(mappedDocs);
        setCategories(mappedCats); 
        setUsers(mappedUsers);
        setTemplates(MOCK_TEMPLATES); // Mantemos templates estáticos por enquanto ou podemos criar tabela no futuro
        
        console.log(`Dados carregados: ${mappedDocs.length} docs, ${mappedUsers.length} usuários.`);
        
      } catch (e) {
        console.error("Erro crítico ao carregar dados:", e);
        alert("Erro ao conectar ao banco de dados. Verifique a configuração.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);


  // Auth Handlers - REAL DB CHECK
  const handleLogin = (usernameInput: string) => {
    // Procura no estado local (que foi populado pelo DB na inicialização)
    // Para maior segurança em apps reais, faríamos uma query direta: select * from users where username = ?
    const foundUser = users.find(u => u.username === usernameInput || u.email === usernameInput);
    
    if (foundUser) {
      setCurrentUser(foundUser);
      setIsAuthenticated(true);
    } else {
      alert('Usuário ou senha inválidos.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentView('HOME');
  };

  const handleUpdateUserRole = async (userId: string, newRole: Role) => {
    // 1. Update Local
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    
    // 2. Update DB
    try {
        await supabase.from('users').update({ role: newRole }).eq('id', userId);
    } catch (e) { console.error("Erro update role", e); }
  };

  const handleAddUser = async (userData: Partial<User>) => {
    const newUser: User = {
      id: `u${Date.now()}`,
      username: userData.email?.split('@')[0] || 'user',
      email: userData.email!,
      name: userData.name!,
      role: userData.role || 'READER',
      department: userData.department || 'Geral',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || 'User')}&background=random`,
      password: '123' // Senha padrão inicial
    };
    
    // 1. Update Local
    setUsers(prev => [...prev, newUser]);

    // 2. Insert DB
    try {
        await supabase.from('users').insert({
            id: newUser.id,
            username: newUser.username,
            password: newUser.password,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role,
            department: newUser.department,
            avatar: newUser.avatar
        });
    } catch (e) { console.error("Erro add user", e); }
  };

  const handleUpdatePassword = async (oldPass: string, newPass: string): Promise<boolean> => {
    if (!currentUser) return false;
    
    // Validação simples (em produção seria hash)
    if (currentUser.password && currentUser.password !== oldPass) {
      return false;
    }
    
    const updatedUser = { ...currentUser, password: newPass };
    
    // 1. Update Local
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));

    // 2. Update DB
    try {
        const { error } = await supabase.from('users').update({ password: newPass }).eq('id', currentUser.id);
        if (error) throw error;
        return true;
    } catch (e) {
        console.error("Erro ao alterar senha", e);
        return false;
    }
  };
  
  const handleUpdateAvatar = async (base64: string) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, avatar: base64 };
    
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));

    try {
        await supabase.from('users').update({ avatar: base64 }).eq('id', currentUser.id);
    } catch(e) { console.error("Erro update avatar", e); }
  };

  const handleRoleChange = (role: Role) => {
    // Apenas simulação visual temporária para o usuário atual na sessão
    if (currentUser) {
      const updated = { ...currentUser, role };
      setCurrentUser(updated);
    }
  };

  // Logic Guards
  const selectedDocument = documents.find(d => d.id === selectedDocId) || null;
  const selectedTranslations = translations.filter(t => t.documentId === selectedDocId);
  const isAdminOrEditor = currentUser?.role === 'ADMIN' || currentUser?.role === 'EDITOR';

  // --- View Handlers ---
  const handleSelectDocument = (document: Document) => {
    setSelectedDocId(document.id);
    setCurrentView('DOCUMENT_VIEW');
  };

  const handleSelectCategory = (category: Category) => {
    const docsInCat = documents.filter(d => d.categoryId === category.id);
    if (docsInCat.length === 0) {
      if (isAdminOrEditor && (!category.children || category.children.length === 0)) {
        const create = window.confirm(`Nenhum documento em ${category.name}. Deseja criar um?`);
        if (create) {
           setNewDocTemplate({ content: '', tags: [] }); 
           setCurrentView('TEMPLATE_SELECTION');
        }
      }
    }
  };

  const openCreateCategoryModal = (parentId: string | null) => {
    setCategoryModalParentId(parentId);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (data: Partial<Category>) => {
    if (!currentUser) return;
    const newCategory: Category = {
      id: `c${Date.now()}`,
      name: data.name!,
      slug: data.slug!,
      parentId: data.parentId || null,
      departmentId: data.departmentId || currentUser.department,
      order: categories.filter(c => c.parentId === data.parentId).length + 1,
      docCount: 0,
      description: data.description,
      icon: data.icon
    };
    
    setCategories([...categories, newCategory]);

    try {
        await supabase.from('categories').insert({
            id: newCategory.id,
            name: newCategory.name,
            slug: newCategory.slug,
            parent_id: newCategory.parentId,
            department_id: newCategory.departmentId,
            description: newCategory.description,
            icon: newCategory.icon,
            doc_count: 0,
            order: newCategory.order
        });
    } catch(e) { console.error("Erro ao salvar categoria no DB", e); }
  };
  
  const handleUpdateCategory = async (id: string, data: Partial<Category>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
    try {
        const dbData: any = {};
        if (data.name) dbData.name = data.name;
        // Adicionar outros campos conforme necessário para sync
        if (Object.keys(dbData).length > 0) {
            await supabase.from('categories').update(dbData).eq('id', id);
        }
    } catch(e) { console.error("Erro update categoria DB", e); }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (currentUser?.role !== 'ADMIN') {
      alert("Apenas Admins podem excluir categorias.");
      return;
    }
    if (!confirm("Tem certeza? Subcategorias e documentos ficarão órfãos.")) return;
    
    setCategories(categories.filter(c => c.id !== categoryId));
    try {
        await supabase.from('categories').delete().eq('id', categoryId);
    } catch(e) { console.error("Erro delete categoria DB", e); }
  };

  const handleTemplateSelect = (template: DocumentTemplate | null) => {
    if (template) {
      setNewDocTemplate({
        content: template.content,
        tags: template.tags,
        templateId: template.id
      });
    } else {
      setNewDocTemplate({ content: '', tags: [] });
    }
    setCurrentView('DOCUMENT_CREATE');
  };
  
  const handleCreateTemplate = (doc: Partial<Document>) => {
    const newTemplate: DocumentTemplate = {
      id: `tpl_${Date.now()}`,
      name: doc.title || 'Novo Template',
      category: 'OTHER',
      description: 'Template criado a partir de documento.',
      icon: 'file-text',
      content: doc.content || '',
      tags: doc.tags || [],
      isGlobal: true,
      usageCount: 0,
      departmentId: currentUser?.department
    };
    setTemplates([...templates, newTemplate]);
    alert('Template salvo com sucesso!');
  };

  const handleCreateTranslation = async (targetLangs: SupportedLanguage[]) => {
    if (!selectedDocument) return;

    for (const lang of targetLangs) {
      const result = await translateDocument(selectedDocument.title, selectedDocument.content, lang);
      
      const translation: DocumentTranslation = {
        id: `trans_${selectedDocument.id}_${lang}_${Date.now()}`,
        documentId: selectedDocument.id,
        language: lang,
        translatedTitle: result.title,
        translatedContent: result.content,
        status: 'SYNCED',
        lastSyncedAt: new Date().toISOString()
      };
      
      setTranslations(prev => [
        ...prev.filter(t => !(t.documentId === selectedDocument.id && t.language === lang)),
        translation
      ]);
    }
  };

  const handleSaveDocument = async (data: Partial<Document>) => {
    if (!currentUser) return;
    let updatedDocs = [...documents];
    let newDocId = selectedDocument?.id;
    const targetCategoryId = data.categoryId || selectedDocument?.categoryId || (categories[0]?.id || 'c1'); 
    const path = getCategoryPath(targetCategoryId, categories);

    if (currentView === 'DOCUMENT_CREATE') {
      newDocId = `d${Date.now()}`;
      const newDoc: Document = {
        id: newDocId,
        title: data.title || 'Sem Título',
        content: data.content || '',
        categoryId: targetCategoryId, 
        status: currentUser.role === 'ADMIN' ? 'PUBLISHED' : 'PENDING_REVIEW',
        authorId: currentUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 0,
        tags: data.tags || [],
        categoryPath: path,
        templateId: newDocTemplate?.templateId,
        versions: []
      };
      
      updatedDocs = [...documents, newDoc];
      
      // Update local category count
      setCategories(prev => prev.map(c => 
        c.id === targetCategoryId ? { ...c, docCount: c.docCount + 1 } : c
      ));

      try {
        await supabase.from('documents').insert({ 
            id: newDoc.id,
            title: newDoc.title,
            content: newDoc.content,
            category_id: newDoc.categoryId,
            status: newDoc.status,
            author_id: newDoc.authorId,
            tags: newDoc.tags,
            views: 0
        });
        
        // Update category doc count in DB
        const currentCat = categories.find(c => c.id === targetCategoryId);
        if (currentCat) {
             await supabase.from('categories').update({ doc_count: currentCat.docCount + 1 }).eq('id', targetCategoryId);
        }

      } catch (e) { console.error("Falha ao salvar no DB", e); }

      setSelectedDocId(newDocId);
    } else if (selectedDocument) {
      // Logic for Versioning (Max 3 versions)
      const oldDoc = documents.find(d => d.id === selectedDocument.id)!;
      
      const newVersion: DocumentVersion = {
        id: `v_${Date.now()}`,
        title: oldDoc.title,
        content: oldDoc.content,
        savedAt: new Date().toISOString(),
        savedBy: users.find(u => u.id === oldDoc.authorId)?.name || 'Desconhecido'
      };

      const updatedVersions = [newVersion, ...(oldDoc.versions || [])].slice(0, 3);

      updatedDocs = documents.map(d => 
        d.id === selectedDocument.id 
          ? { 
              ...d, 
              ...data, 
              categoryId: targetCategoryId, 
              updatedAt: new Date().toISOString(), 
              categoryPath: path,
              versions: updatedVersions 
            } 
          : d
      );

      setTranslations(prev => prev.map(t => 
        t.documentId === selectedDocument.id 
          ? { ...t, status: 'OUT_OF_SYNC' } 
          : t
      ));
      
      try {
        await supabase.from('documents').update({ 
            title: data.title,
            content: data.content,
            category_id: targetCategoryId,
            tags: data.tags,
            updated_at: new Date().toISOString(),
            status: data.status || selectedDocument.status
        }).eq('id', selectedDocument.id);
      } catch (e) { console.error("Falha ao atualizar no DB", e); }
    }
    
    setDocuments(updatedDocs);
    setCurrentView('DOCUMENT_VIEW');
  };

  const handleRestoreVersion = async (version: DocumentVersion) => {
     if (!selectedDocument || !currentUser) return;
     if (!confirm(`Deseja restaurar a versão de ${new Date(version.savedAt).toLocaleString()}?`)) return;

     await handleSaveDocument({
       title: version.title,
       content: version.content
     });
     
     alert('Versão restaurada com sucesso!');
  };

  if (isLoading) {
    return (
        <div className="flex flex-col h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 text-blue-600 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="animate-pulse">Conectando ao Supabase...</p>
        </div>
    );
  }

  if (!isAuthenticated || !currentUser) {
    return <LoginPage onLogin={handleLogin} settings={systemSettings} />;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200">
      <div className="flex-shrink-0 h-full z-20 shadow-xl">
        <Sidebar 
          categories={categoryTree}
          documents={documents}
          onSelectCategory={handleSelectCategory}
          onSelectDocument={handleSelectDocument} 
          onNavigateHome={() => setCurrentView('HOME')}
          user={currentUser}
          onCreateCategory={openCreateCategoryModal}
          onDeleteCategory={handleDeleteCategory}
          systemSettings={systemSettings}
        />
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header 
          user={currentUser} 
          onRoleChange={handleRoleChange}
          onNavigateToAnalytics={() => setCurrentView('ANALYTICS')}
          onNavigateHome={() => setCurrentView('HOME')}
          onOpenSettings={() => setIsAdminSettingsOpen(true)}
          onLogout={handleLogout}
          onOpenProfile={() => setIsProfileOpen(true)}
          toggleTheme={() => setIsDarkMode(!isDarkMode)}
          isDarkMode={isDarkMode}
        />

        <main className="flex-1 overflow-y-auto">
          {currentView === 'HOME' && (
            <div className="p-12 text-center animate-in fade-in duration-500">
              <img 
                src={systemSettings.logoCollapsedUrl} 
                alt="Logo" 
                className="w-24 h-24 mx-auto mb-6 rounded-xl shadow-md p-2 bg-white object-contain" 
              />
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Bem-vindo ao {systemSettings.appName}</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto mb-8">
                Selecione uma categoria na barra lateral para navegar pela documentação.
              </p>
              {isAdminOrEditor && (
                <button 
                  onClick={() => setCurrentView('TEMPLATE_SELECTION')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                >
                  Criar Novo Documento
                </button>
              )}
            </div>
          )}

          {currentView === 'ANALYTICS' && currentUser.role === 'ADMIN' && (
            <AnalyticsDashboard />
          )}

          {currentView === 'TEMPLATE_SELECTION' && (
            <TemplateSelector 
              templates={templates}
              onSelect={handleTemplateSelect}
              onCancel={() => setCurrentView('HOME')}
            />
          )}

          {currentView === 'DOCUMENT_VIEW' && selectedDocument && (
            <DocumentView 
              document={selectedDocument} 
              translations={selectedTranslations}
              user={currentUser}
              onEdit={() => setCurrentView('DOCUMENT_EDIT')}
              systemSettings={systemSettings}
              onRestoreVersion={handleRestoreVersion} 
            />
          )}

          {(currentView === 'DOCUMENT_EDIT' || currentView === 'DOCUMENT_CREATE') && (isAdminOrEditor) && (
            <DocumentEditor 
              document={currentView === 'DOCUMENT_EDIT' ? selectedDocument : null}
              user={currentUser}
              onSave={handleSaveDocument}
              onTranslate={currentView === 'DOCUMENT_EDIT' ? handleCreateTranslation : undefined}
              onCancel={() => {
                selectedDocument ? setCurrentView('DOCUMENT_VIEW') : setCurrentView('HOME');
              }}
              categories={categoryTree}
              initialCategoryId={selectedDocument?.categoryId}
              initialContent={currentView === 'DOCUMENT_CREATE' ? newDocTemplate?.content : undefined}
              initialTags={currentView === 'DOCUMENT_CREATE' ? newDocTemplate?.tags : undefined}
              onCreateTemplate={handleCreateTemplate}
            />
          )}

          {(currentView === 'ANALYTICS' && currentUser.role !== 'ADMIN') && (
            <div className="p-12 text-center text-red-600">Acesso Negado: Privilégios de administrador necessários.</div>
          )}
        </main>
      </div>

      <CategoryModal 
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        parentId={categoryModalParentId}
        categories={categories}
        user={currentUser}
        onSave={handleSaveCategory}
      />

      <AdminSettings 
        isOpen={isAdminSettingsOpen}
        onClose={() => setIsAdminSettingsOpen(false)}
        settings={systemSettings}
        onSaveSettings={setSystemSettings}
        users={users}
        onUpdateUserRole={handleUpdateUserRole}
        onAddUser={handleAddUser}
        categories={categories}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
        onAddCategory={handleSaveCategory}
      />

      {currentUser && (
        <UserProfile 
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          user={currentUser}
          onUpdatePassword={handleUpdatePassword}
          onUpdateAvatar={handleUpdateAvatar}
        />
      )}
    </div>
  );
}
