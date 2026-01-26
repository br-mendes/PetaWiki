import { supabase } from "./supabase";

export type Category = {
  id: string;                 // text
  name: string;
  slug: string;
  parent_id: string | null;
  department_id: string | null;
  sort_order: number | null;
  doc_count: number | null;
  description: string | null;
  icon: string | null;
  created_at: string | null;
};

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
  return (data ?? []) as Category[];
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
  return data as Category;
}

export async function renameCategory(id: string, name: string) {
  const { data, error } = await supabase
    .from("categories")
    .update({ name, slug: slugify(name) })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data as Category;
}

export async function deleteCategory(id: string) {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}