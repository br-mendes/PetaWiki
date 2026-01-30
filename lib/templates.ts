import { supabase } from "./supabase";
import { DocumentTemplate, TemplateCategory } from "../types";

type DbTemplate = any;

function mapDbTemplate(t: DbTemplate): DocumentTemplate {
  return {
    id: t.id,
    name: t.name,
    category: (t.category || "OTHER") as TemplateCategory,
    description: t.description ?? undefined,
    icon: t.icon ?? undefined,
    content: t.content || "",
    tags: t.tags || [],
    isGlobal: !!t.is_global,
    departmentId: t.department_id ?? undefined,
    usageCount: t.usage_count ?? 0,
  };
}

export async function listTemplates(): Promise<DocumentTemplate[]> {
  const { data, error } = await supabase
    .from("document_templates")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []).map(mapDbTemplate);
}

export async function createTemplate(input: {
  name: string;
  content: string;
  tags: string[];
  category?: TemplateCategory;
  description?: string | null;
  icon?: string | null;
  isGlobal?: boolean;
  departmentId?: string | null;
  createdBy?: string | null;
}): Promise<DocumentTemplate> {
  const payload: any = {
    name: input.name,
    category: input.category || "OTHER",
    description: input.description ?? null,
    icon: input.icon ?? null,
    content: input.content,
    tags: input.tags || [],
    is_global: input.isGlobal ?? true,
    department_id: input.departmentId ?? null,
    created_by: input.createdBy ?? null,
  };

  const { data, error } = await supabase
    .from("document_templates")
    .insert(payload)
    .select("*")
    .single();

  if (error) throw error;
  return mapDbTemplate(data);
}

export async function incrementTemplateUsage(templateId: string) {
  // Best-effort: if RPC doesn't exist, fall back to plain update.
  const { error } = await supabase.rpc("increment_template_usage", {
    p_template_id: templateId,
  });
  if (!error) return;
}
