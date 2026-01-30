export interface Draft {
  id: string;
  title: string;
  content: string;
  categoryId: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DraftStorage {
  getDrafts: () => Draft[];
  saveDraft: (draft: Omit<Draft, 'id' | 'createdAt' | 'updatedAt'>) => Draft;
  deleteDraft: (id: string) => void;
  clearDrafts: () => void;
}

// Implementação localStorage-based para rascunhos
export const localStorageDraftStorage: DraftStorage = {
  getDrafts: (): Draft[] => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem('petawiki_drafts');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  saveDraft: (draft) => {
    if (typeof window === 'undefined') return null as any;
    try {
      const drafts = localStorageDraftStorage.getDrafts();
      const existingIndex = drafts.findIndex(d => d.title === draft.title && d.categoryId === draft.categoryId);
      
      const newDraft: Draft = {
        id: existingIndex >= 0 ? drafts[existingIndex].id : `draft_${Date.now()}`,
        ...draft,
        createdAt: existingIndex >= 0 ? drafts[existingIndex].createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (existingIndex >= 0) {
        drafts[existingIndex] = newDraft;
      } else {
        drafts.unshift(newDraft); // Mais recentes primeiro
      }

      // Mantém apenas os 20 mais recentes
      const limited = drafts.slice(0, 20);
      localStorage.setItem('petawiki_drafts', JSON.stringify(limited));
      return newDraft;
    } catch {
      return null as any;
    }
  },

  deleteDraft: (id: string) => {
    if (typeof window === 'undefined') return;
    try {
      const drafts = localStorageDraftStorage.getDrafts();
      const filtered = drafts.filter(d => d.id !== id);
      localStorage.setItem('petawiki_drafts', JSON.stringify(filtered));
    } catch {
      // Silencioso
    }
  },

  clearDrafts: () => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem('petawiki_drafts');
    } catch {
      // Silencioso
    }
  }
};