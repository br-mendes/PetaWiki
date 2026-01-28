import React from "react";
import { CheckCircle2, XCircle, Search, FileText, MessageSquare } from "lucide-react";
import { supabase } from "../lib/supabase";
import { Button } from "./Button";
import { useToast } from "./Toast";
import { Document } from "../types";

type DbDoc = any;

export const ReviewCenter: React.FC<{
  actorUserId: string;
  onOpenDocumentById: (docId: string) => void | Promise<void>;
}> = ({ actorUserId, onOpenDocumentById }) => {
  const toast = useToast();
  const [loading, setLoading] = React.useState(true);
  const [docs, setDocs] = React.useState<Document[]>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState("");
  const [reviewNote, setReviewNote] = React.useState("");

  const selected = docs.find(d => d.id === selectedId) || null;

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("status", "PENDING_REVIEW")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mapped: Document[] = (data || []).map((d: DbDoc) => ({
        id: d.id,
        title: d.title,
        content: d.content || "",
        categoryId: d.category_id,
        status: d.status,
        authorId: d.author_id,
        createdAt: d.created_at,
        updatedAt: d.updated_at,
        deletedAt: d.deleted_at,
        views: d.views,
        tags: d.tags || [],
        categoryPath: [],
        versions: [],
        // @ts-ignore
        reviewNote: d.review_note ?? null,
      }));

      setDocs(mapped);

      if (!selectedId && mapped.length > 0) {
        setSelectedId(mapped[0].id);
        // @ts-ignore
        setReviewNote(mapped[0].reviewNote || "");
      }
    } catch (e: any) {
      console.error(e);
      toast.error("Erro ao carregar pendencias.");
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  React.useEffect(() => {
    load();
  }, [load]);

  React.useEffect(() => {
    if (!selected) return;
    // @ts-ignore
    setReviewNote(selected.reviewNote || "");
  }, [selectedId]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return docs;
    return docs.filter(d =>
      (d.title || "").toLowerCase().includes(q) ||
      (d.content || "").toLowerCase().includes(q)
    );
  }, [docs, query]);

  const persistReviewNote = async (docId: string, note: string) => {
    try {
      const { error } = await supabase
        .from("documents")
        .update({ review_note: note, updated_by: actorUserId, updated_at: new Date().toISOString() })
        .eq("id", docId);
      if (error) throw error;

      setDocs(prev => prev.map(d => d.id === docId ? ({ ...d, /* @ts-ignore */ reviewNote: note }) : d));
    } catch (e: any) {
      console.error(e);
      toast.error("Falha ao salvar comentario de revisao.");
    }
  };

  const decide = async (docId: string, status: "PUBLISHED" | "REJECTED") => {
    try {
      await persistReviewNote(docId, reviewNote);

      const { error } = await supabase.rpc("set_document_status", {
        p_document_id: docId,
        p_status: status,
        p_actor_user_id: actorUserId,
      });
      if (error) throw error;

      toast.success(status === "PUBLISHED" ? "Aprovado e publicado." : "Rejeitado.");

      setDocs(prev => prev.filter(d => d.id !== docId));
      setSelectedId(prev => {
        if (prev !== docId) return prev;
        const remaining = docs.filter(d => d.id !== docId);
        return remaining[0]?.id ?? null;
      });

    } catch (e: any) {
      console.error(e);
      toast.error("Falha ao processar revisao.");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Centro de Revisoes
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Documentos aguardando aprovacao ({docs.length})
          </p>
        </div>

        <Button variant="ghost" onClick={load}>
          Atualizar
        </Button>
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2">
              <Search size={16} className="text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar pendencias..."
                className="w-full bg-transparent outline-none text-sm text-gray-800 dark:text-gray-200"
              />
            </div>
          </div>

          <div className="max-h-[70vh] overflow-y-auto">
            {loading ? (
              <div className="p-6 text-sm text-gray-500 dark:text-gray-400">Carregando...</div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
                Nenhum documento pendente.
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {filtered.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedId(d.id)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors ${
                      d.id === selectedId ? "bg-blue-50/60 dark:bg-blue-900/10" : ""
                    }`}
                    title={d.title}
                  >
                    <div className="flex items-start gap-2">
                      <FileText size={16} className="text-gray-400 mt-0.5" />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {d.title || "Sem titulo"}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                          {(d.content || "").replace(/<[^>]*>/g, "").slice(0, 140)}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-8 space-y-4">
          {!selected ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center text-gray-500 dark:text-gray-400">
              Selecione um documento para revisar.
            </div>
          ) : (
            <>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
                      {selected.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      ID: {selected.id}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      onClick={() => onOpenDocumentById(selected.id)}
                      title="Abrir no modo normal"
                    >
                      Abrir
                    </Button>

                    <Button
                      onClick={() => decide(selected.id, "PUBLISHED")}
                      title="Aprovar e publicar"
                    >
                      <CheckCircle2 size={18} className="mr-2" />
                      Aprovar
                    </Button>

                    <Button
                      variant="ghost"
                      onClick={() => decide(selected.id, "REJECTED")}
                      title="Rejeitar"
                    >
                      <XCircle size={18} className="mr-2 text-red-500" />
                      Rejeitar
                    </Button>
                  </div>
                </div>

                <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                    <MessageSquare size={16} className="text-gray-400" />
                    Comentario de revisao (opcional)
                  </div>
                  <textarea
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    placeholder="Ex.: Ajustar titulo, completar passos, incluir evidencias, etc."
                    className="w-full min-h-[90px] resize-y rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/30 p-3 text-sm text-gray-800 dark:text-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex justify-end mt-2">
                    <Button
                      variant="ghost"
                      onClick={() => persistReviewNote(selected.id, reviewNote)}
                      title="Salvar comentario"
                    >
                      Salvar comentario
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  Preview
                </div>

                <div
                  className="prose prose-blue dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: selected.content || "<p>(vazio)</p>" }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
