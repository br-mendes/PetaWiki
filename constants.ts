
import { Category, Document, User, DailyStat, AnalyticsMetric, DocumentTemplate, SearchQueryStat, DepartmentStat, DocumentMetric, SystemSettings } from './types';

export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  appName: 'Peta Wiki',
  logoCollapsedUrl: 'https://ui-avatars.com/api/?name=PW&background=2563eb&color=fff&size=128&bold=true', // 1:1
  logoExpandedUrl: 'https://ui-avatars.com/api/?name=Peta+Wiki+Corp&background=2563eb&color=fff&size=256&bold=true&length=3', // 16:9 placeholder
};

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    username: 'admin',
    email: 'admin@petawiki.com',
    password: 'admin',
    name: 'Alex Admin',
    role: 'ADMIN',
    department: 'TI',
    avatar: 'https://ui-avatars.com/api/?name=Alex+Admin&background=0D8ABC&color=fff',
  },
  {
    id: 'u2',
    username: 'sarah',
    email: 'sarah@petawiki.com',
    password: '123',
    name: 'Sarah Editora',
    role: 'EDITOR',
    department: 'RH',
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Editor&background=random',
  },
  {
    id: 'u3',
    username: 'bob',
    email: 'bob@petawiki.com',
    password: '123',
    name: 'Bob Leitor',
    role: 'READER',
    department: 'Vendas',
    avatar: 'https://ui-avatars.com/api/?name=Bob+Reader&background=random',
  }
];

export const CURRENT_USER: User = MOCK_USERS[0];

export const MOCK_TEMPLATES: DocumentTemplate[] = [
  {
    id: 'tpl_policy',
    name: 'Política Corporativa',
    category: 'POLICY',
    description: 'Formato padrão para políticas e regulamentos de toda a empresa.',
    icon: 'scale', // Lucide icon name mapping
    isGlobal: true,
    usageCount: 45,
    tags: ['política', 'compliance'],
    content: `
      <h1>Política Corporativa</h1>
      <h2>1. Introdução</h2>
      <p>Descreva brevemente o contexto e a razão para esta política.</p>
      
      <h2>2. Objetivo e Escopo</h2>
      <p><strong>Objetivo:</strong> Declare o que esta política visa alcançar.</p>
      <p><strong>Escopo:</strong> Defina a quem e a que esta política se aplica (ex: todos os funcionários, departamentos específicos).</p>
      
      <h2>3. Responsabilidades</h2>
      <ul>
        <li><strong>Funcionários:</strong> Aderir a...</li>
        <li><strong>Gerentes:</strong> Garantir a conformidade...</li>
        <li><strong>RH/Admin:</strong> Monitorar e atualizar...</li>
      </ul>
      
      <h2>4. Declaração da Política</h2>
      <p>[Insira as regras e diretrizes principais da política aqui]</p>
      
      <h2>5. Conformidade e Consequências</h2>
      <p>O não cumprimento desta política pode resultar em ação disciplinar.</p>
      
      <hr />
      <p><em>Aprovado por: [Nome] | Data: [Data] | Próxima Revisão: [Data]</em></p>
    `
  },
  {
    id: 'tpl_sop',
    name: 'Procedimento Operacional Padrão (POP)',
    category: 'SOP',
    description: 'Instruções passo a passo para operações de rotina.',
    icon: 'clipboard-list',
    isGlobal: true,
    usageCount: 120,
    tags: ['POP', 'procedimento'],
    content: `
      <h1>Procedimento Operacional Padrão</h1>
      <h2>1. Objetivo</h2>
      <p>Descreva o propósito deste procedimento.</p>
      
      <h2>2. Pré-requisitos</h2>
      <ul>
        <li>Acessos/permissões necessários: [Lista]</li>
        <li>Ferramentas/software necessários: [Lista]</li>
      </ul>
      
      <h2>3. Etapas do Procedimento</h2>
      <ol>
        <li><strong>Passo Um:</strong> Descreva a ação claramente. <br/><em>Nota: Atenção para [Exceção].</em></li>
        <li><strong>Passo Dois:</strong> Descreva a próxima ação.</li>
        <li><strong>Passo Três:</strong> Verifique o resultado.</li>
      </ol>
      
      <h2>4. Solução de Problemas</h2>
      <p>Se ocorrer [Erro], verifique [Solução].</p>
      
      <h2>5. Referências</h2>
      <p>Link para documentos relacionados ou recursos externos.</p>
    `
  },
  {
    id: 'tpl_kb',
    name: 'Artigo de Base de Conhecimento',
    category: 'KB_ARTICLE',
    description: 'Solução para um problema técnico específico ou guia prático.',
    icon: 'book-open',
    isGlobal: true,
    usageCount: 89,
    tags: ['kb', 'como-fazer', 'guia'],
    content: `
      <h1>Base de Conhecimento</h1>
      <h2>Problema / Contexto</h2>
      <p>Descreva o problema que os usuários estão enfrentando ou a tarefa que precisam realizar.</p>
      
      <h2>Solução</h2>
      <p>Siga estas etapas para resolver o problema:</p>
      <ol>
        <li>Navegue até...</li>
        <li>Clique em...</li>
        <li>Insira o seguinte valor: <code>[Valor]</code></li>
      </ol>
      
      <h2>Capturas de Tela</h2>
      <p>[Insira a Captura de Tela Aqui]</p>
      
      <h2>Artigos Relacionados</h2>
      <ul>
        <li><a href="#">Link 1</a></li>
      </ul>
    `
  },
  {
    id: 'tpl_faq',
    name: 'Perguntas Frequentes (FAQ)',
    category: 'FAQ',
    description: 'Lista de perguntas e respostas comuns.',
    icon: 'help-circle',
    isGlobal: true,
    usageCount: 30,
    tags: ['faq', 'suporte'],
    content: `
      <h1>Perguntas Frequentes (FAQ)</h1>
      <p>Abaixo estão perguntas comuns sobre [Tópico].</p>
      
      <details>
        <summary style="cursor: pointer; font-weight: bold;">Pergunta 1: Qual é o prazo de entrega?</summary>
        <p style="margin-top: 5px;">Resposta: O prazo padrão é de 24-48 horas.</p>
      </details>
      <br>
      
      <details>
        <summary style="cursor: pointer; font-weight: bold;">Pergunta 2: Quem devo contatar para problemas urgentes?</summary>
        <p style="margin-top: 5px;">Resposta: Por favor, contate a linha direta de suporte no ramal 5555.</p>
      </details>
      <br>
      
      <h2>Ainda tem dúvidas?</h2>
      <p>Contate-nos em <a href="mailto:suporte@empresa.com">suporte@empresa.com</a></p>
    `
  },
  {
    id: 'tpl_meeting',
    name: 'Ata de Reunião',
    category: 'MEETING_MINUTES',
    description: 'Registro de discussões de reuniões e itens de ação.',
    icon: 'calendar',
    isGlobal: true,
    usageCount: 200,
    tags: ['reunião', 'ata'],
    content: `
      <h1>Ata de Reunião</h1>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Data:</td>
          <td style="border: 1px solid #ddd; padding: 8px;">[Data]</td>
          <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Hora:</td>
          <td style="border: 1px solid #ddd; padding: 8px;">[Hora]</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Local:</td>
          <td style="border: 1px solid #ddd; padding: 8px;" colspan="3">[Local/Link]</td>
        </tr>
      </table>
      
      <h2>Participantes</h2>
      <p>[Nome 1], [Nome 2], [Nome 3]</p>
      
      <h2>Pauta</h2>
      <ul>
        <li>Tópico A</li>
        <li>Tópico B</li>
      </ul>
      
      <h2>Notas da Discussão</h2>
      <p><strong>Tópico A:</strong> Detalhes da discussão...</p>
      
      <h2>Itens de Ação</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f5f5f5;">
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Tarefa</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Responsável</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Prazo</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">[Descrição da tarefa]</td>
            <td style="border: 1px solid #ddd; padding: 8px;">[Nome]</td>
            <td style="border: 1px solid #ddd; padding: 8px;">[Data]</td>
          </tr>
        </tbody>
      </table>
    `
  },
  {
    id: 'tpl_onboarding',
    name: 'Checklist de Onboarding',
    category: 'ONBOARDING',
    description: 'Lista de verificação para integração de novos funcionários.',
    icon: 'user-plus',
    isGlobal: false,
    departmentId: 'RH',
    usageCount: 50,
    tags: ['rh', 'onboarding', 'checklist'],
    content: `
      <h1>Checklist de Onboarding</h1>
      <h2>Bem-vindo à Equipe!</h2>
      <p>Checklist para [Nome do Funcionário] - Data de Início: [Data]</p>
      
      <h3>Semana 1: Configuração e Acesso</h3>
      <ul>
        <li>[ ] Conta de E-mail Criada</li>
        <li>[ ] Convite Slack/Teams Enviado</li>
        <li>[ ] Hardware Provisionado (Notebook, Monitor)</li>
        <li>[ ] Documentos de RH Assinados</li>
      </ul>
      
      <h3>Semana 2: Treinamento</h3>
      <ul>
        <li>[ ] Assistir Demo do Produto</li>
        <li>[ ] Treinamento de Conformidade e Segurança</li>
      </ul>
      
      <h3>Meta de 30 Dias</h3>
      <p>Completar a primeira tarefa do projeto.</p>
    `
  }
];

export const MOCK_CATEGORIES: Category[] = [
  {
    id: 'c1',
    name: 'Suporte',
    slug: 'suporte',
    parentId: null,
    departmentId: 'TI',
    order: 1,
    docCount: 45,
    icon: 'life-buoy', // Lucide icon
    description: 'Suporte técnico geral e solução de problemas.',
    children: [
      {
        id: 'c1-1',
        name: 'Sistemas Internos',
        slug: 'sistemas-internos',
        parentId: 'c1',
        departmentId: 'TI',
        order: 1,
        docCount: 20,
        icon: 'server', // Lucide icon
        children: [
          { id: 'c1-1-1', name: 'MS Teams', slug: 'ms-teams', parentId: 'c1-1', departmentId: 'TI', order: 1, docCount: 8, icon: 'message-circle', children: [] },
          { id: 'c1-1-2', name: 'Outlook', slug: 'outlook', parentId: 'c1-1', departmentId: 'TI', order: 2, docCount: 5, icon: 'mail', children: [] },
        ]
      },
      {
        id: 'c1-2',
        name: 'Hardware',
        slug: 'hardware',
        parentId: 'c1',
        departmentId: 'TI',
        order: 2,
        docCount: 15,
        icon: 'monitor',
        children: []
      }
    ]
  },
  {
    id: 'c2',
    name: 'RH',
    slug: 'rh',
    parentId: null,
    departmentId: 'RH',
    order: 2,
    docCount: 30,
    icon: 'users',
    description: 'Políticas e procedimentos de Recursos Humanos.',
    children: [
      { id: 'c2-1', name: 'Onboarding', slug: 'onboarding', parentId: 'c2', departmentId: 'RH', order: 1, docCount: 12, icon: 'user-plus', children: [] },
      { id: 'c2-2', name: 'Benefícios', slug: 'beneficios', parentId: 'c2', departmentId: 'RH', order: 2, docCount: 8, icon: 'heart', children: [] },
    ]
  }
];

export const MOCK_DOCUMENTS: Document[] = [
  {
    id: 'd1',
    title: 'Como fazer login no MS Teams',
    content: '<h2>Introdução</h2><p>Este guia explica como acessar o MS Teams.</p><h3>Passos</h3><ol><li>Abra o aplicativo</li><li>Insira as credenciais</li></ol>',
    categoryId: 'c1-1-1',
    status: 'PUBLISHED',
    authorId: 'u1',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z',
    views: 1250,
    tags: ['teams', 'login', 'guia'],
    categoryPath: 'Suporte > Sistemas Internos > MS Teams',
    versions: []
  },
  {
    id: 'd2',
    title: 'Configurando Assinatura do Outlook',
    content: '<p>Formato de assinatura padrão da empresa necessário.</p>',
    categoryId: 'c1-1-2',
    status: 'PUBLISHED',
    authorId: 'u2',
    createdAt: '2024-01-12T09:00:00Z',
    updatedAt: '2024-01-12T09:00:00Z',
    views: 890,
    tags: ['outlook', 'email'],
    categoryPath: 'Suporte > Sistemas Internos > Outlook',
    versions: []
  },
  {
    id: 'd3',
    title: 'Rascunho Política Remota Q1 2024',
    content: '<p>Pendente de revisão para as novas diretrizes de trabalho remoto.</p>',
    categoryId: 'c2-2',
    status: 'PENDING_REVIEW',
    authorId: 'u3',
    createdAt: '2024-02-01T11:00:00Z',
    updatedAt: '2024-02-01T11:00:00Z',
    views: 12,
    tags: ['política', 'remoto', 'rascunho'],
    categoryPath: 'RH > Benefícios',
    versions: []
  }
];

// --- Analytics V1.2 Mocks ---

export const ANALYTICS_DAILY: DailyStat[] = [
  { date: '1 Jan', views: 400, edits: 24, uniqueUsers: 210 },
  { date: '5 Jan', views: 300, edits: 10, uniqueUsers: 150 },
  { date: '10 Jan', views: 550, edits: 35, uniqueUsers: 300 },
  { date: '15 Jan', views: 800, edits: 15, uniqueUsers: 450 },
  { date: '20 Jan', views: 700, edits: 40, uniqueUsers: 380 },
  { date: '25 Jan', views: 900, edits: 60, uniqueUsers: 510 },
  { date: '30 Jan', views: 1200, edits: 20, uniqueUsers: 700 },
];

export const TOP_DOCS: AnalyticsMetric[] = [
  { name: 'Como fazer login no MS Teams', value: 1250 },
  { name: 'Guia de Acesso VPN', value: 1100 },
  { name: 'Calendário de Feriados 2024', value: 980 },
  { name: 'Relatório de Despesas', value: 850 },
];

export const DETAILED_DOC_STATS: DocumentMetric[] = [
  { id: 'd1', name: 'Como fazer login no MS Teams', value: 1250, uniqueViews: 850, avgTime: '3m 15s', scrollDepth: 85, bounceRate: 25, exports: 120, status: 'PUBLISHED', author: 'Alex Admin' },
  { id: 'd2', name: 'Guia de Acesso VPN', value: 1100, uniqueViews: 720, avgTime: '5m 45s', scrollDepth: 60, bounceRate: 40, exports: 85, status: 'PUBLISHED', author: 'Sarah Tech' },
  { id: 'd3', name: 'Calendário de Feriados 2024', value: 980, uniqueViews: 900, avgTime: '1m 20s', scrollDepth: 95, bounceRate: 15, exports: 200, status: 'PUBLISHED', author: 'Equipe RH' },
  { id: 'd4', name: 'Relatório de Despesas', value: 850, uniqueViews: 500, avgTime: '6m 10s', scrollDepth: 55, bounceRate: 30, exports: 45, status: 'PUBLISHED', author: 'Dept Financeiro' },
  { id: 'd5', name: 'Rascunho Política Q1', value: 120, uniqueViews: 15, avgTime: '8m 00s', scrollDepth: 40, bounceRate: 10, exports: 2, status: 'PENDING_REVIEW', author: 'Gerente Mike' },
];

export const SEARCH_QUERIES: SearchQueryStat[] = [
  { query: "redefinir senha", count: 450, trend: 12 },
  { query: "configuração vpn", count: 320, trend: -5 },
  { query: "lista feriados", count: 280, trend: 45 },
  { query: "relatório despesas", count: 210, trend: 8 },
  { query: "acesso jira", count: 150, trend: 0 },
  { query: "wifi convidados", count: 90, trend: -12 },
];

export const DEPARTMENT_STATS: DepartmentStat[] = [
  { name: "Suporte TI", docCount: 145, viewCount: 15000, publishedCount: 130, draftCount: 15, avgPublishTime: "1.2 dias" },
  { name: "RH", docCount: 89, viewCount: 12000, publishedCount: 80, draftCount: 9, avgPublishTime: "3.5 dias" },
  { name: "Vendas", docCount: 45, viewCount: 4500, publishedCount: 30, draftCount: 15, avgPublishTime: "5.0 dias" },
  { name: "Engenharia", docCount: 210, viewCount: 8000, publishedCount: 180, draftCount: 30, avgPublishTime: "2.1 dias" },
];
