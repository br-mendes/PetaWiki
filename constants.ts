
import { Category, Document, User, DailyStat, AnalyticsMetric, DocumentTemplate, SearchQueryStat, DepartmentStat, DocumentMetric, SystemSettings } from './types';

export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  appName: 'Peta Wiki',
  logoCollapsedUrl: 'https://ui-avatars.com/api/?name=PW&background=2563eb&color=fff&size=128&bold=true', // 1:1
  logoExpandedUrl: 'https://ui-avatars.com/api/?name=Peta+Wiki+Corp&background=2563eb&color=fff&size=256&bold=true&length=3', // 16:9 placeholder
  allowedDomains: ['petacorp.com.br', 'gmxtecnologia.com.br'],
  
  layoutMode: 'SIDEBAR',

  // Dashboard Interno
  homeTitle: 'Bem-vindo ao Peta Wiki',
  homeDescription: 'Selecione uma categoria na barra lateral para navegar pela documentação.',
  showWelcomeCard: true,
  homeContent: '',

  // Landing Page (Pública)
  landingTitle: 'Peta Wiki Corporativo',
  landingDescription: 'O hub central para o conhecimento corporativo. Organize, compartilhe e colabore na documentação com segurança baseada em funções.',
  landingGradient: 'bg-gradient-to-r from-blue-700 to-blue-900', // Padrão
  
  heroTags: [
    { icon: 'shield', text: 'Segurança Empresarial' },
    { icon: 'users', text: 'Colaboração em Equipe' },
    { icon: 'search', text: 'Busca Inteligente' }
  ],

  landingFeatures: [
    { icon: 'book', title: 'Conhecimento Estruturado', description: 'Organize documentos em categorias hierárquicas com profundidade de aninhamento ilimitada.' },
    { icon: 'shield', title: 'Acesso Baseado em Funções', description: 'Permissões estritas para Admins, Editores e Leitores garantem integridade e segurança dos dados.' },
    { icon: 'users', title: 'Ferramentas Colaborativas', description: 'Tradução integrada, sugestões de IA e ferramentas de exportação para capacitar sua força de trabalho.' }
  ],

  // Rodapé
  footerBottomText: 'Feito com 💙 na Peta.',
  footerColumns: [
    {
      title: 'Redes',
      links: [
        { label: 'Instagram', url: 'https://www.instagram.com/petacorp/' },
        { label: 'LinkedIn', url: 'https://www.linkedin.com/company/petacorp/' }
      ]
    },
    {
      title: 'Links',
      links: [
        { label: 'Site', url: 'https://www.petacorp.com.br/' }
      ]
    },
    {
      title: 'Contato',
      links: [
        { label: 'Trabalhe conosco', url: 'https://petacorp.vagas.solides.com.br/' },
        { label: 'Suporte Técnico', url: 'https://glpi.petacorp.com.br/' }
      ]
    }
  ]
};

export const MOCK_USERS: User[] = [
  {
    id: 'mock_admin',
    username: 'admin',
    email: 'admin@petawiki.com',
    password: 'admin',
    name: 'Admin',
    role: 'ADMIN',
    avatar: 'https://ui-avatars.com/api/?name=Admin&background=111827&color=fff',
    department: 'Gestão',
    // garante que o admin de desenvolvimento veja as abas restritas
    isSuperAdmin: true
  }
];

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
    id: 'tpl_policy_internal',
    name: 'Política Interna',
    category: 'POLICY',
    description: 'Políticas e procedimentos internos da organização.',
    icon: 'scale',
    isGlobal: true,
    usageCount: 30,
    tags: ['política', 'interno', 'corporativo'],
    content: `<h1>Política Interna</h1>
<h2>1. Objetivo</h2>
<p>Estabelecer diretrizes e procedimentos para...</p>

<h2>2. Escopo</h2>
<p>Esta política aplica-se a todos os colaboradores...</p>

<h2>3. Responsabilidades</h2>
<ul>
<li>Departamento de RH: Implementação e monitoramento</li>
<li>Gestores: Garantir cumprimento</li>
<li>Colaboradores: Seguir as diretrizes estabelecidas</li>
</ul>

<h2>4. Procedimentos</h2>
<p>4.1. [Descrever o procedimento principal]</p>
<p>4.2. [Descrever o procedimento secundário]</p>

<h2>5. Penalidades</h2>
<p>O não cumprimento desta política poderá resultar em...</p>

<h2>6. Vigência</h2>
<p>Esta política entra em vigor na data de sua publicação...</p>`
  },
  {
    id: 'tpl_policy_external',
    name: 'Política Externa',
    category: 'POLICY',
    description: 'Políticas para relação com clientes, fornecedores e parceiros.',
    icon: 'scale',
    isGlobal: true,
    usageCount: 25,
    tags: ['política', 'externo', 'cliente'],
    content: `<h1>Política Externa</h1>
<h2>1. Objetivo</h2>
<p>Definir padrões de relacionamento com...</p>

<h2>2. Aplicação</h2>
<p>Esta política aplica-se a todas as interações com...</p>

<h2>3. Diretrizes Gerais</h2>
<ul>
<li>Transparência em todas as negociações</li>
<li>Confidencialidade das informações</li>
<li>Conformidade com legislação vigente</li>
</ul>

<h2>4. Procedimentos Específicos</h2>
<p>4.1. Clientes</p>
<p>4.2. Fornecedores</p>
<p>4.3. Parceiros</p>

<h2>5. Monitoramento</h2>
<p>O cumprimento será monitorado através de...</p>`
  },
  {
    id: 'tpl_sop',
    name: 'Procedimento Operacional Padrão (POP)',
    category: 'SOP',
    description: 'Instruções passo a passo para execução de tarefas.',
    icon: 'clipboard-list',
    isGlobal: true,
    usageCount: 120,
    tags: ['POP', 'procedimento', 'processo'],
    content: `<h1>Procedimento Operacional Padrão (POP)</h1>
<h2>1. Identificação</h2>
<p><strong>Código:</strong> [Código do documento]</p>
<p><strong>Versão:</strong> [Número da versão]</p>
<p><strong>Data:</strong> [Data de criação/atualização]</p>
<p><strong>Elaborado por:</strong> [Nome do responsável]</p>

<h2>2. Objetivo</h2>
<p>Descrever passo a passo como realizar...</p>

<h2>3. Responsáveis</h2>
<ul>
<li>[Função/Cargo responsável pela execução]</li>
<li>[Função/Cargo responsável pela supervisão]</li>
</ul>

<h2>4. Materiais e Equipamentos</h2>
<ul>
<li>[Material/Equipamento necessário]</li>
<li>[Outros insumos]</li>
</ul>

<h2>5. Procedimento</h2>
<p><strong>Passo 1:</strong> [Descrição detalhada da primeira ação]</p>
<p><strong>Passo 2:</strong> [Descrição detalhada da segunda ação]</p>
<p><strong>Passo 3:</strong> [Descrição detalhada da terceira ação]</p>

<h2>6. Registros</h2>
<p>[Quais registros devem ser mantidos]</p>

<h2>7. Anexos</h2>
<p>[Documentos complementares]</p>`
  },
  {
    id: 'tpl_faq',
    name: 'FAQ',
    category: 'FAQ',
    description: 'Perguntas frequentes e respostas rápidas.',
    icon: 'help-circle',
    isGlobal: true,
    usageCount: 80,
    tags: ['faq', 'perguntas', 'ajuda'],
    content: `<h1>Perguntas Frequentes (FAQ)</h1>
<h2>Geral</h2>
<p><strong>Pergunta 1: Como faço para...?</strong></p>
<p>Resposta: [Resposta detalhada]</p>

<p><strong>Pergunta 2: O que significa...?</strong></p>
<p>Resposta: [Resposta detalhada]</p>

<h2>Técnico</h2>
<p><strong>Pergunta 3: Como resolver o problema...?</strong></p>
<p>Resposta: [Resposta detalhada]</p>

<h2>Contato</h2>
<p>Para dúvidas adicionais, entre em contato:</p>
<ul>
<li>E-mail: suporte@empresa.com</li>
<li>Telefone: (xx) xxxx-xxxx</li>
<li>Chat: [Link para o chat]</li>
</ul>`
  },
  {
    id: 'tpl_meeting',
    name: 'Ata de Reunião',
    category: 'MEETING_MINUTES',
    description: 'Registro de discussões e decisões em reuniões.',
    icon: 'calendar',
    isGlobal: true,
    usageCount: 200,
    tags: ['reunião', 'ata', 'decisão'],
    content: `<h1>Ata de Reunião</h1>
<h2>Informações Gerais</h2>
<p><strong>Data:</strong> [Data da reunião]</p>
<p><strong>Horário:</strong> [Horário de início e término]</p>
<p><strong>Local:</strong> [Local ou sala]</p>
<p><strong>Tipo:</strong> [Ordinária/Extraordinária]</p>

<h2>Participantes</h2>
<table>
<tr><th>Nome</th><th>Cargo/Função</th><th>Presença</th></tr>
<tr><td>[Nome 1]</td><td>[Cargo]</td><td>Presente</td></tr>
<tr><td>[Nome 2]</td><td>[Cargo]</td><td>Presente</td></tr>
</table>

<h2>Pauta</h2>
<ol>
<li>[Assunto 1]</li>
<li>[Assunto 2]</li>
<li>[Assunto 3]</li>
</ol>

<h2>Discussões e Decisões</h2>
<p><strong>Assunto 1: [Título do assunto]</strong></p>
<p>Discussão: [Resumo da discussão]</p>
<p>Decisão: [Decisão tomada]</p>
<p>Responsável: [Nome do responsável]</p>
<p>Prazo: [Data limite]</p>

<h2>Ações</h2>
<table>
<tr><th>Ação</th><th>Responsável</th><th>Prazo</th><th>Status</th></tr>
<tr><td>[Descrição da ação]</td><td>[Responsável]</td><td>[Prazo]</td><td>Pendente</td></tr>
</table>

<h2>Próxima Reunião</h2>
<p><strong>Data:</strong> [Data da próxima reunião]</p>
<p><strong>Pauta Sugerida:</strong> [Assuntos para próxima reunião]</p>

<h2>Encerramento</h2>
<p>Reunião encerrada às [horário].</p>`
  },
  {
    id: 'tpl_kb_article',
    name: 'Artigo de Conhecimento',
    category: 'KB_ARTICLE',
    description: 'Documentação técnica e artigos de conhecimento.',
    icon: 'book-open',
    isGlobal: true,
    usageCount: 150,
    tags: ['conhecimento', 'documentação', 'técnico'],
    content: `<h1>Artigo de Conhecimento</h1>
<h2>Resumo</h2>
<p>[Breve resumo do conteúdo deste artigo]</p>

<h2>Introdução</h2>
<p>[Contexto e importância do tema abordado]</p>

<h2>Pré-requisitos</h2>
<ul>
<li>[Conhecimento necessário 1]</li>
<li>[Ferramenta/software necessário]</li>
<li>[Acesso/permissão requerida]</li>
</ul>

<h2>Procedimento Detalhado</h2>
<h3>Passo 1: [Título do passo]</h3>
<p>[Descrição detalhada do primeiro passo]</p>
<p><strong>Dica:</strong> [Dica importante ou observação]</p>

<h3>Passo 2: [Título do passo]</h3>
<p>[Descrição detalhada do segundo passo]</p>
<p><strong>Atenção:</strong> [Ponto crítico ou cuidado necessário]</p>

<h2>Troubleshooting</h2>
<p><strong>Problema:</strong> [Descrição do problema comum]</p>
<p><strong>Solução:</strong> [Como resolver]</p>

<h2>Referências</h2>
<ul>
<li><a href="[link]">[Título do documento de referência]</a></li>
<li><a href="[link]">[Outro material complementar]</a></li>
</ul>

<h2>Atualizações</h2>
<ul>
<li>[Data] - [Descrição da atualização]</li>
</ul>`
  },
  {
    id: 'tpl_onboarding',
    name: 'Onboarding',
    category: 'ONBOARDING',
    description: 'Guia de integração para novos colaboradores.',
    icon: 'user-plus',
    isGlobal: true,
    usageCount: 90,
    tags: ['onboarding', 'integração', 'novo', 'colaborador'],
    content: `<h1>Guia de Onboarding</h1>
<h2>Bem-vindo(a)!</h2>
<p>Seja bem-vindo(a) à equipe! Este guia vai ajudar na sua integração.</p>

<h2>Dia 1: Primeiros Passos</h2>
<h3>Manhã</h3>
<ul>
<li>Reunião de boas-vindas com o gestor</li>
<li>Apresentação da equipe</li>
<li>Entrega de material de trabalho</li>
<li>Configuração de acessos e sistemas</li>
</ul>

<h3>Tarde</h3>
<ul>
<li>Apresentação do ambiente de trabalho</li>
<li>Leitura dos documentos essenciais</li>
<li>Configuração do e-mail e ferramentas</li>
</ul>

<h2>Primeira Semana</h2>
<h3>Dia 2-3: Conhecimento</h3>
<ul>
<li>Leitura dos manuais e políticas</li>
<li>Capacitação inicial em sistemas</li>
<li>Apresentação dos processos da área</li>
</ul>

<h3>Dia 4-5: Prática Inicial</h3>
<ul>
<li>Acompanhamento de colegas em atividades</li>
<li>Execução de tarefas supervisionadas</li>
<li>Dúvidas e feedback inicial</li>
</ul>

<h2>Primeiro Mês</h2>
<h3>Semana 2-3: Desenvolvimento</h3>
<ul>
<li>Participação ativa em projetos</li>
<li>Capacitações específicas</li>
<li>Reuniões de acompanhamento semanais</li>
</ul>

<h3>Semana 4: Avaliação</h3>
<ul>
<li>Avaliação de desempenho inicial</li>
<li>Planejamento dos próximos 30 dias</li>
<li>Feedback mútuo</li>
</ul>

<h2>Recursos Importantes</h2>
<ul>
<li><strong>Manual do Colaborador:</strong> [Link]</li>
<li><strong>Políticas Internas:</strong> [Link]</li>
<li><strong>Sistemas:</strong> [Lista de acessos]</li>
<li><strong>Contatos:</strong> [Pessoas-chave para suporte]</li>
</ul>

<h2>Seu Plano Individual</h2>
<p>[Plano personalizado conforme o cargo e área]</p>`
  },
  {
    id: 'tpl_offboarding',
    name: 'Offboarding',
    category: 'OFFBOARDING',
    description: 'Checklist e processo para desligamento de colaboradores.',
    icon: 'user-plus',
    isGlobal: true,
    usageCount: 60,
    tags: ['offboarding', 'desligamento', 'saída'],
    content: `<h1>Processo de Offboarding</h1>
<h2>Preparação para o Desligamento</h2>
<p><strong>Colaborador:</strong> [Nome do colaborador]</p>
<p><strong>Data de desligamento:</strong> [Data]</p>
<p><strong>Motivo:</strong> [Motivo do desligamento]</p>

<h2>Checklist - 30 Dias Antes</h2>
<ul>
<li>[ ] Programar reunião de desligamento</li>
<li>[ ] Preparar documentos necessários</li>
<li>[ ] Planejar transferência de responsabilidades</li>
<li>[ ] Agendar entrevista de desligamento</li>
</ul>

<h2>Checklist - 7 Dias Antes</h2>
<ul>
<li>[ ] Verificar férias e saldo bancário</li>
<li>[ ] Confirmar entrega de equipamentos</li>
<li>[ ] Preparar cálculo de rescisão</li>
<li>[ ] Informar equipe sobre a transição</li>
</ul>

<h2>Checklist - Dia do Desligamento</h2>
<h3>Manhã</h3>
<ul>
<li>[ ] Entrevista de desligamento</li>
<li>[ ] Devolução de crachá e acessos</li>
<li>[ ] Entrega dos documentos finais</li>
<li>[ ] Transferência de conhecimentos pendentes</li>
</ul>

<h3>Tarde</h3>
<ul>
<li>[ ] Devolução de equipamentos (notebook, celular)</li>
<li>[ ] Desativação de acessos aos sistemas</li>
<li>[ ] Assinatura do termo de rescisão</li>
<li>[ ] Feedback final sobre o processo</li>
</ul>

<h2>Transferência de Responsabilidades</h2>
<table>
<tr><th>Tarefa/Responsabilidade</th><th>Responsável Atual</th><th>Novo Responsável</th><th>Status</th></tr>
<tr><td>[Tarefa 1]</td><td>[Nome]</td><td>[Nome]</td><td>[Pendente/Concluído]</td></tr>
</table>

<h2>Documentos a Serem Entregues</h2>
<ul>
<li>[ ] Termo de Rescisão</li>
<li>[ ] Certificados de períodos trabalhados</li>
<li>[ ] Guia para saque do FGTS</li>
<li>[ ] Requerimento de seguro-desemprego</li>
<li>[ ] Extrato para Imposto de Renda</li>
</ul>

<h2>Equipamentos a Devolver</h2>
<ul>
<li>[ ] Notebook/Computador</li>
<li>[ ] Celular</li>
<li>[ ] Crachá</li>
<li>[ ] Cartões de acesso</li>
<li>[ ] Materiais da empresa</li>
</ul>

<h2>Acesso aos Sistemas</h2>
<ul>
<li>[ ] Email corporativo</li>
<li>[ ] Sistema ERP</li>
<li>[ ] Sistema CRM</li>
<li>[ ] Aplicações na nuvem</li>
<li>[ ] Redes sociais corporativas</li>
</ul>

<h2>Pós-Desligamento</h2>
<ul>
<li>[ ] Confirmar desativação completa de acessos</li>
<li>[ ] Atualizar organograma</li>
<li>[ ] Arquivar documentos do colaborador</li>
<li>[ ] Manter contato para networking</li>
</ul>`
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
