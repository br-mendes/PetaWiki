import React from "react";
import { Bell, Check, FileText, X } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useToast } from "./Toast";

type NotificationItem = {
  id: string;
  title: string;
  body: string | null;
  type: string;
  document_id: string | null;
  is_read: boolean;
  created_at: string;
};

export const NotificationsBell: React.FC<{
  userId: string;
  onOpenDocumentById?: (docId: string) => void | Promise<void>;
  onOpenReviewCenterByDocId?: (docId: string) => void | Promise<void>;
  onNavigateToNotifications?: () => void;
  limit?: number;
  placement?: 'top' | 'bottom';
}> = ({ userId, onOpenDocumentById, onOpenReviewCenterByDocId, onNavigateToNotifications, limit = 30, placement = 'bottom' }) => {
  const toast = useToast();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [items, setItems] = React.useState<NotificationItem[]>([]);
  const ref = React.useRef<HTMLDivElement | null>(null);

  const unreadCount = React.useMemo(
    () => items.filter((n) => !n.is_read).length,
    [items]
  );

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

  const load = React.useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!userId) return;
      if (!opts?.silent) setLoading(true);

      const { data, error } = await supabase.rpc("list_notifications", {
        p_user_id: userId,
        p_limit: limit,
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
    [userId, limit, toast]
  );

  React.useEffect(() => {
    load({ silent: true });
  }, [load]);

  React.useEffect(() => {
    const id = setInterval(() => load({ silent: true }), 30000);
    return () => clearInterval(id);
  }, [load]);

  React.useEffect(() => {
    if (!open) return;

    const onDocClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

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

    setOpen(false);

    if (!n.document_id) return;

    if (n.type === "REVIEW" && onOpenReviewCenterByDocId) {
      await onOpenReviewCenterByDocId(n.document_id);
      return;
    }

    if (onOpenDocumentById) {
      await onOpenDocumentById(n.document_id);
    }
  };

   return (
     <div ref={ref} className="relative">
       <button
         type="button"
         onClick={() => {
           if (onNavigateToNotifications) {
             onNavigateToNotifications();
           } else {
             const next = !open;
             setOpen(next);
             if (next) load({ silent: true });
           }
         }}
         className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
         title="Notificacoes"
         aria-label="Notificacoes"
       >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[11px] flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

        {open && (
          <div
            className={`absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-80 md:w-96 max-w-[90vw] rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl overflow-hidden z-[100]`}
          >
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-3 h-3 border-l border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 transform rotate-45 mb-[-6px]"></div>
           <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="font-semibold text-gray-900 dark:text-gray-100">
              Notificacoes
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={markAll}
                className="text-xs px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
                title="Marcar todas como lidas"
              >
                Marcar todas
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
                title="Fechar"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {loading ? (
              <div className="p-6 text-sm text-gray-500 dark:text-gray-400">
                Carregando...
              </div>
            ) : items.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
                Nenhuma notificacao por aqui.
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {items.map((n) => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-all ${
                      n.is_read ? "" : "bg-blue-50/40 dark:bg-blue-900/10 border-l-2 border-blue-500"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-1 w-2.5 h-2.5 rounded-full ${typeDotClass(
                          n.type
                        )} shrink-0`}
                      />
                      <button
                        type="button"
                        onClick={() => handleOpen(n)}
                        className="flex-1 text-left min-w-0"
                        title={n.document_id ? "Abrir documento" : "Abrir"}
                      >
                        <div className="flex items-center gap-2">
                          {n.document_id ? (
                            <>
                              <div className="p-1.5 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                                <FileText size={16} className="text-blue-600 dark:text-blue-400 shrink-0" />
                              </div>
                              <div className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate flex items-center gap-1">
                                {n.title}
                                <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full shrink-0">
                                  Documento
                                </span>
                              </div>
                            </>
                          ) : (
                            <>
                              <FileText size={16} className="text-gray-400 shrink-0" />
                              <div className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                                {n.title}
                              </div>
                            </>
                          )}
                        </div>
                        {n.body && (
                          <div className="text-xs text-gray-600 dark:text-gray-300 mt-1.5 line-clamp-2 ml-9">
                            {n.body}
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-1.5 ml-9">
                          <div className="text-[11px] text-gray-400 dark:text-gray-500">
                            {formatDate(n.created_at)}
                          </div>
                          {n.document_id && (
                            <span className="text-[10px] text-blue-600 dark:text-blue-400 flex items-center gap-1">
                              <FileText size={10} />
                              Clique para abrir
                            </span>
                          )}
                        </div>
                      </button>

                      {!n.is_read && (
                        <button
                          type="button"
                          onClick={() => markRead(n.id)}
                          className="p-1.5 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 shrink-0"
                          title="Marcar como lida"
                        >
                          <Check size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
