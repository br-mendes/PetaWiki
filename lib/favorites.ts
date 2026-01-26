import { supabase } from "./supabase";

export async function listFavoriteDocIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("document_favorites")
    .select("doc_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []).map((r: any) => r.doc_id);
}

export async function addFavorite(userId: string, docId: string) {
  const { error } = await supabase
    .from("document_favorites")
    .insert({ user_id: userId, doc_id: docId });

  if (error) throw error;
}

export async function removeFavorite(userId: string, docId: string) {
  const { error } = await supabase
    .from("document_favorites")
    .delete()
    .eq("user_id", userId)
    .eq("doc_id", docId);

  if (error) throw error;
}