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