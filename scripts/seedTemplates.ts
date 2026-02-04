import { supabase } from './supabase';
import { MOCK_TEMPLATES } from '../constants';

export async function seedTemplates() {
  try {
    console.log('Iniciando seed de templates...');
    
    for (const template of MOCK_TEMPLATES) {
      const { data, error } = await supabase
        .from('document_templates')
        .upsert({
          id: template.id,
          name: template.name,
          category: template.category,
          description: template.description,
          icon: template.icon,
          content: template.content,
          tags: template.tags,
          is_global: template.isGlobal,
          department_id: null,
          usage_count: template.usageCount,
          is_active: true,
          created_by: null
        }, {
          onConflict: 'id'
        })
        .select();

      if (error) {
        console.error(`Erro ao inserir template ${template.name}:`, error);
      } else {
        console.log(`Template ${template.name} inserido/atualizado com sucesso`);
      }
    }
    
    console.log('Seed de templates concluído!');
    return true;
  } catch (error) {
    console.error('Erro no seed de templates:', error);
    return false;
  }
}

// Função para executar via script
if (require.main === module) {
  seedTemplates()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}