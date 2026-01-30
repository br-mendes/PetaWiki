export type NotificationItem = {
  id: string;
  title: string;
  body: string | null;
  type: string;
  document_id: string | null;
  is_read: boolean;
  created_at: string;
};
