import React from "react";
import { Bell, Check, FileText, X, ChevronLeft } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useToast } from "./Toast";
import type { NotificationItem } from "../types/notifications";

export const NotificationsPage: React.FC<{
  userId: string;
  onOpenDocumentById?: (docId: string) => void | Promise<void>;
  onOpenReviewCenterByDocId?: (docId: string) => void | Promise<void>;
  onBack: () => void;
}> = ({ userId, onOpenDocumentById, onOpenReviewCenterByDocId, onBack }) => {
  const toast = useToast();
  const [loading, setLoading] = React.useState(false);
  const [items, setItems] = React.useState<NotificationItem[]>([]);

  const formatDate = (iso: string) => {
    try {
      return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(iso));
    } catch {
      return "";
    }
  };

  const typeDotClass = (t: string) => {
    if (t === "REVIEW") return "bg-purple-500";
    if (t === "STATUS") return "bg-green-500";
    return "bg-blue-500";
  };

  const typeLabel = (t: string) => {
    if (t === "REVIEW") return "Revisão";
    if (t === "STATUS") return "Status";
    return "Geral";
  };

  const load = React.useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!userId) return;
      if (!opts?.silent) setLoading(true);

      const { data, error } = await supabase.rpc("list_notifications", {
        p_user_id: userId,
        p_limit: 100,
      });

      if (error) {
        console.error(error);
        if (!opts?.silent) toast.error("Erro ao carregar notificacoes.");
        if (!opts?.silent) setLoading(false);
        return;
      }

      setItems((data || []) as NotificationItem[]);
      if (!opts?.silent) setLoading(false);
    },
    [userId, toast]
  );

  React.useEffect(() => {
    load();
  }, [load]);

  const markRead = async (id: string) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));

    const { error } = await supabase.rpc("mark_notification_read", {
      p_notification_id: id,
    });

    if (error) {
      console.error(error);
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: false } : n)));
      toast.error("Falha ao marcar como lida.");
    }
  };

  const markAll = async () => {
    const unread = items.filter((n) => !n.is_read).map((n) => n.id);
    if (unread.length === 0) return;

    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));

    const results = await Promise.all(
      unread.map((id) =>
        supabase.rpc("mark_notification_read", { p_notification_id: id })
      )
    );

    const anyError = results.some((r) => (r as any).error);
    if (anyError) {
      toast.error("Algumas notificacoes nao puderam ser marcadas.");
      load({ silent: true });
      return;
    }

    toast.success("Tudo marcado como lido.");
  };

  const handleOpen = async (n: NotificationItem) => {
    if (!n.is_read) await markRead(n.id);

    if (!n.document_id) return;

    if (n.type === "REVIEW" && onOpenReviewCenterByDocId) {
      await onOpenReviewCenterByDocId(n.document_id);
      return;
    }

    if (onOpenDocumentById) {
      await onOpenDocumentById(n.document_id);
    }
  };

  const unreadCount = React.useMemo(() => items.filter((n) => !n.is_read).length, [items]);

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div className="mb-6 sm:mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-4"
        >
          <ChevronLeft size={18} />
          Voltar
        </button>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-xl">
              <Bell size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Notificações
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {unreadCount === 0
                  ? "Todas as notificações foram lidas"
                  : `${unreadCount} notificação(ões) não lida(s)`}
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAll}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <Check size={18} />
              Marcar todas como lidas
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-sm">Carregando notificações...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              <Bell size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium mb-2">Nenhuma notificação</p>
              <p className="text-sm">Você não tem notificações por aqui.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {items.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 sm:p-5 transition-all ${
                    n.is_read ? "" : "bg-blue-50/40 dark:bg-blue-900/10 border-l-4 border-blue-500"
                  }`}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <span
                      className={`mt-1.5 w-3 h-3 rounded-full ${typeDotClass(
                        n.type
                      )} shrink-0`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          {n.document_id && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
                              <FileText size={12} />
                              Documento
                            </span>
                          )}
                          <span className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium rounded-full">
                            {typeLabel(n.type)}
                          </span>
                        </div>
                        <div className="text-[11px] sm:text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                          {formatDate(n.created_at)}
                        </div>
                      </div>

                      <h3 className={`font-semibold text-gray-900 dark:text-white truncate mb-1 ${onOpenDocumentById && n.document_id ? 'hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer' : ''}`}>
                        {n.title}
                      </h3>
                      {n.body && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                          {n.body}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <span className="text-[11px] sm:text-xs text-gray-400 dark:text-gray-500">
                          {n.is_read ? "Lida" : "Não lida"}
                        </span>
                        {!n.is_read && (
                          <button
                            type="button"
                            onClick={() => markRead(n.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                          >
                            <Check size={14} />
                            Marcar como lida
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  );
};
