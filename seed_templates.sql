-- Script para popular templates de documentos
-- Execute este script no banco de dados Supabase

-- Primeiro, limpar templates existentes (opcional)
-- DELETE FROM public.document_templates WHERE id LIKE 'tpl_%';

-- Inserir templates de Política Interna
INSERT INTO public.document_templates (
  id, 
  name, 
  category, 
  description, 
  icon, 
  content, 
  tags, 
  is_global, 
  department_id, 
  usage_count, 
  is_active, 
  created_by,
  created_at,
  updated_at
) VALUES (
  'tpl_policy_internal',
  'Política Interna',
  'POLICY',
  'Políticas e procedimentos internos da organização.',
  'scale',
  '<h1>Política Interna</h1>
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
<p>Esta política entra em vigor na data de sua publicação...</p>',
  ARRAY['política', 'interno', 'corporativo'],
  true,
  null,
  30,
  true,
  null,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  content = EXCLUDED.content,
  tags = EXCLUDED.tags,
  updated_at = NOW();

-- Inserir templates de Política Externa
INSERT INTO public.document_templates (
  id, name, category, description, icon, content, tags, is_global, department_id, usage_count, is_active, created_by, created_at, updated_at
) VALUES (
  'tpl_policy_external',
  'Política Externa',
  'POLICY',
  'Políticas para relação com clientes, fornecedores e parceiros.',
  'scale',
  '<h1>Política Externa</h1>
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
<p>O cumprimento será monitorado através de...</p>',
  ARRAY['política', 'externo', 'cliente'],
  true,
  null,
  25,
  true,
  null,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  content = EXCLUDED.content,
  tags = EXCLUDED.tags,
  updated_at = NOW();

-- Inserir templates de POP
INSERT INTO public.document_templates (
  id, name, category, description, icon, content, tags, is_global, department_id, usage_count, is_active, created_by, created_at, updated_at
) VALUES (
  'tpl_sop',
  'Procedimento Operacional Padrão (POP)',
  'SOP',
  'Instruções passo a passo para execução de tarefas.',
  'clipboard-list',
  '<h1>Procedimento Operacional Padrão (POP)</h1>
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
<p>[Documentos complementares]</p>',
  ARRAY['POP', 'procedimento', 'processo'],
  true,
  null,
  120,
  true,
  null,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  content = EXCLUDED.content,
  tags = EXCLUDED.tags,
  updated_at = NOW();

-- Inserir templates de FAQ
INSERT INTO public.document_templates (
  id, name, category, description, icon, content, tags, is_global, department_id, usage_count, is_active, created_by, created_at, updated_at
) VALUES (
  'tpl_faq',
  'FAQ',
  'FAQ',
  'Perguntas frequentes e respostas rápidas.',
  'help-circle',
  '<h1>Perguntas Frequentes (FAQ)</h1>
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
</ul>',
  ARRAY['faq', 'perguntas', 'ajuda'],
  true,
  null,
  80,
  true,
  null,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  content = EXCLUDED.content,
  tags = EXCLUDED.tags,
  updated_at = NOW();

-- Inserir templates de Ata de Reunião
INSERT INTO public.document_templates (
  id, name, category, description, icon, content, tags, is_global, department_id, usage_count, is_active, created_by, created_at, updated_at
) VALUES (
  'tpl_meeting',
  'Ata de Reunião',
  'MEETING_MINUTES',
  'Registro de discussões e decisões em reuniões.',
  'calendar',
  '<h1>Ata de Reunião</h1>
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
<p>Reunião encerrada às [horário].</p>',
  ARRAY['reunião', 'ata', 'decisão'],
  true,
  null,
  200,
  true,
  null,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  content = EXCLUDED.content,
  tags = EXCLUDED.tags,
  updated_at = NOW();

-- Inserir templates de Artigo de Conhecimento
INSERT INTO public.document_templates (
  id, name, category, description, icon, content, tags, is_global, department_id, usage_count, is_active, created_by, created_at, updated_at
) VALUES (
  'tpl_kb_article',
  'Artigo de Conhecimento',
  'KB_ARTICLE',
  'Documentação técnica e artigos de conhecimento.',
  'book-open',
  '<h1>Artigo de Conhecimento</h1>
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
</ul>',
  ARRAY['conhecimento', 'documentação', 'técnico'],
  true,
  null,
  150,
  true,
  null,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  content = EXCLUDED.content,
  tags = EXCLUDED.tags,
  updated_at = NOW();

-- Inserir templates de Onboarding
INSERT INTO public.document_templates (
  id, name, category, description, icon, content, tags, is_global, department_id, usage_count, is_active, created_by, created_at, updated_at
) VALUES (
  'tpl_onboarding',
  'Onboarding',
  'ONBOARDING',
  'Guia de integração para novos colaboradores.',
  'user-plus',
  '<h1>Guia de Onboarding</h1>
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
<p>[Plano personalizado conforme o cargo e área]</p>',
  ARRAY['onboarding', 'integração', 'novo', 'colaborador'],
  true,
  null,
  90,
  true,
  null,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  content = EXCLUDED.content,
  tags = EXCLUDED.tags,
  updated_at = NOW();

-- Inserir templates de Offboarding
INSERT INTO public.document_templates (
  id, name, category, description, icon, content, tags, is_global, department_id, usage_count, is_active, created_by, created_at, updated_at
) VALUES (
  'tpl_offboarding',
  'Offboarding',
  'OFFBOARDING',
  'Checklist e processo para desligamento de colaboradores.',
  'user-plus',
  '<h1>Processo de Offboarding</h1>
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
</ul>',
  ARRAY['offboarding', 'desligamento', 'saída'],
  true,
  null,
  60,
  true,
  null,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  content = EXCLUDED.content,
  tags = EXCLUDED.tags,
  updated_at = NOW();

-- Verificação
SELECT 'Templates inseridos com sucesso!' as status;
SELECT COUNT(*) as total_templates FROM public.document_templates WHERE is_active = true;