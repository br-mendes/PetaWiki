import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { User, Document, Category, DocumentTemplate, SystemSettings } from '../types';

type ViewState = 
  | 'HOME'
  | 'CATEGORY_VIEW' 
  | 'DOCUMENT_VIEW'
  | 'DOCUMENT_EDIT'
  | 'DOCUMENT_CREATE'
  | 'TEMPLATE_SELECTION'
  | 'ANALYTICS'
  | 'REVIEW_CENTER'
  | 'ADMIN_SETTINGS';

interface AppState {
  // Auth & System
  isAuthenticated: boolean;
  currentUser: User | null;
  users: User[];
  systemSettings: SystemSettings;
  isDarkMode: boolean;
  
  // View State
  currentView: ViewState;
  selectedDocId: string | null;
  reviewCenterDocId: string | null;
  
  // Data State
  documents: Document[];
  categories: Category[];
  templates: DocumentTemplate[];
  isLoading: boolean;
  
  // Category State
  activeCategoryId: string | null;
  defaultCategoryId: string | null;
  
  // Search & Filters
  searchQuery: string;
  searchResultDocs: Document[] | null;
  isSearching: boolean;
  docFilter: 'ALL' | 'FAVORITES';
  favoriteDocIds: string[];
  
  // UI State
  isCategoryModalOpen: boolean;
  categoryModalParentId: string | null;
  isProfileOpen: boolean;
  settingsReturnView: ViewState;
  newDocTemplate: { content: string; tags: string[]; templateId?: string } | null;
}

type AppAction = 
  | { type: 'SET_AUTH'; payload: { isAuthenticated: boolean; user: User | null } }
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'SET_SYSTEM_SETTINGS'; payload: SystemSettings }
  | { type: 'TOGGLE_THEME' }
  | { type: 'SET_CURRENT_VIEW'; payload: ViewState }
  | { type: 'SET_SELECTED_DOC'; payload: string | null }
  | { type: 'SET_REVIEW_DOC'; payload: string | null }
  | { type: 'SET_DOCUMENTS'; payload: Document[] }
  | { type: 'SET_CATEGORIES'; payload: Category[] }
  | { type: 'SET_TEMPLATES'; payload: DocumentTemplate[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ACTIVE_CATEGORY'; payload: string | null }
  | { type: 'SET_DEFAULT_CATEGORY'; payload: string | null }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SEARCH_RESULTS'; payload: Document[] | null }
  | { type: 'SET_SEARCHING'; payload: boolean }
  | { type: 'SET_DOC_FILTER'; payload: 'ALL' | 'FAVORITES' }
  | { type: 'SET_FAVORITES'; payload: string[] }
  | { type: 'TOGGLE_CATEGORY_MODAL'; payload: { open: boolean; parentId?: string | null } }
  | { type: 'SET_PROFILE_OPEN'; payload: boolean }
  | { type: 'SET_SETTINGS_RETURN'; payload: ViewState }
  | { type: 'SET_NEW_DOC_TEMPLATE'; payload: { content: string; tags: string[]; templateId?: string } | null };

const initialState: AppState = {
  isAuthenticated: false,
  currentUser: null,
  users: [],
  systemSettings: {
    appName: 'Peta Wiki',
    logoCollapsedUrl: '',
    logoExpandedUrl: '',
    allowedDomains: [],
    layoutMode: 'SIDEBAR',
    homeContent: '',
    footerBottomText: '',
    footerColumns: []
  },
  isDarkMode: false,
  currentView: 'HOME',
  selectedDocId: null,
  reviewCenterDocId: null,
  documents: [],
  categories: [],
  templates: [],
  isLoading: false,
  activeCategoryId: null,
  defaultCategoryId: null,
  searchQuery: '',
  searchResultDocs: null,
  isSearching: false,
  docFilter: 'ALL',
  favoriteDocIds: [],
  isCategoryModalOpen: false,
  categoryModalParentId: null,
  isProfileOpen: false,
  settingsReturnView: 'HOME',
  newDocTemplate: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_AUTH':
      return {
        ...state,
        isAuthenticated: action.payload.isAuthenticated,
        currentUser: action.payload.user,
      };
    
    case 'SET_USERS':
      return { ...state, users: action.payload };
    
    case 'SET_SYSTEM_SETTINGS':
      return { ...state, systemSettings: action.payload };
    
    case 'TOGGLE_THEME':
      return { ...state, isDarkMode: !state.isDarkMode };
    
    case 'SET_CURRENT_VIEW':
      return { ...state, currentView: action.payload };
    
    case 'SET_SELECTED_DOC':
      return { ...state, selectedDocId: action.payload };
    
    case 'SET_REVIEW_DOC':
      return { ...state, reviewCenterDocId: action.payload };
    
    case 'SET_DOCUMENTS':
      return { ...state, documents: action.payload };
    
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    
    case 'SET_TEMPLATES':
      return { ...state, templates: action.payload };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ACTIVE_CATEGORY':
      return { ...state, activeCategoryId: action.payload };
    
    case 'SET_DEFAULT_CATEGORY':
      return { ...state, defaultCategoryId: action.payload };
    
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    
    case 'SET_SEARCH_RESULTS':
      return { ...state, searchResultDocs: action.payload };
    
    case 'SET_SEARCHING':
      return { ...state, isSearching: action.payload };
    
    case 'SET_DOC_FILTER':
      return { ...state, docFilter: action.payload };
    
    case 'SET_FAVORITES':
      return { ...state, favoriteDocIds: action.payload };
    
    case 'TOGGLE_CATEGORY_MODAL':
      return {
        ...state,
        isCategoryModalOpen: action.payload.open,
        categoryModalParentId: action.payload.parentId || null,
      };
    
    case 'SET_PROFILE_OPEN':
      return { ...state, isProfileOpen: action.payload };
    
    case 'SET_SETTINGS_RETURN':
      return { ...state, settingsReturnView: action.payload };
    
    case 'SET_NEW_DOC_TEMPLATE':
      return { ...state, newDocTemplate: action.payload };
    
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// Action creators for easier usage
export const appActions = {
  setAuth: (isAuthenticated: boolean, user: User | null) => 
    ({ type: 'SET_AUTH', payload: { isAuthenticated, user } } as AppAction),
  
  setUsers: (users: User[]) => 
    ({ type: 'SET_USERS', payload: users } as AppAction),
  
  setSystemSettings: (settings: SystemSettings) => 
    ({ type: 'SET_SYSTEM_SETTINGS', payload: settings } as AppAction),
  
  toggleTheme: () => 
    ({ type: 'TOGGLE_THEME' } as AppAction),
  
  setCurrentView: (view: ViewState) => 
    ({ type: 'SET_CURRENT_VIEW', payload: view } as AppAction),
  
  setSelectedDoc: (docId: string | null) => 
    ({ type: 'SET_SELECTED_DOC', payload: docId } as AppAction),
  
  setReviewDoc: (docId: string | null) => 
    ({ type: 'SET_REVIEW_DOC', payload: docId } as AppAction),
  
  setDocuments: (documents: Document[]) => 
    ({ type: 'SET_DOCUMENTS', payload: documents } as AppAction),
  
  setCategories: (categories: Category[]) => 
    ({ type: 'SET_CATEGORIES', payload: categories } as AppAction),
  
  setTemplates: (templates: DocumentTemplate[]) => 
    ({ type: 'SET_TEMPLATES', payload: templates } as AppAction),
  
  setLoading: (loading: boolean) => 
    ({ type: 'SET_LOADING', payload: loading } as AppAction),
  
  setActiveCategory: (categoryId: string | null) => 
    ({ type: 'SET_ACTIVE_CATEGORY', payload: categoryId } as AppAction),
  
  setDefaultCategory: (categoryId: string | null) => 
    ({ type: 'SET_DEFAULT_CATEGORY', payload: categoryId } as AppAction),
  
  setSearchQuery: (query: string) => 
    ({ type: 'SET_SEARCH_QUERY', payload: query } as AppAction),
  
  setSearchResults: (results: Document[] | null) => 
    ({ type: 'SET_SEARCH_RESULTS', payload: results } as AppAction),
  
  setSearching: (searching: boolean) => 
    ({ type: 'SET_SEARCHING', payload: searching } as AppAction),
  
  setDocFilter: (filter: 'ALL' | 'FAVORITES') => 
    ({ type: 'SET_DOC_FILTER', payload: filter } as AppAction),
  
  setFavorites: (favorites: string[]) => 
    ({ type: 'SET_FAVORITES', payload: favorites } as AppAction),
  
  toggleCategoryModal: (open: boolean, parentId?: string | null) => 
    ({ type: 'TOGGLE_CATEGORY_MODAL', payload: { open, parentId } } as AppAction),
  
  setProfileOpen: (open: boolean) => 
    ({ type: 'SET_PROFILE_OPEN', payload: open } as AppAction),
  
  setSettingsReturn: (view: ViewState) => 
    ({ type: 'SET_SETTINGS_RETURN', payload: view } as AppAction),
  
  setNewDocTemplate: (template: { content: string; tags: string[]; templateId?: string } | null) => 
    ({ type: 'SET_NEW_DOC_TEMPLATE', payload: template } as AppAction),
};