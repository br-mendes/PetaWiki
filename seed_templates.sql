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
<p>Estabelecer diretrizes e procedimentos para padronizar as operações internas, garantindo a eficiência, conformidade e alinhamento com os objetivos estratégicos da organização.</p>

<h2>2. Escopo</h2>
<p>Esta política aplica-se a todos os colaboradores da empresa, incluindo:</p>
<ul>
<li>Funcionários efetivos e temporários</li>
<li>Estagiários e aprendizes</li>
<li>Consultores e terceirizados</li>
<li>Diretoria e nível gerencial</li>
</ul>

<h2>3. Definições</h2>
<p><strong>3.1. Procedimento Interno:</strong> Conjunto de ações sequenciais que devem ser seguidas para executar determinada atividade.</p>
<p><strong>3.2. Padrão de Qualidade:</strong> Critérios mínimos aceitáveis para entrega de produtos ou serviços.</p>
<p><strong>3.3. Não Conformidade:</strong> Qualquer desvio das diretrizes estabelecidas nesta política.</p>

<h2>4. Responsabilidades</h2>
<h3>4.1. Departamento de Recursos Humanos</h3>
<ul>
<li>Implementar e monitorar o cumprimento desta política</li>
<li>Realizar treinamentos periódicos sobre os procedimentos</li>
<li>Mantém os documentos atualizados e acessíveis</li>
<li>Investigar não conformidades e aplicar medidas corretivas</li>
</ul>

<h3>4.2. Gestores e Lideranças</h3>
<ul>
<li>Garantir o cumprimento pelos membros de suas equipes</li>
<li>Capacitar novos colaboradores sobre os procedimentos</li>
<li>Reportar não conformidades ao RH</li>
<li>Avaliar periodicamente a eficácia dos processos</li>
</ul>

<h3>4.3. Colaboradores</h3>
<ul>
<li>Seguir rigorosamente as diretrizes estabelecidas</li>
<li>Participar dos treinamentos obrigatórios</li>
<li>Reportar dificuldades ou sugestões de melhoria</li>
<li>Mantém-se atualizados sobre alterações nos procedimentos</li>
</ul>

<h2>5. Procedimentos Gerais</h2>
<p><strong>5.1. Comunicação Oficial:</strong> Todas as comunicações oficiais devem ser realizadas através dos canais institucionais (e-mail corporativo, portal do colaborador, sistema interno).</p>
<p><strong>5.2. Registro de Atividades:</strong> Todas as atividades relevantes devem ser registradas nos sistemas apropriados, garantindo rastreabilidade e auditoria.</p>
<p><strong>5.3. Atualização Cadastral:</strong> Manter dados pessoais e funcionais sempre atualizados no sistema de RH.</p>
<p><strong>5.4. Uso de Recursos:</strong> Utilizar recursos da empresa (equipamentos, softwares, veículos) exclusivamente para fins profissionais.</p>

<h2>6. Procedimentos Específicos</h2>
<p><strong>6.1. Solicitação de Recursos:</strong></p>
<ol>
<li>Preencher formulário de solicitação no sistema interno</li>
<li>Aguardar aprovação do gestor imediato</li>
<li>Comprovar necessidade justificada</li>
<li>Seguir fluxo de aprovação conforme tabela de alçadas</li>
</ol>

<p><strong>6.2. Relatório de Atividades:</strong></p>
<ol>
<li>Elaborar relatório mensal de atividades</li>
<li>Incluir metas estabelecidas e resultados alcançados</li>
<li>Submeter à aprovação do gestor até o 5º dia útil</li>
<li>Arquivar cópia digital na pasta da equipe</li>
</ol>

<p><strong>6.3. Tratamento de Clientes Internos:</strong></p>
<ol>
<li>Responder solicitações em até 24 horas úteis</li>
<li>Mantém tom profissional e cordial</li>
<li>Documentar conversas importantes</li>
<li>Escalonar para área responsável quando necessário</li>
</ol>

<h2>7. Penalidades</h2>
<h3>7.1. Leves</h3>
<ul>
<li>Advertência verbal</li>
<li>Treinamento de reforço</li>
<li>Acompanhamento temporário</li>
</ul>

<h3>7.2. Médias</h3>
<ul>
<li>Advertência escrita</li>
<li>Suspensão de benefícios temporária</li>
<li>Reposicionamento funcional temporário</li>
</ul>

<h3>7.3. Graves</h3>
<ul>
<li>Suspensão por até 30 dias</li>
<li>Demissão por justa causa</li>
<li>Responsabilização civil e criminal quando aplicável</li>
</ul>

<h2>8. Monitoramento e Avaliação</h2>
<p>O cumprimento desta política será monitorado através de:</p>
<ul>
<li>Auditorias internas semestrais</li>
<li>Indicadores de desempenho operacional</li>
<li>Feedback dos colaboradores</li>
<li>Relatórios de não conformidades</li>
</ul>

<h2>9. Revisão e Atualização</h2>
<p>Esta política será revisada anualmente ou quando ocorrerem mudanças significativas nos processos. As atualizações serão comunicadas com 15 dias de antecedência.</p>

<h2>10. Vigência</h2>
<p>Esta política entra em vigor na data de sua publicação e revoga todas as versões anteriores.</p>

<h2>11. Disposições Finais</h2>
<p>Os casos omissos serão resolvidos pela Diretoria Administrativa, ouvidos os departamentos envolvidos.</p>',
  ARRAY['política', 'interno', 'corporativo'],
  true,
  null,
  30,
  true,
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
  id, name, category, description, icon, content, tags, is_global, department_id, usage_count, is_active, created_at, updated_at
) VALUES (
  'tpl_policy_external',
  'Política Externa',
  'POLICY',
  'Políticas para relação com clientes, fornecedores e parceiros.',
  'scale',
  '<h1>Política de Relacionamento Externo</h1>
<h2>1. Objetivo</h2>
<p>Estabelecer padrões de conduta e procedimentos para todas as interações com clientes, fornecedores, parceiros e outras partes externas, garantindo relações profissionais éticas e duradouras.</p>

<h2>2. Aplicação</h2>
<p>Esta política aplica-se a todos os colaboradores que mantenham contato direto ou indireto com partes externas, incluindo:</p>
<ul>
<li>Equipe de vendas e atendimento ao cliente</li>
<li>Departamento de compras e suprimentos</li>
<li>Marketing e comunicação</li>
<li>Diretoria e nível gerencial</li>
<li>Colaboradores que representem a empresa em eventos</li>
</ul>

<h2>3. Princípios Fundamentais</h2>
<h3>3.1. Transparência</h3>
<ul>
<li>Forneça informações claras e precisas</li>
<li>Comunique prazos e condições realistas</li>
<li>Revele potenciais conflitos de interesse</li>
<li>Mantenha honestidade em todas as negociações</li>
</ul>

<h3>3.2. Confidencialidade</h3>
<ul>
<li>Proteja informações sensíveis da empresa</li>
<li>Respeite a confidencialidade dos dados dos clientes</li>
<li>Utilize apenas ferramentas seguras para comunicação</li>
<li>Assine acordos de confidencialidade quando necessário</li>
</ul>

<h3>3.3. Profissionalismo</h3>
<ul>
<li>Mantenha conduta ética em todas as situações</li>
<li>Respeite prazos e compromissos assumidos</li>
<li>Evite linguagem inadequada ou ofensiva</li>
<li>Dê retorno respeitoso mesmo em caso de negativas</li>
</ul>

<h2>4. Procedimentos Específicos</h2>
<h3>4.1. Clientes</h3>
<h4>Primeiro Contato</h4>
<ol>
<li>Apresente-se profissionalmente com nome e cargo</li>
<li>Identifique as necessidades do cliente</li>
<li>Ofereça soluções adequadas ao perfil</li>
<li>Forneça propostas detalhadas e transparentes</li>
<li>Defina próximos passos e prazos claramente</li>
</ol>

<h4>Negociação</h4>
<ol>
<li>Conheça os limites de aprovação autorizados</li>
<li>Documente todos os termos combinados</li>
<li>Verifique capacidade de pagamento do cliente</li>
<li>Consulte área jurídica quando necessário</li>
<li>Formalize acordo em contrato ou ordem de serviço</li>
</ol>

<h4>Follow-up</h4>
<ol>
<li>Confirme recebimento da proposta</li>
<li>Esteja disponível para dúvidas e esclarecimentos</li>
<li>Envie atualizações sobre o andamento</li>
<li>Solicite feedback sobre o serviço prestado</li>
<li>Mantenha cadastro atualizado no sistema CRM</li>
</ol>

<h3>4.2. Fornecedores</h3>
<h4>Seleção e Contratação</h4>
<ol>
<li>Pesquise reputação no mercado</li>
<li>Peça múltiplas cotações</li>
<li>Verifique documentação e certificações</li>
<li>Compare condições comerciais e técnicas</li>
<li>Consulte lista de aprovados da empresa</li>
</ol>

<h4>Relacionamento</h4>
<ol>
<li>Estabeleça comunicação clara e objetiva</li>
<li>Defina expectativas e prazos realistas</li>
<li>Realize avaliações periódicas de desempenho</li>
<li>Pague pontualmente conforme acordado</li>
<li>Mantenha bom relacionamento para futuras parcerias</li>
</ol>

<h3>4.3. Parceiros Estratégicos</h3>
<h4>Estabelecimento de Parceria</h4>
<ol>
<li>Identifique alinhamento estratégico</li>
<li>Defina objetivos e metas comuns</li>
<li>Estabeleça cláusulas de governança</li>
<li>Formalize acordo em contrato específico</li>
<li>Designe responsáveis pela gestão da parceria</li>
</ol>

<h4>Gestão Contínua</h4>
<ol>
<li>Realize reuniões periódicas de alinhamento</li>
<li>Monitore indicadores de desempenho conjunto</li>
<li>Resolva conflitos de forma colaborativa</li>
<li>Celebre sucessos conjuntos</li>
<li>Revise e ajuste acordo conforme necessário</li>
</ol>

<h2>5. Proibições</h2>
<p>É terminantemente proibido:</p>
<ul>
<li>Aceitar presentes ou benefícios indevidos</li>
<li>Favoritismo no tratamento de fornecedores</li>
<li>Compartilhar informações confidenciais</li>
<li>Fazer promessas que não possam ser cumpridas</li>
<li>Utilizar meios não éticos para negócios</li>
</ul>

<h2>6. Canais de Comunicação</h2>
<h3>6.1. Preferenciais</h3>
<ul>
<li>E-mail corporativo para comunicações formais</li>
<li>Telefone comercial para assuntos urgentes</li>
<li>Videoconferência para reuniões importantes</li>
<li>Sistema de CRM para registro de interações</li>
</ul>

<h3>6.2. Restritos</h3>
<ul>
<li>Redes sociais pessoais para negócios</li>
<li>Aplicativos de mensagens não corporativos</li>
<li>Contatos pessoais para assuntos profissionais</li>
<li>Comunicações fora do horário comercial</li>
</ul>

<h2>7. Gerenciamento de Crises</h2>
<h3>7.1. Identificação</h3>
<ul>
<li>Reconhecer sinais de descontentamento</li>
<li>Identificar potenciais conflitos</li>
<li>Notificar superior imediatamente</li>
<li>Documentar cronologia dos fatos</li>
</ul>

<h3>7.2. Resposta</h3>
<ol>
<li>Acionar comitê de crise quando aplicável</li>
<li>Preparar comunicado oficial único</li>
<li>Designar porta-voz autorizado</li>
<li>Respostas devem ser rápidas e consistentes</li>
<li>Manter transparência sem expor riscos desnecessários</li>
</ol>

<h2>8. Treinamento e Capacitação</h2>
<p>Todos os colaboradores com contato externo devem receber treinamento sobre:</p>
<ul>
<li>Técnicas de negociação e vendas</li>
<li>Comunicação profissional</li>
<li>Legislação aplicável</li>
<li>Gestão de relacionamento com clientes</li>
<li>Procedimentos de crise</li>
</ul>

<h2>9. Monitoramento e Auditoria</h2>
<p>O cumprimento será monitorado através de:</p>
<ul>
<li>Avaliações de satisfação de clientes</li>
<li>Auditorias em processos de compra</li>
<li>Análise de reclamações e soluções</li>
<li>Relatórios de performance comercial</li>
<li>Feedback de fornecedores e parceiros</li>
</ul>

<h2>10. Penalidades por Não Conformidade</h2>
<h3>10.1. Internas</h3>
<ul>
<li>Advertência e treinamento obrigatório</li>
<li>Suspensão temporária de funções externas</li>
<li>Realocação para área sem contato externo</li>
<li>Demissão por justa causa em casos graves</li>
</ul>

<h3>10.2. Externas</h3>
<ul>
<li>Cancelamento de contratos</li>
<li>Rescisão de parcerias</li>
<li>Ações legais quando aplicável</li>
<li>Comunicação ao mercado sobre infrações</li>
</ul>

<h2>11. Revisão</h2>
<p>Esta política será revisada anualmente ou quando ocorrerem mudanças significativas no ambiente de negócios.</p>

<h2>12. Vigência</h2>
<p>Esta política entra em vigor em [data] e substitui todas as normas anteriores sobre relacionamento externo.</p>',
  ARRAY['política', 'externo', 'cliente'],
  true,
  null,
  25,
  true,
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
  id, name, category, description, icon, content, tags, is_global, department_id, usage_count, is_active, created_at, updated_at
) VALUES (
  'tpl_sop',
  'Procedimento Operacional Padrão (POP)',
  'SOP',
  'Instruções passo a passo para execução de tarefas.',
  'clipboard-list',
  '<h1>Procedimento Operacional Padrão (POP)</h1>

<h2>1. Identificação do Documento</h2>
<table>
<tr><td><strong>Código:</strong></td><td>[POP-001]</td></tr>
<tr><td><strong>Versão:</strong></td><td>2.0</td></tr>
<tr><td><strong>Data de Elaboração:</strong></td><td>[Data]</td></tr>
<tr><td><strong>Elaborado por:</strong></td><td>[Nome do responsável]</td></tr>
<tr><td><strong>Aprovado por:</strong></td><td>[Nome do aprovador]</td></tr>
<tr><td><strong>Próxima Revisão:</strong></td><td>[Data]</td></tr>
<tr><td><strong>Área Responsável:</strong></td><td>[Departamento/Setor]</td></tr>
</table>

<h2>2. Objetivo</h2>
<p>Padronizar e descrever as atividades necessárias para [descrição do objetivo principal do procedimento], garantindo consistência, qualidade e eficiência na execução das tarefas, minimizando erros e retrabalhos.</p>

<h2>3. Campo de Aplicação</h2>
<p>Este POP aplica-se a:</p>
<ul>
<li>Funcionários do(a) [departamento/setor específico]</li>
<li>Colaboradores que executam [tipo de atividade]</li>
<li>Processos relacionados com [nome do processo]</li>
<li>Período: [contínuo, específico, sazonal]</li>
</ul>

<h2>4. Responsabilidades</h2>
<h3>4.1. Executor(es)</h3>
<ul>
<li><strong>Função:</strong> [Cargo/Função]</li>
<li><strong>Responsabilidades:</strong></li>
<ul>
<li>Executar os passos conforme descrito neste POP</li>
<li>Registrar informações necessárias nos sistemas</li>
<li>Comunicar desvios ou dificuldades ao supervisor</li>
<li>Mantém-se atualizado sobre novas versões deste POP</li>
</ul>
</ul>

<h3>4.2. Supervisor</h3>
<ul>
<li><strong>Função:</strong> [Cargo/Função]</li>
<li><strong>Responsabilidades:</strong></li>
<ul>
<li>Fiscalizar o cumprimento deste POP</li>
<li>Treinar novos colaboradores na execução</li>
<li>Autorizar exceções quando justificadas</li>
<li>Propor melhorias para o procedimento</li>
</ul>
</ul>

<h3>4.3. Área de Qualidade</h3>
<ul>
<li><strong>Responsabilidades:</strong></li>
<ul>
<li>Auditar periodicamente a execução deste POP</li>
<li>Recolher feedback dos executores</li>
<li>Coordenar revisões e atualizações</li>
<li>Manter arquivo de versões anteriores</li>
</ul>
</ul>

<h2>5. Termos e Definições</h2>
<p><strong>[Termo 1]:</strong> Definição clara do significado do termo no contexto deste procedimento.</p>
<p><strong>[Termo 2]:</strong> Definição clara do segundo termo importante.</p>
<p><strong>[Sigla 1]:</strong> Descrição completa da sigla utilizada.</p>

<h2>6. Materiais, Equipamentos e Recursos</h2>
<h3>6.1. Materiais</h3>
<ul>
<li>[Material 1] - Quantidade: [X] por [unidade de tempo]</li>
<li>[Material 2] - Especificação: [detalhes]</li>
<li>[Material 3] - Fornecedor autorizado: [nome]</li>
</ul>

<h3>6.2. Equipamentos</h3>
<ul>
<li>[Equipamento 1] - Modelo: [especificação]</li>
<li>[Equipamento 2] - Calibração: [período]</li>
<li>[Equipamento 3] - Localização: [setor]</li>
</ul>

<h3>6.3. Sistemas e Software</h3>
<ul>
<li>[Sistema 1] - Versão: [número]</li>
<li>[Sistema 2] - Nível de acesso: [tipo]</li>
<li>[Aplicativo 1] - Finalidade: [descrição]</li>
</ul>

<h2>7. Procedimento Detalhado</h2>
<h3>7.1. Preparação</h3>
<p><strong>Pré-requisitos:</strong></p>
<ul>
<li>[ ] Verificar disponibilidade de materiais</li>
<li>[ ] Confirmar funcionamento dos equipamentos</li>
<li>[ ] Acessar sistema com credenciais atualizadas</li>
<li>[ ] Revisar último registro executado</li>
</ul>

<h3>7.2. Execução</h3>
<p><strong>Passo 1 - [Nome da Etapa 1]</strong></p>
<ul>
<li><strong>Ação:</strong> [Descrição detalhada da primeira ação]</li>
<li><strong>Forma de execução:</strong> [Como executar]</li>
<li><strong>Ponto crítico:</strong> [Observação importante]</li>
<li><strong>Tempo estimado:</strong> [X minutos/horas]</li>
<li><strong>Foto/Ilustração:</strong> [Se aplicável]</li>
</ul>

<p><strong>Passo 2 - [Nome da Etapa 2]</strong></p>
<ul>
<li><strong>Ação:</strong> [Descrição detalhada da segunda ação]</li>
<li><strong>Forma de execução:</strong> [Como executar]</li>
<li><strong>Ponto crítico:</strong> [Observação importante]</li>
<li><strong>Tempo estimado:</strong> [X minutos/horas]</li>
<li><strong>Foto/Ilustração:</strong> [Se aplicável]</li>
</ul>

<p><strong>Passo 3 - [Nome da Etapa 3]</strong></p>
<ul>
<li><strong>Ação:</strong> [Descrição detalhada da terceira ação]</li>
<li><strong>Forma de execução:</strong> [Como executar]</li>
<li><strong>Ponto crítico:</strong> [Observação importante]</li>
<li><strong>Tempo estimado:</strong> [X minutos/horas]</li>
<li><strong>Foto/Ilustração:</strong> [Se aplicável]</li>
</ul>

<p><strong>Passo 4 - [Nome da Etapa 4]</strong></p>
<ul>
<li><strong>Ação:</strong> [Descrição detalhada da quarta ação]</li>
<li><strong>Forma de execução:</strong> [Como executar]</li>
<li><strong>Ponto crítico:</strong> [Observação importante]</li>
<li><strong>Tempo estimado:</strong> [X minutos/horas]</li>
<li><strong>Foto/Ilustração:</strong> [Se aplicável]</li>
</ul>

<h3>7.3. Finalização</h3>
<p><strong>Verificação final:</strong></p>
<ul>
<li>[ ] Confirmar conclusão de todas as etapas</li>
<li>[ ] Validar qualidade do resultado</li>
<li>[ ] Limpar área de trabalho</li>
<li>[ ] Guardar equipamentos adequadamente</li>
</ul>

<h2>8. Parâmetros e Critérios</h2>
<h3>8.1. Padrões de Qualidade</h3>
<ul>
<li><strong>Especificação 1:</strong> [valor mínimo/máximo aceitável]</li>
<li><strong>Especificação 2:</strong> [tolerância permitida]</li>
<li><strong>Especificação 3:</strong> [critério de aprovação]</li>
</ul>

<h3>8.2. Limites de Tempo</h3>
<ul>
<li><strong>Tempo máximo total:</strong> [X minutos/horas]</li>
<li><strong>Pausa permitida:</strong> [número e duração]</li>
<li><strong>Horário de execução:</strong> [período permitido]</li>
</ul>

<h3>8.3. Indicadores de Desempenho</h3>
<ul>
<li><strong>KPI 1:</strong> [métrica] - Meta: [valor]</li>
<li><strong>KPI 2:</strong> [métrica] - Meta: [valor]</li>
<li><strong>KPI 3:</strong> [métrica] - Meta: [valor]</li>
</ul>

<h2>9. Registros e Documentação</h2>
<h3>9.1. Registros Obrigatórios</h3>
<table>
<tr><th>Registro</th><th>Local/Freqüência</th><th>Responsável</th><th>Tempo de Guarda</th></tr>
<tr><td>[Registro 1]</td><td>[Onde registrar]</td><td>[Responsável]</td><td>[Tempo]</td></tr>
<tr><td>[Registro 2]</td><td>[Onde registrar]</td><td>[Responsável]</td><td>[Tempo]</td></tr>
<tr><td>[Registro 3]</td><td>[Onde registrar]</td><td>[Responsável]</td><td>[Tempo]</td></tr>
</table>

<h3>9.2. Documentos de Referência</h3>
<ul>
<li>[Documento 1] - [código ou link]</li>
<li>[Documento 2] - [código ou link]</li>
<li>[Documento 3] - [código ou link]</li>
</ul>

<h2>10. Tratamento de Anomalias</h2>
<h3>10.1. Identificação de Problemas</h3>
<p>Situações que devem ser consideradas anomalias:</p>
<ul>
<li>[Situação 1] - Descrição clara</li>
<li>[Situação 2] - Descrição clara</li>
<li>[Situação 3] - Descrição clara</li>
</ul>

<h3>10.2. Ações Corretivas</h3>
<p>Quando identificar anomalia:</p>
<ol>
<li>Interromper imediatamente a execução</li>
<li>Isolar área se necessário para segurança</li>
<li>Comunicar supervisor imediatamente</li>
<li>Registrar no livro de ocorrências</li>
<li>Permanecer no local até orientação</li>
</ol>

<h3>10.3. Procedimento de Contingência</h3>
<p>Se o procedimento principal não puder ser executado:</p>
<ol>
<li>[Plano B - descrição detalhada]</li>
<li>[Plano C - descrição detalhada]</li>
<li>Notificar áreas afetadas</li>
<li>Registrar motivo da contingência</li>
</ol>

<h2>11. Medidas de Segurança</h2>
<h3>11.1. Segurança Pessoal</h3>
<ul>
<li>[ ] Utilizar EPIs obrigatórios: [lista]</li>
<li>[ ] Seguir normas de segurança local</li>
<li>[ ] Manter postura ergonômica adequada</li>
<li>[ ] Evitar sobrecarga física ou mental</li>
</ul>

<h3>11.2. Segurança Operacional</h3>
<ul>
<li>[ ] Verificar condições dos equipamentos antes do uso</li>
<li>[ ] Não realizar modificações não autorizadas</li>
<li>[ ] Respeitar limites de capacidade</li>
<li>[ ] Manter organização do ambiente de trabalho</li>
</ul>

<h2>12. Treinamento e Capacitação</h2>
<h3>12.1. Treinamento Inicial</h3>
<ul>
<li><strong>Conteúdo:</strong> Módulos teóricos e práticos</li>
<li><strong>Carga horária:</strong> [X horas]</li>
<li><strong>Pré-requisitos:</strong> [experiência necessária]</li>
<li><strong>Avaliação:</strong> Teste prático e teórico</li>
</ul>

<h3>12.2. Treinamento de Reciclagem</h3>
<ul>
<li><strong>Período:</strong> A cada [X meses/anos]</li>
<li><strong>Conteúdo:</strong> Atualizações e reforço</li>
<li><strong>Metodologia:</strong> [presencial/online]</li>
</ul>

<h2>13. Histórico de Revisões</h2>
<table>
<tr><th>Versão</th><th>Data</th><th>Alterações</th><th>Responsável</th></tr>
<tr><td>1.0</td><td>[Data inicial]</td><td>Versão inicial</td><td>[Nome]</td></tr>
<tr><td>2.0</td><td>[Data]</td><td>[Descrição das alterações]</td><td>[Nome]</td></tr>
</table>

<h2>14. Anexos</h2>
<ul>
<li><strong>Anexo A:</strong> [Nome do documento 1]</li>
<li><strong>Anexo B:</strong> [Nome do documento 2]</li>
<li><strong>Anexo C:</strong> [Nome do documento 3]</li>
</ul>

<h2>15. Referências</h2>
<ul>
<li>[Norma 1] - [Título completo]</li>
<li>[Norma 2] - [Título completo]</li>
<li>[Legislação] - [Número e descrição]</li>
</ul>

<h2>16. Aprovação</h2>
<table>
<tr><td><strong>Elaborado por:</strong></td><td>___________________________</td><td>[Nome e data]</td></tr>
<tr><td><strong>Revisado por:</strong></td><td>___________________________</td><td>[Nome e data]</td></tr>
<tr><td><strong>Aprovado por:</strong></td><td>___________________________</td><td>[Nome e data]</td></tr>
</table>',
  ARRAY['POP', 'procedimento', 'processo'],
  true,
  null,
  120,
  true,
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
  id, name, category, description, icon, content, tags, is_global, department_id, usage_count, is_active, created_at, updated_at
) VALUES (
  'tpl_faq',
  'FAQ',
  'FAQ',
  'Perguntas frequentes e respostas rápidas.',
  'help-circle',
  '<h1>Perguntas Frequentes (FAQ)</h1>
<p>Bem-vindo à nossa seção de perguntas frequentes. Aqui você encontrará respostas para as dúvidas mais comuns sobre [nome do produto/serviço/sistema]. Se não encontrar o que procura, entre em contato conosco.</p>

<h2>Índice Rápido</h2>
<ul>
<li><a href="#geral">📋 Geral</a></li>
<li><a href="#acesso">🔐 Acesso e Login</a></li>
<li><a href="#funcionalidades">⚙️ Funcionalidades</a></li>
<li><a href="#tecnico">🔧 Técnico</a></li>
<li><a href="#pagamento">💰 Pagamento</a></li>
<li><a href="#suporte">🆘 Suporte</a></li>
</ul>

<hr>

<h2 id="geral">📋 Geral</h2>

<p><strong>P: O que é [nome do produto/serviço]?</strong></p>
<p><strong>R:</strong> [Nome do produto/serviço] é [descrição clara e concisa do que é]. Foi desenvolvido para [propósito principal] e ajuda [benefício para o usuário].</p>

<p><strong>P: Quem pode usar [nome do produto/serviço]?</strong></p>
<p><strong>R:</strong> Nosso produto/serviço é ideal para [público-alvo], incluindo [tipos específicos de usuários]. Para usar, você precisa [requisitos mínimos].</p>

<p><strong>P: Quanto custa?</strong></p>
<p><strong>R:</strong> Oferecemos diferentes planos:</p>
<ul>
<li><strong>Plano Básico:</strong> R$ XX/mês com [recursos]</li>
<li><strong>Plano Profissional:</strong> R$ XX/mês com [recursos]</li>
<li><strong>Plano Enterprise:</strong> Cotação personalizada com [recursos]</li>
</ul>

<p><strong>P: Existe período de teste gratuito?</strong></p>
<p><strong>R:</strong> Sim! Oferecemos [X] dias de teste gratuito sem compromisso. Você não precisa informar dados do cartão para começar.</p>

<p><strong>P: Posso cancelar a qualquer momento?</strong></p>
<p><strong>R:</strong> Sim, você pode cancelar sua assinatura a qualquer momento sem multas ou taxas. O acesso continuará até o final do período pago.</p>

<hr>

<h2 id="acesso">🔐 Acesso e Login</h2>

<p><strong>P: Como faço para criar minha conta?</strong></p>
<p><strong>R:</strong> Para criar sua conta:</p>
<ol>
<li>Acesse nosso site [URL]</li>
<li>Clique em "Cadastre-se" ou "Criar Conta"</li>
<li>Preencha seus dados: nome, e-mail e senha</li>
<li>Confirme seu e-mail clicando no link que enviaremos</li>
<li>Pronto! Você já pode acessar com suas credenciais</li>
</ol>

<p><strong>P: Esqueci minha senha. Como recuperá-la?</strong></p>
<p><strong>R:</strong> Para recuperar sua senha:</p>
<ol>
<li>Na página de login, clique em "Esqueci minha senha"</li>
<li>Informe seu e-mail cadastrado</li>
<li>Receberá um e-mail com instruções para redefinir</li>
<li>Crie uma nova senha segura</li>
<li>Utilize a nova senha para acessar sua conta</li>
</ol>

<p><strong>P: Posso alterar meu e-mail de acesso?</strong></p>
<p><strong>R:</strong> Sim. Para alterar seu e-mail:</p>
<ol>
<li>Faça login com seu e-mail atual</li>
<li>Vá em Configurações > Perfil</li>
<li>Clique em "Alterar E-mail"</li>
<li>Informe o novo e-mail e confirme sua senha atual</li>
<li>Valide o novo e-mail através do link enviado</li>
</ol>

<p><strong>P: O que fazer se minha conta foi bloqueada?</strong></p>
<p><strong>R:</strong> Contas podem ser bloqueadas por [motivos]. Para desbloquear:</p>
<ul>
<li>Aguarde [X minutos] após tentativas falhas</li>
<li>Verifique se há e-mail de notificação de segurança</li>
<li>Contate nosso suporte se o problema persistir</li>
<li>Em casos de suspeita de fraude, altere imediatamente sua senha</li>
</ul>

<hr>

<h2 id="funcionalidades">⚙️ Funcionalidades</h2>

<p><strong>P: Como funciona [funcionalidade principal]?</strong></p>
<p><strong>R:</strong> [Funcionalidade] permite que você [descrição do que faz]. Para utilizá-la:</p>
<ol>
<li>Acesse o menu [nome do menu]</li>
<li>Clique em [botão/opção]</li>
<li>Configure [parâmetros necessários]</li>
<li>Execute [ação principal]</li>
<li>Monitore os resultados em [local]</li>
</ol>

<p><strong>P: Posso integrar [nome do produto] com outras ferramentas?</strong></p>
<p><strong>R:</strong> Sim! Oferecemos integrações com:</p>
<ul>
<li>[Ferramenta 1] - Para [funcionalidade]</li>
<li>[Ferramenta 2] - Para [funcionalidade]</li>
<li>[Ferramenta 3] - Para [funcionalidade]</li>
</ul>
<p>Veja nosso guia de integrações em [link].</p>

<p><strong>P: Como exportar meus dados?</strong></p>
<p><strong>R:</strong> Para exportar seus dados:</p>
<ol>
<li>Vá em Configurações > Meus Dados</li>
<li>Selecione o formato desejado (CSV, Excel, PDF)</li>
<li>Escolha o período dos dados</li>
<li>Clique em "Exportar"</li>
<li>Receberá o arquivo por e-mail em até 24 horas</li>
</ol>

<p><strong>P: Existe limite de armazenamento?</strong></p>
<p><strong>R:</strong> O limite depende do seu plano:</p>
<ul>
<li><strong>Básico:</strong> [X] GB</li>
<li><strong>Profissional:</strong> [X] GB</li>
<li><strong>Enterprise:</strong> Ilimitado</li>
</ul>

<hr>

<h2 id="tecnico">🔧 Técnico</h2>

<p><strong>P: Quais navegadores são compatíveis?</strong></p>
<p><strong>R:</strong> Nossa plataforma é compatível com:</p>
<ul>
<li>Chrome (versão 90 ou superior)</li>
<li>Firefox (versão 88 ou superior)</li>
<li>Safari (versão 14 ou superior)</li>
<li>Edge (versão 90 ou superior)</li>
</ul>
<p>Recomendamos manter o navegador sempre atualizado para melhor performance.</p>

<p><strong>P: O sistema funciona no celular?</strong></p>
<p><strong>R:</strong> Sim! Nosso site é responsivo e funciona bem em smartphones. Também oferecemos aplicativos para:</p>
<ul>
<li>Android (versão 8.0+)</li>
<li>iOS (versão 13.0+)</li>
</ul>

<p><strong>P: Como resolver problemas de lentidão?</strong></p>
<p><strong>R:</strong> Se o sistema estiver lento:</p>
<ol>
<li>Verifique sua conexão com a internet</li>
<li>Limpe o cache e cookies do navegador</li>
<li>Feche outras abas e programas</li>
<li>Reinicie seu dispositivo</li>
<li>Use um navegador diferente</li>
<li>Verifique nosso status de serviços em [link]</li>
</ol>

<p><strong>P: O que fazer se aparecem mensagens de erro?</strong></p>
<p><strong>R:</strong> Para resolver erros:</p>
<ul>
<li><strong>Erro 404:</strong> Página não encontrada - verifique a URL</li>
<li><strong>Erro 500:</strong> Erro interno - aguarde e tente novamente</li>
<li><strong>Erro de conexão:</strong> Verifique sua internet</li>
<li><strong>Erro de login:</strong> Confirme usuário e senha</li>
</ul>
<p>Se o erro persistir, anote o código e contate o suporte.</p>

<hr>

<h2 id="pagamento">💰 Pagamento</h2>

<p><strong>P: Quais formas de pagamento aceitam?</strong></p>
<p><strong>R:</strong> Aceitamos:</p>
<ul>
<li>Cartão de crédito (Visa, Mastercard, Elo, Amex)</li>
<li>Cartão de débito (funciona como crédito)</li>
<li>Boleto bancário (à vista com 3% de desconto)</li>
<li>Pix (transferência instantânea)</li>
<li>PayPal (internacional)</li>
</ul>

<p><strong>P: Posso alterar meu plano?</strong></p>
<p><strong>R:</strong> Sim! Você pode:</p>
<ul>
<li><strong>Upgrade:</strong> Imediato, com proporcional do valor</li>
<li><strong>Downgrade:</strong> Válido para o próximo ciclo de cobrança</li>
</ul>
<p>As alterações podem ser feitas em Configurações > Plano.</p>

<p><strong>Como funciona o reembolso?</strong></p>
<p><strong>R:</strong> Nossa política de reembolso:</p>
<ul>
<li><strong>7 dias corridos:</strong> Reembolso integral sem justificativa</li>
<li><strong>30 dias corridos:</strong> Reembolso proporcional se houver problemas técnicos comprovados</li>
<li><strong>Após 30 dias:</strong> Não há reembolso, mas você pode cancelar</li>
</ul>

<p><strong>P: A fatura é emitida automaticamente?</strong></p>
<p><strong>R:</strong> Sim! As faturas são geradas automaticamente e enviadas para seu e-mail cadastrado até o 5º dia útil de cada mês. Você também pode acessar todas as faturas em Configurações > Faturas.</p>

<hr>

<h2 id="suporte">🆘 Suporte</h2>

<p><strong>P: Como entrar em contato com o suporte?</strong></p>
<p><strong>R:</strong> Oferecemos vários canais de atendimento:</p>
<ul>
<li><strong>Chat Online:</strong> Segunda a Sexta, 8h às 18h</li>
<li><strong>E-mail:</strong> suporte@empresa.com (resposta em até 24h)</li>
<li><strong>Telefone:</strong> (xx) xxxx-xxxx (Seg-Sex, 8h-18h)</li>
<li><strong>Central de Ajuda:</strong> [link para artigos detalhados]</li>
<li><strong>Comunidade:</strong> [link para fórum/community]</li>
</ul>

<p><strong>P: Qual o tempo médio de resposta do suporte?</strong></p>
<p><strong>R:</strong> Nossos tempos médios são:</p>
<ul>
<li><strong>Chat:</strong> Imediato durante horário comercial</li>
<li><strong>E-mail:</strong> Até 4 horas para urgentes, 24h para gerais</li>
<li><strong>Telefone:</strong> Máximo 5 minutos de espera</li>
</ul>

<p><strong>P: Como solicitar novas funcionalidades?</strong></p>
<p><strong>R:</strong> Amamos receber sugestões! Você pode:</p>
<ol>
<li>Enviar e-mail para feedback@empresa.com</li>
<li>Usar o formulário "Sugestões" no painel</li>
<li>Participar de nossas pesquisas anuais</li>
<li>Votar em sugestões da comunidade</li>
</ol>

<p><strong>P: Onde encontrar mais informações?</strong></p>
<p><strong>R:</strong> Recursos adicionais:</p>
<ul>
<li><strong>Tutoriais em vídeo:</strong> [link para canal YouTube]</li>
<li><strong>Webinars gratuitos:</strong> [link para agenda]</li>
<li><strong>Base de conhecimento:</strong> [link para artigos detalhados]</li>
<li><strong>API Documentation:</strong> [link para desenvolvedores]</li>
</ul>

<hr>

<h2>📞 Informações de Contato</h2>
<table>
<tr><td><strong>E-mail Principal:</strong></td><td>suporte@empresa.com</td></tr>
<tr><td><strong>Telefone:</strong></td><td>(xx) xxxx-xxxx</td></tr>
<tr><td><strong>WhatsApp:</strong></td><td>(xx) xxxx-xxxx</td></tr>
<tr><td><strong>Endereço:</strong></td><td>[Rua, Número, Cidade, Estado, CEP]</td></tr>
<tr><td><strong>Horário de Atendimento:</strong></td><td>Seg-Sex: 8h-18h (horário de Brasília)</td></tr>
</table>

<h2>📝 Última Atualização</h2>
<p>Este FAQ foi atualizado em [data] e está sempre em evolução para melhor atendê-lo. Volte sempre para consultar as novidades!</p>

<h2>💡 Dica Rápida</h2>
<p>Use Ctrl+F (ou Cmd+F no Mac) para buscar rapidamente por palavras-chave neste documento!</p>',
  ARRAY['faq', 'perguntas', 'ajuda'],
  true,
  null,
  80,
  true,
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
  id, name, category, description, icon, content, tags, is_global, department_id, usage_count, is_active, created_at, updated_at
) VALUES (
  'tpl_meeting',
  'Ata de Reunião',
  'MEETING_MINUTES',
  'Registro de discussões e decisões em reuniões.',
  'calendar',
  '<h1>Ata de Reunião</h1>

<h2>1. Informações Gerais</h2>
<table>
<tr><td><strong>Número da Ata:</strong></td><td>ATA-[YYYYMMDD]-[NN]</td></tr>
<tr><td><strong>Data da Reunião:</strong></td><td>[Dia] de [Mês] de [Ano]</td></tr>
<tr><td><strong>Horário de Início:</strong></td><td>[HH:MM]</td></tr>
<tr><td><strong>Horário de Término:</strong></td><td>[HH:MM]</td></tr>
<tr><td><strong>Duração:</strong></td><td>[X horas e Y minutos]</td></tr>
<tr><td><strong>Local:</strong></td><td>[Sala/Local - Endereço completo]</td></tr>
<tr><td><strong>Tipo de Reunião:</strong></td><td>[ ] Ordinária [ ] Extraordinária [ ] Emergencial</td></tr>
<tr><td><strong>Formato:</strong></td><td>[ ] Presencial [ ] Virtual [ ] Híbrido</td></tr>
<tr><td><strong>Plataforma (se virtual):</strong></td><td>[Zoom/Teams/Meet/outro]</td></tr>
<tr><td><strong>Convocado por:</strong></td><td>[Nome e cargo]</td></tr>
<tr><td><strong>Secretário(a):</strong></td><td>[Nome e cargo - responsável pela ata]</td></tr>
</table>

<h2>2. Participantes</h2>
<h3>2.1. Presentes</h3>
<table>
<tr><th>Nome</th><th>Cargo/Função</th><th>Departamento/Setor</th><th>E-mail</th><th>Assinatura</th></tr>
<tr><td>[Nome Completo 1]</td><td>[Cargo]</td><td>[Departamento]</td><td>[e-mail]</td><td></td></tr>
<tr><td>[Nome Completo 2]</td><td>[Cargo]</td><td>[Departamento]</td><td>[e-mail]</td><td></td></tr>
<tr><td>[Nome Completo 3]</td><td>[Cargo]</td><td>[Departamento]</td><td>[e-mail]</td><td></td></tr>
</table>

<h3>2.2. Ausentes com Justificativa</h3>
<table>
<tr><th>Nome</th><th>Cargo</th><th>Motivo da Ausência</th></tr>
<tr><td>[Nome 1]</td><td>[Cargo]</td><td>[Motivo]</td></tr>
<tr><td>[Nome 2]</td><td>[Cargo]</td><td>[Motivo]</td></tr>
</table>

<h3>2.3. Ausentes sem Justificativa</h3>
<table>
<tr><th>Nome</th><th>Cargo</th></tr>
<tr><td>[Nome 1]</td><td>[Cargo]</td></tr>
<tr><td>[Nome 2]</td><td>[Cargo]</td></tr>
</table>

<h3>2.4. Convidados Especiais</h3>
<table>
<tr><th>Nome</th><th>Instituição/Empresa</th><th>Motivo da Presença</th></tr>
<tr><td>[Nome]</td><td>[Empresa]</td><td>[Motivo]</td></tr>
</table>

<h2>3. Pauta da Reunião</h3>
<table>
<tr><th>Nº</th><th>Assunto</th><th>Tipo</th><th>Tempo Estimado</th><th>Responsável pela Apresentação</th></tr>
<tr><td>1</td><td>[Assunto 1]</td><td>[Discussão/Decisão/Informação]</td><td>[X min]</td><td>[Nome]</td></tr>
<tr><td>2</td><td>[Assunto 2]</td><td>[Discussão/Decisão/Informação]</td><td>[X min]</td><td>[Nome]</td></tr>
<tr><td>3</td><td>[Assunto 3]</td><td>[Discussão/Decisão/Informação]</td><td>[X min]</td><td>[Nome]</td></tr>
<tr><td>4</td><td>Assuntos Gerais/Outros</td><td>Discussão</td><td>[X min]</td><td>Todos</td></tr>
</table>

<h2>4. Desenvolvimento da Reunião</h2>

<h3>4.1. Abertura</h3>
<p>A reunião foi iniciada às [HH:MM] com a presença de [X] participantes. O(a) secretário(a) [Nome] foi designado(a) para lavrar a ata.</p>

<h3>4.2. Leitura e Aprovação da Ata Anterior</h3>
<p><strong>Ata anterior:</strong> [Número/Nome] de [Data]</p>
<p><strong>Aprovação:</strong> [ ] Aprovada por unanimidade [ ] Aprovada com ajustes [ ] Reprovada</p>
<p><strong>Observações:</strong> [Se houve ajustes ou rejeição, descrever]</p>

<h3>4.3. Discussão dos Assuntos</h3>

<h4>Assunto 1: [Título completo do assunto]</h4>
<p><strong>Apresentado por:</strong> [Nome e cargo]</p>
<p><strong>Resumo da apresentação:</strong> [Descrição objetiva do que foi apresentado]</p>
<p><strong>Principais pontos discutidos:</strong></p>
<ul>
<li>[Ponto 1] - [Resumo da discussão]</li>
<li>[Ponto 2] - [Resumo da discussão]</li>
<li>[Ponto 3] - [Resumo da discussão]</li>
</ul>
<p><strong>Votação (se aplicável):</strong></p>
<ul>
<li><strong>Favoráveis:</strong> [X] participantes</li>
<li><strong>Contrários:</strong> [X] participantes</li>
<li><strong>Abstenções:</strong> [X] participantes</li>
</ul>
<p><strong>Decisão tomada:</strong> [Descrição clara da decisão final]</p>
<p><strong>Justificativa:</strong> [Motivo da decisão, se houver]</p>

<h4>Assunto 2: [Título completo do assunto]</h4>
<p><strong>Apresentado por:</strong> [Nome e cargo]</p>
<p><strong>Resumo da apresentação:</strong> [Descrição objetiva]</p>
<p><strong>Principais pontos discutidos:</strong></p>
<ul>
<li>[Ponto 1] - [Resumo]</li>
<li>[Ponto 2] - [Resumo]</li>
</ul>
<p><strong>Decisão tomada:</strong> [Descrição clara]</p>

<h4>Assunto 3: [Título completo do assunto]</h4>
<p><strong>Apresentado por:</strong> [Nome e cargo]</p>
<p><strong>Resumo da apresentação:</strong> [Descrição objetiva]</p>
<p><strong>Principais pontos discutidos:</strong></p>
<ul>
<li>[Ponto 1] - [Resumo]</li>
<li>[Ponto 2] - [Resumo]</li>
</ul>
<p><strong>Decisão tomada:</strong> [Descrição clara]</p>

<h4>Assuntos Gerais/Outros</h4>
<p><strong>Comentários e sugestões dos participantes:</strong></p>
<ul>
<li>[Nome]: [Comentário/sugestão]</li>
<li>[Nome]: [Comentário/sugestão]</li>
</ul>

<h2>5. Plano de Ação</h2>
<table>
<tr><th>Nº</th><th>Ação/Atividade</th><th>Responsável</th><th>Departamento</th><th>Prazo</th><th>Status</th><th>Observações</th></tr>
<tr><td>1</td><td>[Descrição detalhada da ação 1]</td><td>[Nome]</td><td>[Departamento]</td><td>[DD/MM/AAAA]</td><td>[ ] Pendente [ ] Em Andamento [ ] Concluído</td><td>[Observações]</td></tr>
<tr><td>2</td><td>[Descrição detalhada da ação 2]</td><td>[Nome]</td><td>[Departamento]</td><td>[DD/MM/AAAA]</td><td>[ ] Pendente [ ] Em Andamento [ ] Concluído</td><td>[Observações]</td></tr>
<tr><td>3</td><td>[Descrição detalhada da ação 3]</td><td>[Nome]</td><td>[Departamento]</td><td>[DD/MM/AAAA]</td><td>[ ] Pendente [ ] Em Andamento [ ] Concluído</td><td>[Observações]</td></tr>
</table>

<h2>6. Próxima Reunião</h2>
<table>
<tr><td><strong>Data Sugerida:</strong></td><td>[Dia] de [Mês] de [Ano]</td></tr>
<tr><td><strong>Horário Sugerido:</strong></td><td>[HH:MM]</td></tr>
<tr><td><strong>Local Sugerido:</strong></td><td>[Local]</td></tr>
<tr><td><strong>Formato Sugerido:</strong></td><td>[Presencial/Virtual/Híbrido]</td></tr>
</table>

<h3>6.1. Pauta Sugerida para Próxima Reunião</h3>
<table>
<tr><th>Nº</th><th>Assunto</th><th>Responsável pela Apresentação</th><th>Prioridade</th></tr>
<tr><td>1</td><td>[Assunto importante]</td><td>[Nome]</td><td>[Alta/Média/Baixa]</td></tr>
<tr><td>2</td><td>[Follow-up de decisões anteriores]</td><td>[Nome]</td><td>[Alta/Média/Baixa]</td></tr>
<tr><td>3</td><td>[Novo assunto]</td><td>[Nome]</td><td>[Alta/Média/Baixa]</td></tr>
</table>

<h2>7. Documentos e Anexos</h2>
<table>
<tr><th>Documento</th><th>Tipo</th><th>Responsável</th><th>Disponível em</th></tr>
<tr><td>[Nome do documento 1]</td><td>[Apresentação/Planilha/Relatório]</td><td>[Nome]</td><td>[Link/localização]</td></tr>
<tr><td>[Nome do documento 2]</td><td>[Apresentação/Planilha/Relatório]</td><td>[Nome]</td><td>[Link/localização]</td></tr>
<tr><td>[Gravação da reunião]</td><td>[Vídeo/Áudio]</td><td>[Nome]</td><td>[Link/localização]</td></tr>
</table>

<h2>8. Encerramento</h2>
<p>A reunião foi encerrada às [HH:MM] sem pendências para discussão. Todos os presentes foram convidados a verificar a ata para aprovação via e-mail até [data limite].</p>
<p>Nada mais havendo a tratar, foi lavrada a presente ata que vai assinada.</p>

<hr>

<h2>9. Assinaturas</h2>

<h3>9.1. Assinatura do Presidente/Coordenador</h3>
<p>_________________________________________________________</p>
<p><strong>[Nome Completo]</strong></p>
<p>Cargo: [Cargo completo]</p>
<p>Data: [DD/MM/AAAA]</p>

<h3>9.2. Assinatura do Secretário(a)</h3>
<p>_________________________________________________________</p>
<p><strong>[Nome Completo]</strong></p>
<p>Cargo: [Cargo completo]</p>
<p>Data: [DD/MM/AAAA]</p>

<h3>9.3. Assinaturas dos Participantes</h3>
<table>
<tr><td colspan="4"><strong>Assinamos para fins de ratificação dos termos desta ata:</strong></td></tr>
<tr><td><strong>Nome</strong></td><td colspan="3"><strong>Assinatura</strong></td></tr>
<tr><td>[Nome 1]</td><td colspan="3">_________________________________________________________</td></tr>
<tr><td>[Nome 2]</td><td colspan="3">_________________________________________________________</td></tr>
<tr><td>[Nome 3]</td><td colspan="3">_________________________________________________________</td></tr>
<tr><td>[Nome 4]</td><td colspan="3">_________________________________________________________</td></tr>
</table>

<hr>

<h2>10. Controle de Aprovação</h2>
<table>
<tr><td><strong>Data de Envio para Aprovação:</strong></td><td>[DD/MM/AAAA]</td></tr>
<tr><td><strong>Prazo para Manifestação:</strong></td><td>[X] dias corridos</td></tr>
<tr><td><strong>Aprovado em:</strong></td><td>[DD/MM/AAAA]</td></tr>
<tr><td><strong>Protocolo:</strong></td><td>[Número de protocolo]</td></tr>
</table>

<h2>11. Observações Finais</h2>
<p>[Qualquer observação adicional ou esclarecimento necessário sobre o conteúdo da ata ou circunstâncias especiais da reunião]</p>

<h2>12. Distribuição</h2>
<p>Esta ata será distribuída para:</p>
<ul>
<li>Todos os participantes presentes</li>
<li>Coordenadores dos departamentos envolvidos</li>
<li>Diretoria da área</li>
<li>Arquivo central de atas da empresa</li>
</ul>

<p><strong>Arquivamento:</strong> Pasta de atas - [localização física/digital]</p>
<p><strong>Retenção:</strong> 5 anos conforme política de documentação</p>',
  ARRAY['reunião', 'ata', 'decisão'],
  true,
  null,
  200,
  true,
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
  id, name, category, description, icon, content, tags, is_global, department_id, usage_count, is_active, created_at, updated_at
) VALUES (
  'tpl_kb_article',
  'Artigo de Conhecimento',
  'KB_ARTICLE',
  'Documentação técnica e artigos de conhecimento.',
  'book-open',
  '<h1>Artigo de Conhecimento</h1>

<div style="background: #f0f8ff; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0;">
  <h2 style="margin-top: 0; color: #1976d2;">📋 Resumo Executivo</h2>
  <p>Este artigo aborda [tema principal] de forma detalhada, fornecendo [benefício principal]. Ao final desta leitura, você será capaz de [habilidade específica] e [outra habilidade específica]. Ideal para [público-alvo] e profissionais que atuam em [área de atuação].</p>
</div>

<h2>🎯 Objetivos de Aprendizagem</h2>
<p>Ao concluir este artigo, você compreenderá:</p>
<ul>
<li>✅ [Objetivo 1 - claro e mensurável]</li>
<li>✅ [Objetivo 2 - claro e mensurável]</li>
<li>✅ [Objetivo 3 - claro e mensurável]</li>
<li>✅ [Objetivo 4 - claro e mensurável]</li>
</ul>

<h2>📚 Introdução</h2>
<p>O tema [tema principal] tornou-se essencial no contexto atual de [contexto]. Segundo pesquisas recentes, [estatística relevante] dos profissionais enfrentam desafios relacionados a [problema que o artigo resolve]. Este artigo foi desenvolvido para fornecer soluções práticas e baseadas em evidências para [propósito principal].</p>

<p>Importante destacar que [contexto histórico ou relevância do tema]. A compreensão adequada deste conceito impacta diretamente [áreas impactadas], resultando em [benefícios diretos e indiretos].</p>

<h2>🔧 Pré-requisitos Necessários</h2>
<div style="background: #f9f9f9; border: 1px solid #ddd; padding: 15px; border-radius: 5px;">
  <h3>Conhecimentos Essenciais</h3>
  <ul>
    <li><strong>[Conhecimento 1]:</strong> [Descrição detalhada do conhecimento necessário]</li>
    <li><strong>[Conhecimento 2]:</strong> [Descrição detalhada do conhecimento necessário]</li>
    <li><strong>[Conhecimento 3]:</strong> [Descrição detalhada do conhecimento necessário]</li>
  </ul>

  <h3>Ferramentas e Recursos</h3>
  <ul>
    <li><strong>[Ferramenta 1]:</strong> Versão mínima [X] - [Finalidade]</li>
    <li><strong>[Ferramenta 2]:</strong> Licença [gratuita/paga] - [Finalidade]</li>
    <li><strong>[Ferramenta 3]:</strong> Acesso necessário - [Finalidade]</li>
  </ul>

  <h3>Permissões e Acessos</h3>
  <ul>
    <li>Acesso ao [sistema/plataforma]</li>
    <li>Permissão de [tipo de acesso]</li>
    <li>Credenciais de [serviço específico]</li>
  </ul>
</div>

<h2>🏗️ Fundamentação Teórica</h2>

<h3>📖 Conceitos Fundamentais</h3>
<p><strong>[Conceito 1]:</strong> [Definição clara e detalhada do primeiro conceito fundamental]. Este conceito é importante porque [razão da importância].</p>

<p><strong>[Conceito 2]:</strong> [Definição clara e detalhada do segundo conceito fundamental]. A aplicação correta deste conceito permite [benefício direto].</p>

<h3>🔬 Princípios e Boas Práticas</h3>
<p>Baseando-se em [fonte/autoridade], os seguintes princípios devem ser considerados:</p>
<ol>
  <li><strong>Princípio 1:</strong> [Nome e descrição detalhada]</li>
  <li><strong>Princípio 2:</strong> [Nome e descrição detalhada]</li>
  <li><strong>Princípio 3:</strong> [Nome e descrição detalhada]</li>
</ol>

<h2>📝 Procedimento Detalhado</h2>

<h3>🚀 Etapa 1: [Nome da primeira etapa principal]</h3>
<div style="background: #e8f5e8; border-left: 4px solid #4caf50; padding: 15px; margin: 10px 0;">
  <h4 style="margin-top: 0;">✅ Checklist Inicial</h4>
  <ul>
    <li>[ ] Verificar [item de verificação 1]</li>
    <li>[ ] Confirmar [item de verificação 2]</li>
    <li>[ ] Validar [item de verificação 3]</li>
  </ul>
</div>

<p><strong>Ação Principal:</strong> Descreva detalhadamente a primeira ação principal. Use linguagem clara e objetiva.</p>

<p><strong>Sub-passo 1.1:</strong> [Descrição detalhada do primeiro sub-passo]</p>
<ul>
  <li><strong>Ponto crítico:</strong> [Observação importante sobre este sub-passo]</li>
  <li><strong>Duração estimada:</strong> [X minutos/horas]</li>
  <li><strong>Materiais necessários:</strong> [Lista de materiais]</li>
</ul>

<p><strong>Sub-passo 1.2:</strong> [Descrição detalhada do segundo sub-passo]</p>
<ul>
  <li><strong>Ponto crítico:</strong> [Observação importante sobre este sub-passo]</li>
  <li><strong>Duração estimada:</strong> [X minutos/horas]</li>
  <li><strong>Materiais necessários:</strong> [Lista de materiais]</li>
</ul>

<div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 10px 0;">
  <h4 style="margin-top: 0;">💡 Dica Especial</h4>
  <p>[Dica valiosa ou atalho que pode otimizar o processo nesta etapa]</p>
</div>

<h3>🔄 Etapa 2: [Nome da segunda etapa principal]</h3>
<p><strong>Ação Principal:</strong> [Descrição detalhada da segunda ação principal]</p>

<p><strong>Sub-passo 2.1:</strong> [Descrição detalhada]</p>
<ul>
  <li><strong>Validação necessária:</strong> [O que precisa ser verificado]</li>
  <li><strong>Risco de erro:</strong> [Possíveis problemas e como evitá-los]</li>
</ul>

<p><strong>Sub-passo 2.2:</strong> [Descrição detalhada]</p>
<ul>
  <li><strong>Validação necessária:</strong> [O que precisa ser verificado]</li>
  <li><strong>Risco de erro:</strong> [Possíveis problemas e como evitá-los]</li>
</ul>

<h3>🎯 Etapa 3: [Nome da terceira etapa principal]</h3>
<p><strong>Ação Principal:</strong> [Descrição detalhada da terceira ação principal]</p>

<div style="background: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 10px 0;">
  <h4 style="margin-top: 0;">⚠️ Ponto de Atenção</h4>
  <p>[Aviso importante sobre riscos ou cuidados especiais nesta etapa]</p>
</div>

<h2>🔧 Validação e Testes</h2>
<p>Após concluir os procedimentos principais, execute as seguintes validações:</p>

<h3>✅ Lista de Verificação Final</h3>
<table>
  <tr><th>Item</th><th>Status</th><th>Observações</th></tr>
  <tr><td>[Item de verificação 1]</td><td>[ ] Concluído</td><td>[Espaço para anotações]</td></tr>
  <tr><td>[Item de verificação 2]</td><td>[ ] Concluído</td><td>[Espaço para anotações]</td></tr>
  <tr><td>[Item de verificação 3]</td><td>[ ] Concluído</td><td>[Espaço para anotações]</td></tr>
  <tr><td>[Item de verificação 4]</td><td>[ ] Concluído</td><td>[Espaço para anotações]</td></tr>
</table>

<h3>🧪 Teste de Funcionalidade</h3>
<p>Para garantir que tudo funciona corretamente:</p>
<ol>
  <li><strong>Teste 1:</strong> [Descrição do primeiro teste]</li>
  <li><strong>Teste 2:</strong> [Descrição do segundo teste]</li>
  <li><strong>Teste 3:</strong> [Descrição do terceiro teste]</li>
</ol>

<h2>🛠️ Troubleshooting (Resolução de Problemas)</h2>

<h3>❓ Problemas Comuns e Soluções</h3>
<div style="background: #f8f9fa; border: 1px solid #dee2e6; padding: 15px; border-radius: 5px;">
  <p><strong>🚨 Problema 1: [Nome do problema comum]</strong></p>
  <p><strong>Sintomas:</strong> [Como o problema se manifesta]</p>
  <p><strong>Causas prováveis:</strong></p>
  <ul>
    <li>[Causa 1]</li>
    <li>[Causa 2]</li>
  </ul>
  <p><strong>Solução:</strong> [Passo a passo para resolver]</p>
  <p><strong>Prevenção:</strong> [Como evitar que ocorra novamente]</p>
</div>

<div style="background: #f8f9fa; border: 1px solid #dee2e6; padding: 15px; border-radius: 5px;">
  <p><strong>🚨 Problema 2: [Nome do segundo problema comum]</strong></p>
  <p><strong>Sintomas:</strong> [Como o problema se manifesta]</p>
  <p><strong>Causas prováveis:</strong></p>
  <ul>
    <li>[Causa 1]</li>
    <li>[Causa 2]</li>
  </ul>
  <p><strong>Solução:</strong> [Passo a passo para resolver]</p>
  <p><strong>Prevenção:</strong> [Como evitar que ocorra novamente]</p>
</div>

<h3>📞 Quando Buscar Ajuda</h3>
<p>Procure suporte especializado quando:</p>
<ul>
  <li>Os problemas persistirem após tentar as soluções acima</li>
  <li>Encontrar mensagens de erro desconhecidas</li>
  <li>O sistema apresentar comportamento anormal</li>
  <li>Segurança dos dados estiver comprometida</li>
</ul>

<h2>📊 Métricas e Indicadores</h2>
<p>Para medir o sucesso da implementação:</p>

<h3>📈 KPIs (Indicadores-Chave de Performance)</h3>
<table>
  <tr><th>Métrica</th><th>Meta</th><th>Como Medir</th><th>Frequência</th></tr>
  <tr><td>[Métrica 1]</td><td>[Valor da meta]</td><td>[Método de medição]</td><td>[Frequência]</td></tr>
  <tr><td>[Métrica 2]</td><td>[Valor da meta]</td><td>[Método de medição]</td><td>[Frequência]</td></tr>
  <tr><td>[Métrica 3]</td><td>[Valor da meta]</td><td>[Método de medição]</td><td>[Frequência]</td></tr>
</table>

<h2>📚 Referências e Recursos Adicionais</h2>

<h3>📖 Bibliografia Recomendada</h3>
<ul>
  <li><strong>[Livro 1]:</strong> [Autor]. <em>[Título]</em>. [Editora], [Ano].</li>
  <li><strong>[Livro 2]:</strong> [Autor]. <em>[Título]</em>. [Editora], [Ano].</li>
</ul>

<h3>🔗 Recursos Online</h3>
<ul>
  <li><strong>[Recurso 1]:</strong> <a href="[URL]" target="_blank">[Título do link]</a> - [Breve descrição]</li>
  <li><strong>[Recurso 2]:</strong> <a href="[URL]" target="_blank">[Título do link]</a> - [Breve descrição]</li>
  <li><strong>[Recurso 3]:</strong> <a href="[URL]" target="_blank">[Título do link]</a> - [Breve descrição]</li>
</ul>

<h3>📄 Documentos Internos</h3>
<ul>
  <li><strong>[Documento 1]:</strong> [Código/Nome] - [Descrição]</li>
  <li><strong>[Documento 2]:</strong> [Código/Nome] - [Descrição]</li>
</ul>

<h2>🔄 Histórico de Atualizações</h2>
<table>
  <tr><th>Versão</th><th>Data</th><th>Alterações</th><th>Autor</th></tr>
  <tr><td>1.0</td><td>[Data inicial]</td><td>Versão inicial do artigo</td><td>[Nome do autor]</td></tr>
  <tr><td>1.1</td><td>[Data]</td><td>[Descrição das alterações]</td><td>[Nome do autor]</td></tr>
  <tr><td>1.2</td><td>[Data]</td><td>[Descrição das alterações]</td><td>[Nome do autor]</td></tr>
</table>

<h2>💬 Feedback e Contribuições</h2>
<div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0;">
  <h3 style="margin-top: 0;">📝 Como Contribuir</h3>
  <p>Este artigo é um documento vivo e pode ser aprimorado. Para contribuir:</p>
  <ul>
    <li>Envie sugestões para [e-mail de feedback]</li>
    <li>Abra uma issue no repositório [se aplicável]</li>
    <li>Participe das discussões na comunidade [link]</li>
  </ul>
</div>

<h3>🤔 Questões para Reflexão</h3>
<p>Para aplicar melhor o conhecimento adquirido:</p>
<ol>
  <li>Como [pergunta reflexiva 1]?</li>
  <li>De que forma [pergunta reflexiva 2]?</li>
  <li>Quais obstáculos podem surgir ao [pergunta reflexiva 3]?</li>
</ol>

<h2>📋 Conclusão</h2>
<p>Neste artigo, abordamos de forma detalhada [resumo dos pontos principais]. A implementação correta destes procedimentos resultará em [benefícios principais]. Lembre-se de que [mensagem final motivacional ou de precaução].</p>

<p>Para mais informações ou dúvidas, consulte os recursos adicionais ou entre em contato com [contato/equipe responsável].</p>

<hr>

<div style="text-align: center; font-style: italic; color: #666;">
  <p>Este artigo faz parte do Programa de Desenvolvimento de Competências [Nome do programa].</p>
  <p>Última atualização: [Data de hoje]</p>
</div>',
  ARRAY['conhecimento', 'documentação', 'técnico'],
  true,
  null,
  150,
  true,
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
  id, name, category, description, icon, content, tags, is_global, department_id, usage_count, is_active, created_at, updated_at
) VALUES (
  'tpl_onboarding',
  'Onboarding',
  'ONBOARDING',
  'Guia de integração para novos colaboradores.',
  'user-plus',
  '<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; margin: 20px 0; border-radius: 10px;">
  <h1 style="margin: 0; font-size: 2.5em;">🎉 Bem-vindo(a) à Equipe!</h1>
  <p style="font-size: 1.2em; margin: 10px 0;">Estamos muito felizes em ter você conosco!</p>
  <p><strong>[Nome do Colaborador]</strong> | <strong>[Cargo]</strong> | <strong>[Departamento]</strong></p>
</div>

<h2>📅 Cronograma de Integração</h2>
<p>Seu processo de onboarding foi cuidadosamente planejado para garantir sua adaptação e sucesso. Este programa tem duração de 30 dias e é dividido em fases progressivas.</p>

<h3>📋 Objetivos do Programa</h3>
<ul>
<li>✅ Integração cultural com valores e missão da empresa</li>
<li>✅ Domínio dos sistemas e ferramentas essenciais</li>
<li>✅ Compreensão dos processos e políticas internas</li>
<li>✅ Desenvolvimento das competências técnicas necessárias</li>
<li>✅ Construção de relacionamentos interpessoais</li>
<li>✅ Alinhamento com metas e expectativas do cargo</li>
</ul>

<hr>

<h2>🌟 DIA 1: Primeiros Passos Fundamentais</h2>

<div style="background: #e8f5e8; border: 1px solid #c3e6c3; padding: 20px; border-radius: 8px; margin: 20px 0;">
  <h3 style="color: #2e7d32; margin-top: 0;">🌅 Manhã (8:00 - 12:00)</h3>
  
  <h4>8:00 - 8:30 | Recepção e Boas-vindas</h4>
  <ul>
    <li>Check-in com RH na recepção</li>
    <li>Entrega do kit de boas-vindas</li>
    <li>Apresentação do espaço físico</li>
    <li>Configuração do crachá e acessos</li>
  </ul>

  <h4>8:30 - 9:30 | Reunião com Gestor</h4>
  <ul>
    <li>Apresentação formal e objetivos do cargo</li>
    <li>Alinhamento sobre expectativas mútuas</li>
    <li>Entrega do plano de integração personalizado</li>
    <li>Agendamento das reuniões de acompanhamento</li>
  </ul>

  <h4>9:30 - 11:00 | Apresentação da Equipe</h4>
  <ul>
    <li>Reunião com todos os membros da equipe</li>
    <li>Apresentação individual com funções e responsabilidades</li>
    <li>Estabelecimento de canais de comunicação</li>
    <li>Tour pelo ambiente de trabalho</li>
  </ul>

  <h4>11:00 - 12:00 | Setup Técnico Inicial</h4>
  <ul>
    <li>Configuração da estação de trabalho</li>
    <li>Instalação e ativação de softwares essenciais</li>
    <li>Criação e verificação de contas de acesso</li>
    <li>Teste de conectividade e periféricos</li>
  </ul>
</div>

<div style="background: #e3f2fd; border: 1px solid #bbdefb; padding: 20px; border-radius: 8px; margin: 20px 0;">
  <h3 style="color: #1565c0; margin-top: 0;">🌇️ Tarde (13:00 - 18:00)</h3>
  
  <h4>13:00 - 14:30 | Sistemas e Ferramentas</h4>
  <ul>
    <li>Treinamento inicial nos sistemas corporativos</li>
    <li>Configuração de e-mail e perfil no Teams/Slack</li>
    <li>Acesso ao sistema de gestão e intranet</li>
    <li>Exploração dos principais aplicativos</li>
  </ul>

  <h4>14:30 - 16:00 | Políticas e Cultura</h4>
  <ul>
    <li>Apresentação do Manual do Colaborador</li>
    <li>Diretrizes de segurança da informação</li>
    <li>Códigos de conduta e ética</li>
    <li>Benefícios e programas corporativos</li>
  </ul>

  <h4>16:00 - 17:30 | Primeira Atividade Prática</h4>
  <ul>
    <li>Acompanhamento com mentor designado</li>
    <li>Observação de processos em execução</li>
    <li>Pequenas tarefas supervisionadas</li>
    <li>Resolução de dúvidas iniciais</li>
  </ul>

  <h4>17:30 - 18:00 | Encerramento e Feedback</h4>
  <ul>
    <li>Checkpoint diário com o gestor</li>
    <li>Registro de aprendizados e dificuldades</li>
    <li>Planejamento do Dia 2</li>
    <li>Verificação de tarefas pendentes</li>
  </ul>
</div>

<hr>

<h2>📚 SEMANA 1: Imersão Cultural e Processual</h2>

<div style="background: #fff3e0; border: 1px solid #ffe0b2; padding: 20px; border-radius: 8px; margin: 20px 0;">
  <h3 style="color: #e65100; margin-top: 0;">📖 Dias 2-3 | Fundamentos Corporativos</h3>
  
  <h4>Conteúdo Programático</h4>
  <ul>
    <li><strong>História e Valores:</strong> Missão, Visão e Valores da empresa</li>
    <li><strong>Estrutura Organizacional:</strong> Departamentos e hierarquia</li>
    <li><strong>Políticas Internas:</strong> RH, TI, Comunicação e Segurança</li>
    <li><strong>Processos Básicos:</strong> Solicitações, aprovações e reports</li>
  </ul>

  <h4>Atividades de Integração</h4>
  <ul>
    <li>Participação em reuniões de equipe</li>
    <li>Almoço com diferentes grupos de colegas</li>
    <li>Exploração da intranet e portais internos</li>
    <li>Complementação de formulários de perfil</li>
  </ul>
</div>

<div style="background: #f3e5f5; border: 1px solid #e1bee7; padding: 20px; border-radius: 8px; margin: 20px 0;">
  <h3 style="color: #6a1b9a; margin-top: 0;">💻 Dias 4-5 | Capacitação Técnica</h3>
  
  <h4>Sistemas Especializados</h4>
  <ul>
    <li><strong>[Sistema 1]:</strong> Módulos básicos e operação essencial</li>
    <li><strong>[Sistema 2]:</strong> Funcionalidades do seu departamento</li>
    <li><strong>[Ferramenta 1]:</strong> Comunicação e colaboração</li>
    <li><strong>[Ferramenta 2]:</strong> Produtividade e gestão</li>
  </ul>

  <h4>Prática Supervisionada</h4>
  <ul>
    <li>Execução de tarefas com acompanhamento</li>
    <li>Simulações de cenários reais</li>
    <li>Resolução de exercícios práticos</li>
    <li>Avaliação formativa de aprendizado</li>
  </ul>
</div>

<hr>

<h2>🚀 SEMANAS 2-3: Desenvolvimento de Competências</h2>

<h3>🎯 Metas da Fase</h3>
<table>
  <tr><th>Área</th><th>Competência</th><th>Nível Esperado</th><th>Como Avaliar</th></tr>
  <tr><td>Técnica</td><td>[Competência técnica 1]</td><td>Básico/Intermediário</td><td>[Método de avaliação]</td></tr>
  <tr><td>Interpessoal</td><td>Comunicação</td><td>Efetiva</td><td>[Método de avaliação]</td></tr>
  <tr><td>Processos</td><td>[Processo específico]</td><td>Autônomo</td><td>[Método de avaliação]</td></tr>
</table>

<div style="background: #e8f5e8; border: 1px solid #c3e6c3; padding: 20px; border-radius: 8px; margin: 20px 0;">
  <h3 style="color: #2e7d32; margin-top: 0;">📈 Semana 2 | Imersão Profissional</h3>
  
  <h4>Planejamento Semanal</h4>
  <ul>
    <li><strong>Segunda:</strong> Foco em [área específica]</li>
    <li><strong>Terça:</strong> Treinamento avançado em [tópico]</li>
    <li><strong>Quarta:</strong> Prática em projeto real supervisionado</li>
    <li><strong>Quinta:</strong> Reunião de feedback e ajustes</li>
    <li><strong>Sexta:</strong> Avaliação semanal e planejamento</li>
  </ul>

  <h4>Atividades Específicas</h4>
  <ul>
    <li>Participação em [tipo de reunião]</li>
    <li>Colaboração em [nome do projeto]</li>
    <li>Desenvolvimento de [entregável específico]</li>
    <li>Apresentação para [stakeholder específico]</li>
  </ul>
</div>

<div style="background: #e3f2fd; border: 1px solid #bbdefb; padding: 20px; border-radius: 8px; margin: 20px 0;">
  <h3 style="color: #1565c0; margin-top: 0;">⚡ Semana 3 | Autonomia Gradual</h3>
  
  <h4>Progressão de Responsabilidades</h4>
  <ul>
    <li><strong>Dia 1-2:</strong> Execução com apoio constante</li>
    <li><strong>Dia 3-4:</strong> Execução com supervisão pontual</li>
    <li><strong>Dia 5:</strong> Tarefas mais complexas com verificação</li>
  </ul>

  <h4>Desenvolvimento de Soft Skills</h4>
  <ul>
    <li>Comunicação eficaz em reuniões virtuais</li>
    <li>Gerenciamento de tempo e prioridades</li>
    <li>Resolução de problemas básicos</li>
    <li>Trabalho em equipe interdepartamental</li>
  </ul>
</div>

<hr>

<h2>🏆 SEMANA 4: Consolidação e Avaliação</h2>

<div style="background: #fff3e0; border: 1px solid #ffe0b2; padding: 20px; border-radius: 8px; margin: 20px 0;">
  <h3 style="color: #e65100; margin-top: 0;">📊 Avaliação de Desempenho</h3>
  
  <h4>Métricas de Sucesso</h4>
  <table>
    <tr><th>Indicador</th><th>Meta</th><th>Resultado</th><th>Status</th></tr>
    <tr><td>Conclusão de tarefas básicas</td><td>90%</td><td>[Preencher]</td><td>[Avaliar]</td></tr>
    <tr><td>Autonomia em sistemas essenciais</td><td>80%</td><td>[Preencher]</td><td>[Avaliar]</td></tr>
    <tr><td>Integração com equipe</td><td>Excelente</td><td>[Preencher]</td><td>[Avaliar]</td></tr>
  </table>

  <h4>Feedback 360°</h4>
  <ul>
    <li>Avaliação do gestor direto</li>
    <li>Feedback do mentor/parceiro</li>
    <li>Opinião da equipe</li>
    <li>Aautoavaliação do colaborador</li>
  </ul>
</div>

<h3>🎉 Celebração e Reconhecimento</h3>
<div style="background: #fce4ec; border: 1px solid #f8bbd9; padding: 20px; border-radius: 8px; margin: 20px 0;">
  <h4 style="color: #c2185b; margin-top: 0;">Atividades de Encerramento</h4>
  <ul>
    <li>Apresentação de resultados preliminares</li>
    <li>Compartilhamento de aprendizados e experiências</li>
    <li>Reconhecimento público das conquistas</li>
    <li>Planejamento dos próximos 90 dias</li>
  </ul>
</div>

<hr>

<h2>🛠️ Recursos e Ferramentas Essenciais</h2>

<div style="background: #f5f5f5; border: 1px solid #e0e0e0; padding: 20px; border-radius: 8px; margin: 20px 0;">
  <h3 style="color: #424242; margin-top: 0;">💻 Sistemas Corporativos</h3>
  
  <table>
    <tr><th>Sistema</th><th>Finalidade</th><th>Acesso</th><th>Suporte</th></tr>
    <tr><td>[Sistema 1]</td><td>[Descrição]</td><td>[Link/Caminho]</td><td>[Contato]</td></tr>
    <tr><td>[Sistema 2]</td><td>[Descrição]</td><td>[Link/Caminho]</td><td>[Contato]</td></tr>
    <tr><td>[Sistema 3]</td><td>[Descrição]</td><td>[Link/Caminho]</td><td>[Contato]</td></tr>
  </table>
</div>

<div style="background: #e8f5e8; border: 1px solid #c3e6c3; padding: 20px; border-radius: 8px; margin: 20px 0;">
  <h3 style="color: #2e7d32; margin-top: 0;">📚 Documentação Importante</h3>
  
  <ul>
    <li><strong>📋 Manual do Colaborador:</strong> <a href="[link]">Acessar manual completo</a></li>
    <li><strong>🔐 Política de Segurança:</strong> <a href="[link]">Diretrizes de TI</a></li>
    <li><strong>💰 Guia de Benefícios:</strong> <a href="[link]">Programas e vantagens</a></li>
    <li><strong>🏢 Código de Conduta:</strong> <a href="[link]">Regras e ética</a></li>
    <li><strong>📊 Processos do Departamento:</strong> <a href="[link]">Fluxos e procedimentos</a></li>
  </ul>
</div>

<div style="background: #e3f2fd; border: 1px solid #bbdefb; padding: 20px; border-radius: 8px; margin: 20px 0;">
  <h3 style="color: #1565c0; margin-top: 0;">👥 Contatos-chave</h3>
  
  <table>
    <tr><th>Função</th><th>Nome</th><th>Contato</th><th>Quando procurar</th></tr>
    <tr><td>Gestor Direto</td><td>[Nome]</td><td>[E-mail/Telefone]</td><td>Tarefas do dia a dia</td></tr>
    <tr><td>Mentor</td><td>[Nome]</td><td>[E-mail/Telefone]</td><td>Dúvidas técnicas</td></tr>
    <tr><td>RH Business Partner</td><td>[Nome]</td><td>[E-mail/Telefone]</td><td>Questões de RH</td></tr>
    <tr><td>TI Help Desk</td><td>Equipe</td><td>[Contato]</td><td>Problemas técnicos</td></tr>
    <tr><td>Facilities</td><td>Equipe</td><td>[Contato]</td><td>Infraestrutura física</td></tr>
  </table>
</div>

<hr>

<h2>📝 Checklist de Acompanhamento Diário</h2>

<div style="background: #fff9c4; border: 1px solid #fff176; padding: 20px; border-radius: 8px; margin: 20px 0;">
  <h3 style="color: #f57f17; margin-top: 0;">✅ Verificações Diárias</h3>
  
  <p><strong>Data: _____/_____/_____</strong></p>
  
  <table>
    <tr><th>Atividade</th><th>Concluído?</th><th>Observações/Dificuldades</th></tr>
    <tr><td>Revisar e-mails e mensagens pendentes</td><td>[ ]</td><td></td></tr>
    <tr><td>Planejar atividades do dia</td><td>[ ]</td><td></td></tr>
    <tr><td>Participar das reuniões agendadas</td><td>[ ]</td><td></td></tr>
    <tr><td>Avançar nas tarefas assigned</td><td>[ ]</td><td></td></tr>
    <tr><td>Registrar aprendizados do dia</td><td>[ ]</td><td></td></tr>
    <tr><td>Comunicar dificuldades ou bloqueios</td><td>[ ]</td><td></td></tr>
    <tr><td>Preparar-se para as atividades do dia seguinte</td><td>[ ]</td><td></td></tr>
  </table>
</div>

<hr>

<h2>🎯 Plano de Desenvolvimento Individual (PDI)</h2>

<div style="background: #f3e5f5; border: 1px solid #e1bee7; padding: 20px; border-radius: 8px; margin: 20px 0;">
  <h3 style="color: #6a1b9a; margin-top: 0;">📈 Metas de 90 Dias</h3>
  
  <table>
    <tr><th>Objetivo</th><th>Prazo</th><th>Indicadores</th><th>Ações Necessárias</th><th>Responsável</th></tr>
    <tr><td>[Objetivo 1]</td><td>[Data]</td><td>[Como medir]</td><td>[Ações]</td><td>[Nome]</td></tr>
    <tr><td>[Objetivo 2]</td><td>[Data]</td><td>[Como medir]</td><td>[Ações]</td><td>[Nome]</td></tr>
    <tr><td>[Objetivo 3]</td><td>[Data]</td><td>[Como medir]</td><td>[Ações]</td><td>[Nome]</td></tr>
  </table>
</div>

<hr>

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; margin: 20px 0; border-radius: 10px;">
  <h2 style="margin: 0;">🎉 Parabéns por Concluir seu Onboarding!</h2>
  <p style="font-size: 1.1em; margin: 10px 0;">Sua jornada está apenas começando. Estamos aqui para apoiar seu desenvolvimento e sucesso na empresa!</p>
  
  <div style="margin: 20px 0;">
    <h3>📞 Quando Dúvidas Surgirem:</h3>
    <ul style="text-align: left; display: inline-block;">
      <li>Seu gestor direto</li>
      <li>Seu mentor designado</li>
      <li>Equipe de RH</li>
      <li>Manual do Colaborador</li>
    </ul>
  </div>
  
  <p><strong>Bem-vindo(a) à família [Nome da Empresa]! 🚀</strong></p>
</div>

<h2>📞 Suporte e Ajudas</h2>
<p><strong>Canais de Suporte:</strong></p>
<ul>
<li><strong>Help Desk de TI:</strong> (xx) xxxx-xxxx | ti@empresa.com</li>
<li><strong>Business Partner RH:</strong> (xx) xxxx-xxxx | rh@empresa.com</li>
<li><strong>Facilities:</strong> (xx) xxxx-xxxx | facilities@empresa.com</li>
</ul>

<p><strong>Horários de Atendimento:</strong> Seg-Sex, 8h às 18h (horário de Brasília)</p>

<hr>

<div style="text-align: center; color: #666; font-style: italic; margin: 30px 0;">
  <p>Este documento foi personalizado para <strong>[Nome do Colaborador]</strong></p>
  <p>Versão: [Versão] | Data: [Data de geração]</p>
  <p>Confidencial - Uso Interno</p>
</div>',
  ARRAY['onboarding', 'integração', 'novo', 'colaborador'],
  true,
  null,
  90,
  true,
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
  id, name, category, description, icon, content, tags, is_global, department_id, usage_count, is_active, created_at, updated_at
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