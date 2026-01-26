
export type Role = 'ADMIN' | 'EDITOR' | 'READER';

export type DocStatus = 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED';

export type TemplateCategory = 'POLICY' | 'SOP' | 'FAQ' | 'MEETING_MINUTES' | 'KB_ARTICLE' | 'ONBOARDING' | 'OTHER';

export type SupportedLanguage = 'pt' | 'en' | 'es' | 'fr' | 'de' | 'it';

export type TranslationStatus = 'SYNCED' | 'OUT_OF_SYNC' | 'ERROR';

export interface FooterLink {
  label: string;
  url: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface HeroTag {
  text: string;
  icon: string; // nome do icone lucide
}

export interface LandingFeature {
  title: string;
  description: string;
  icon: string; // nome do icone lucide
}

export interface SystemSettings {
  appName: string;
  logoCollapsedUrl: string; // 1:1 Icon
  logoExpandedUrl: string; // 16:9 Full Logo
  allowedDomains: string[]; // Lista de domínios permitidos para cadastro (ex: ['empresa.com'])
  
  // Layout
  layoutMode: 'SIDEBAR' | 'NAVBAR';

  // Configurações do Dashboard Interno (Pós-login)
  homeTitle?: string; 
  homeDescription?: string;
  showWelcomeCard?: boolean; // Novo: Controla visibilidade do card padrão
  homeContent?: string;      // Novo: Conteúdo rico personalizado da home

  // Configurações da Landing Page / Login (Pré-login)
  landingTitle?: string;
  landingDescription?: string;
  landingGradient?: string; // Novo: Classe CSS do gradiente de fundo
  
  // Novos itens editáveis (1,2,3 e 4,5,6)
  heroTags?: HeroTag[];
  landingFeatures?: LandingFeature[];

  // Configurações do Rodapé
  footerColumns?: FooterColumn[];
  footerBottomText?: string;
}

export interface User {
  id: string;
  username: string; // Used for login
  email: string; // New field
  password?: string; // New field for mock auth logic
  name: string;
  role: Role;
  avatar: string;
  department: string;
  themePreference?: 'light' | 'dark'; // Preference stored in DB
}

// Category type is now defined in lib/categories.ts to match database schema
export type Category = import('./lib/categories').Category;

export interface DocumentTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  description?: string;
  icon?: string;
  content: string; // HTML with placeholders
  tags: string[];
  isGlobal: boolean;
  departmentId?: string;
  usageCount: number;
}

export interface DocumentVersion {
  id: string;
  title: string;
  content: string;
  savedAt: string;
  savedBy: string; // User Name
}

export interface Document {
  id: string;
  title: string;
  content: string; // HTML or Markdown string
  categoryId: string;
  status: DocStatus;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null; // Soft Delete support
  views: number;
  tags: string[];
categoryPath?: string; // Breadcrumb cache
  snippet?: string; // Search result snippet with HTML <mark>
  templateId?: string; // Reference to source template
  versions: DocumentVersion[]; // Version History (Max 3)
}

export interface DocumentTranslation {
  id: string;
  documentId: string;
  language: SupportedLanguage;
  translatedTitle: string;
  translatedContent: string;
  status: TranslationStatus;
  lastSyncedAt: string;
}

export interface ExportLog {
  id: string;
  documentId: string;
  userId: string;
  format: 'PDF' | 'MARKDOWN';
  exportedAt: string;
}

export interface AnalyticsMetric {
  name: string;
  value: number;
}

export interface DailyStat {
  date: string;
  views: number;
  edits: number;
  uniqueUsers: number;
}

// New Types for Analytics V1.2
export interface SearchQueryStat {
  query: string;
  count: number;
  trend: number; // percentage change
}

export interface DepartmentStat {
  name: string;
  docCount: number;
  viewCount: number;
  publishedCount: number;
  draftCount: number;
  avgPublishTime: string; // e.g. "2.5 days"
}

export interface DocumentMetric extends AnalyticsMetric {
  id: string;
  uniqueViews: number;
  avgTime: string; // "4m 12s"
  scrollDepth: number; // 0-100
  bounceRate: number; // 0-100
  exports: number;
  status: DocStatus;
  author: string;
}
