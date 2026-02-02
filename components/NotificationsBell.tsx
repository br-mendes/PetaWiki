import React from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
  limit?: number;
  placement?: 'top' | 'bottom';
}> = ({ userId, onOpenDocumentById, onOpenReviewCenterByDocId, limit = 30, placement = 'bottom' }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const [items, setItems] = React.useState<NotificationItem[]>([]);

  const unreadCount = React.useMemo(
    () => items.filter((n) => !n.is_read).length,
    [items]
  );

  const load = React.useCallback(async ({ silent = false }: { silent?: boolean } = {}) => {
    if (!silent) setLoading(true);
    
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("to_user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error(error);
      if (!silent) toast.error("Falha ao carregar notificações.");
    } else {
      setItems((data || []) as NotificationItem[]);
    }
    
    if (!silent) setLoading(false);
  }, [userId, limit, toast]);

  React.useEffect(() => {
    // Keep loading for unread count but no popup
    load({ silent: true });
  }, [load]);

  React.useEffect(() => {
    // Keep polling for unread count
    const id = setInterval(() => load({ silent: true }), 30000);
    return () => clearInterval(id);
  }, [load]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          navigate('/notificacoes');
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
    </div>
  );
};