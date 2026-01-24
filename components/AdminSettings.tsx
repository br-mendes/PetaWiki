import React, { useState, useRef, useMemo } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { User, SystemSettings, Role, Category } from '../types';
import { Settings, Image, Save, UserCog, UserPlus, FolderTree, Edit, Upload, Trash2, Plus, CornerDownRight, Mail } from 'lucide-react';
import { generateSlug } from '../lib/hierarchy';
import { sendWelcomeEmail } from '../lib/email';

interface AdminSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SystemSettings;
  onSaveSettings: (settings: SystemSettings) => void;
  users: User[];
  onUpdateUserRole: (userId: string, newRole: Role) => void;
  onAddUser: (user: Partial<User>) => void;
  categories: Category[]; // Passed from App (should be flat list for easier management here)
  onUpdateCategory: (id: string, data: Partial<Category>) => void;
  onDeleteCategory: (id: string) => void;
  onAddCategory: (data: Partial<Category>) => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  users,
  onUpdateUserRole,
  onAddUser,
  categories,
  onUpdateCategory,
  onDeleteCategory,
  onAddCategory
}) => {
  const [activeTab, setActiveTab] = useState<'BRANDING' | 'USERS' | 'CATEGORIES'>('BRANDING');
  
  // Settings State
  const [appName, setAppName] = useState(settings.appName);
  const [logoCollapsedUrl, setLogoCollapsedUrl] = useState(settings.logoCollapsedUrl);
  const [logoExpandedUrl, setLogoExpandedUrl] = useState(settings.logoExpandedUrl);

  // New User State
  const [newUser, setNewUser] = useState({ name: '', email: '', department: 'Geral', role: 'READER' as Role });
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  
  // New Category State
  const [newCatName, setNewCatName] = useState('');
  const [newCatParent, setNewCatParent] = useState('');

  // File Refs
  const collapsedInputRef = useRef<HTMLInputElement>(null);
  const expandedInputRef = useRef<HTMLInputElement>(null);
  const catNameInputRef = useRef<HTMLInputElement>(null);

  // --- Helper to sort categories hierarchically for display ---
  const sortedCategories = useMemo(() => {
    const grouped = new Map<string | null, Category[]>();
    // Group by parentId
    categories.forEach(c => {
      const pid = c.parentId || null;
      if (!grouped.has(pid)) grouped.set(pid, []);
      grouped.get(pid)!.push(c);
    });

    // Recursive traversal to build flat list with depth
    const result: { cat: Category, depth: number }[] = [];
    const traverse = (pid: string | null, depth: number) => {
      const children = grouped.get(pid) || [];
      // Sort children by order (if available) or name
      children.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
      
      children.forEach(c => {
        result.push({ cat: c, depth });
        traverse(c.id, depth + 1);
      });
    };

    traverse(null, 0);
    return result;
  }, [categories]);

  const handleSaveSettings = () => {
    onSaveSettings({ appName, logoCollapsedUrl, logoExpandedUrl });
    alert('Configurações do sistema atualizadas!');
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newUser.name && newUser.email) {
      setIsSendingEmail(true);
      
      // 1. Add User to App State
      onAddUser(newUser);

      // 2. Send Welcome Email
      const emailResult = await sendWelcomeEmail(newUser, settings);
      
      setIsSendingEmail(false);
      setNewUser({ name: '', email: '', department: 'Geral', role: 'READER' });
      
      if (emailResult.success) {
        alert('Usuário adicionado e e-mail de boas-vindas enviado com sucesso!');
      } else {
        alert(`Usuário adicionado, mas falha no envio do e-mail: ${emailResult.message}`);
      }
    }
  };
  
  const handleAddCategoryClick = () => {
    if(!newCatName.trim()) return;
    
    // Logic: Roots = 'library', Children = 'folder'
    const defaultIcon = newCatParent ? 'folder' : 'library';

    onAddCategory({
      name: newCatName,
      parentId: newCatParent || null,
      slug: generateSlug(newCatName),
      description: 'Nova categoria adicionada via admin',
      icon: defaultIcon
    });
    
    setNewCatName('');
    // We keep the parent selection to allow rapid addition of multiple siblings, 
    // or you could clear it: setNewCatParent('');
    alert('Item incluído na estrutura.');
  };

  const prepareAddSubcategory = (parentId: string) => {
    setNewCatParent(parentId);
    if (catNameInputRef.current) {
      catNameInputRef.current.focus();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (s: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setter(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configurações de Admin" size="lg">
      <div className="flex flex-col md:flex-row gap-6 min-h-[500px]">
        {/* Sidebar */}
        <div className="w-full md:w-48 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 pr-0 md:pr-4 space-y-1 mb-4 md:mb-0 shrink-0">
          <button
            onClick={() => setActiveTab('BRANDING')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'BRANDING' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'}`}
          >
            <Image size={16} /> Marca (Branding)
          </button>
          <button
            onClick={() => setActiveTab('USERS')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'USERS' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'}`}
          >
            <UserCog size={16} /> Gerenciar Usuários
          </button>
          <button
            onClick={() => setActiveTab('CATEGORIES')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'CATEGORIES' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'}`}
          >
            <FolderTree size={16} /> Árvore de Docs
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto max-h-[600px] pr-2">
          {activeTab === 'BRANDING' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Identidade Visual</h3>
                <div className="space-y-6">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome da Aplicação</label>
                     <input 
                       type="text" 
                       value={appName}
                       onChange={(e) => setAppName(e.target.value)}
                       className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                       placeholder="Deixe vazio para usar apenas o logo expandido"
                     />
                     <p className="text-xs text-gray-500 mt-1">
                        Se preenchido: Exibe Logo Recolhido (1:1) + Nome.<br/>
                        Se vazio: Exibe apenas Logo Expandido (16:9).
                     </p>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {/* Collapsed Logo */}
                     <div className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Logo Recolhido (1:1)</label>
                        <div className="flex flex-col items-center gap-3">
                          <img src={logoCollapsedUrl} className="w-16 h-16 object-contain bg-white rounded border" />
                          <input 
                            type="file" 
                            ref={collapsedInputRef}
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, setLogoCollapsedUrl)}
                          />
                          <Button size="sm" variant="secondary" onClick={() => collapsedInputRef.current?.click()}>
                            <Upload size={14} className="mr-2" /> Upload Ícone
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 text-center">Usado no Favicon e na Home.</p>
                     </div>

                     {/* Expanded Logo */}
                     <div className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Logo Expandido (16:9)</label>
                        <div className="flex flex-col items-center gap-3">
                          <img src={logoExpandedUrl} className="w-full h-16 object-contain bg-white rounded border" />
                          <input 
                            type="file" 
                            ref={expandedInputRef}
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, setLogoExpandedUrl)}
                          />
                          <Button size="sm" variant="secondary" onClick={() => expandedInputRef.current?.click()}>
                            <Upload size={14} className="mr-2" /> Upload Banner
                          </Button>
                        </div>
                     </div>
                   </div>

                   <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                     <Button onClick={handleSaveSettings}>
                        <Save size={16} className="mr-2" /> Salvar Branding
                     </Button>
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'USERS' && (
            <div className="space-y-8">
               {/* Add User Section */}
               <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                  <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                    <UserPlus size={16} /> Adicionar Novo Usuário
                  </h4>
                  <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input 
                      type="text" 
                      placeholder="Nome Completo" 
                      value={newUser.name}
                      onChange={e => setNewUser({...newUser, name: e.target.value})}
                      className="px-3 py-2 text-sm border rounded bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                      required
                    />
                    <input 
                      type="email" 
                      placeholder="E-mail (Login)" 
                      value={newUser.email}
                      onChange={e => setNewUser({...newUser, email: e.target.value})}
                      className="px-3 py-2 text-sm border rounded bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                      required
                    />
                    <input 
                      type="text" 
                      placeholder="Departamento" 
                      value={newUser.department}
                      onChange={e => setNewUser({...newUser, department: e.target.value})}
                      className="px-3 py-2 text-sm border rounded bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                    <select 
                       value={newUser.role}
                       onChange={e => setNewUser({...newUser, role: e.target.value as Role})}
                       className="px-3 py-2 text-sm border rounded bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    >
                      <option value="READER">Leitor</option>
                      <option value="EDITOR">Editor</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                    <div className="md:col-span-2 flex justify-end">
                      <Button type="submit" size="sm" disabled={isSendingEmail}>
                        {isSendingEmail ? 'Enviando convite...' : 'Adicionar Usuário & Enviar E-mail'}
                      </Button>
                    </div>
                  </form>
               </div>

               {/* User List */}
               <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Gerenciar Permissões</h3>
                <div className="border rounded-lg overflow-hidden dark:border-gray-600">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Usuário</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Função</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {users.map(u => (
                        <tr key={u.id}>
                          <td className="px-4 py-3 whitespace-nowrap flex items-center gap-2">
                            <img src={u.avatar} className="w-6 h-6 rounded-full object-cover" />
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{u.name}</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">{u.email || u.username}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                              u.role === 'EDITOR' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <select 
                              value={u.role}
                              onChange={(e) => onUpdateUserRole(u.id, e.target.value as Role)}
                              className="text-xs border-gray-300 dark:border-gray-600 rounded shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 bg-white dark:bg-gray-700 dark:text-white"
                            >
                              <option value="READER">Leitor</option>
                              <option value="EDITOR">Editor</option>
                              <option value="ADMIN">Admin</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
               </div>
            </div>
          )}

          {activeTab === 'CATEGORIES' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Estrutura de Categorias</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Use o botão (+) para adicionar subcategorias rapidamente.</p>
              </div>

              {/* Form de Inclusão no Topo */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                <h4 className="text-sm font-bold text-blue-800 dark:text-blue-200 mb-2">
                  {newCatParent ? 'Adicionar Subcategoria' : 'Adicionar Nova Categoria Raiz'}
                </h4>
                <div className="flex gap-2 items-center">
                  <input 
                    ref={catNameInputRef}
                    type="text" 
                    placeholder="Nome da Categoria"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border rounded bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCategoryClick()}
                  />
                  <select
                     value={newCatParent}
                     onChange={(e) => setNewCatParent(e.target.value)}
                     className="flex-1 px-3 py-2 text-sm border rounded bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">(Raiz)</option>
                    {/* Exibe hierarquia no dropdown também para clareza */}
                    {sortedCategories.map(({cat, depth}) => (
                      <option key={cat.id} value={cat.id}>
                        {'- '.repeat(depth) + cat.name}
                      </option>
                    ))}
                  </select>
                  <Button size="sm" onClick={handleAddCategoryClick}>
                    <Plus size={16} className="mr-1" /> Incluir
                  </Button>
                </div>
              </div>

              {/* Tabela de Categorias */}
              <div className="border rounded-lg overflow-hidden dark:border-gray-600 bg-white dark:bg-gray-800 max-h-96 overflow-y-auto">
                 <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400 w-1/2">Estrutura Hierárquica</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Docs</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {sortedCategories.map(({ cat, depth }) => (
                        <tr key={cat.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                          <td className="px-4 py-2">
                            <div className="flex items-center">
                              {/* Visual indent line */}
                              {depth > 0 && (
                                <div style={{ width: depth * 24 }} className="flex justify-end mr-2">
                                  <CornerDownRight size={14} className="text-gray-300" />
                                </div>
                              )}
                              <input 
                                type="text" 
                                value={cat.name}
                                onChange={(e) => onUpdateCategory(cat.id, { name: e.target.value })}
                                className="w-full bg-transparent border-b border-transparent focus:border-blue-500 outline-none text-gray-900 dark:text-white text-sm font-medium"
                              />
                            </div>
                          </td>
                          <td className="px-4 py-2 text-gray-500 dark:text-gray-400">
                            {cat.docCount > 0 ? (
                              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">
                                {cat.docCount} docs
                              </span>
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </td>
                          <td className="px-4 py-2 text-right whitespace-nowrap">
                             {/* Botão para adicionar subcategoria rapidamente */}
                             {depth < 4 && (
                               <button
                                 onClick={() => prepareAddSubcategory(cat.id)}
                                 className="text-blue-500 hover:text-blue-700 p-1 mr-2"
                                 title={`Adicionar subcategoria em ${cat.name}`}
                               >
                                 <Plus size={14} />
                               </button>
                             )}
                             <button 
                               onClick={() => { if(confirm('Excluir categoria?')) onDeleteCategory(cat.id); }}
                               className="text-red-500 hover:text-red-700 p-1"
                               title="Excluir"
                             >
                               <Trash2 size={14} />
                             </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
              </div>

              <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                 <Button onClick={() => { alert('Todas as alterações foram salvas.'); onClose(); }}>
                    <Save size={16} className="mr-2" /> Salvar Alterações e Fechar
                 </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};