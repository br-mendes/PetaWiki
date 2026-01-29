import { supabase } from "./supabase";

// NOTE: This type mirrors DB columns (snake_case) but also carries
// camelCase aliases used across the UI.
export interface Category {
  id: string; // text
  name: string;
  slug: string;
  parent_id: string | null;
  department_id: string | null;
  sort_order: number | null;
  doc_count: number | null;
  description: string | null;
  icon: string | null;
  created_at: string | null;

  // UI aliases / computed fields
  parentId?: string | null;
  departmentId?: string | null;
  order?: number;
  docCount?: number;
  children?: Category[];
}

function withUiAliases(row: Category): Category {
  return {
    ...row,
    parentId: row.parent_id,
    departmentId: row.department_id,
    order: row.sort_order ?? 0,
    docCount: row.doc_count ?? 0,
  };
}

export function slugify(input: string) {
  return input
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function listCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;
  return ((data ?? []) as Category[]).map(withUiAliases);
}

export async function createCategory(input: { name: string; parent_id?: string | null; sort_order?: number }) {
  const slug = slugify(input.name);

  const { data, error } = await supabase
    .from("categories")
    .insert({
      name: input.name,
      slug,
      parent_id: input.parent_id ?? null,
      sort_order: input.sort_order ?? 0,
      doc_count: 0,
    })
    .select("*")
    .single();

  if (error) throw error;
  return withUiAliases(data as Category);
}

export async function renameCategory(id: string, name: string) {
  const { data, error } = await supabase
    .from("categories")
    .update({ name, slug: slugify(name) })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return withUiAliases(data as Category);
}

export async function deleteCategory(id: string) {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}
