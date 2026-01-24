
import { Category, Document, User, DailyStat, AnalyticsMetric, DocumentTemplate, SearchQueryStat, DepartmentStat, DocumentMetric, SystemSettings } from './types';

export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  appName: 'Peta Wiki',
  logoCollapsedUrl: 'https://ui-avatars.com/api/?name=PW&background=2563eb&color=fff&size=128&bold=true', // 1:1
  logoExpandedUrl: 'https://ui-avatars.com/api/?name=Peta+Wiki+Corp&background=2563eb&color=fff&size=256&bold=true&length=3', // 16:9 placeholder
  allowedDomains: ['petacorp.com.br', 'gmxtecnologia.com.br'],
  
  // Dashboard Interno
  homeTitle: 'Bem-vindo ao Peta Wiki',
  homeDescription: 'Selecione uma categoria na barra lateral para navegar pela documentação.',

  // Landing Page (Pública)
  landingTitle: 'Peta Wiki Corporativo',
  landingDescription: 'O hub central para o conhecimento corporativo. Organize, compartilhe e colabore na documentação com segurança baseada em funções.'
};

// Mocks removidos para forçar uso do Banco de Dados.
// As variáveis são mantidas como arrays vazios para evitar quebras de importação imediata, 
// mas o App.tsx não as utilizará para inicialização.

export const MOCK_USERS: User[] = [];

export const CURRENT_USER: User | null = null;

export const MOCK_TEMPLATES: DocumentTemplate[] = [
  {
    id: 'tpl_policy',
    name: 'Política Corporativa',
    category: 'POLICY',
    description: 'Formato padrão para políticas e regulamentos de toda a empresa.',
    icon: 'scale',
    isGlobal: true,
    usageCount: 45,
    tags: ['política', 'compliance'],
    content: `<h1>Política Corporativa</h1><h2>1. Introdução</h2><p>...</p>`
  },
  {
    id: 'tpl_sop',
    name: 'Procedimento Operacional Padrão',
    category: 'SOP',
    description: 'Instruções passo a passo.',
    icon: 'clipboard-list',
    isGlobal: true,
    usageCount: 120,
    tags: ['POP', 'procedimento'],
    content: `<h1>POP</h1><h2>1. Objetivo</h2><p>...</p>`
  },
  {
      id: 'tpl_meeting',
      name: 'Ata de Reunião',
      category: 'MEETING_MINUTES',
      description: 'Registro de discussões.',
      icon: 'calendar',
      isGlobal: true,
      usageCount: 200,
      tags: ['reunião', 'ata'],
      content: `<h1>Ata</h1>`
  }
];

export const MOCK_CATEGORIES: Category[] = [];

export const MOCK_DOCUMENTS: Document[] = [];

// --- Analytics Mocks (Mantidos como estáticos por enquanto, pois requerem query complexa de agregação) ---

export const ANALYTICS_DAILY: DailyStat[] = [
  { date: '1 Jan', views: 400, edits: 24, uniqueUsers: 210 },
  { date: '30 Jan', views: 1200, edits: 20, uniqueUsers: 700 },
];

export const TOP_DOCS: AnalyticsMetric[] = [];
export const DETAILED_DOC_STATS: DocumentMetric[] = [];
export const SEARCH_QUERIES: SearchQueryStat[] = [];
export const DEPARTMENT_STATS: DepartmentStat[] = [];
