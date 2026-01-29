export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'EXPORT' | 'FAVORITE' | 'APPROVE' | 'REJECT' | 'RENAME' | 'MOVE';
  targetType: 'document' | 'category' | 'user' | 'system';
  targetId: string;
  targetTitle?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    categoryId?: string;
    categoryPath?: string;
  };
  createdAt: string;
}

export interface ActivityFilters {
  userId?: string;
  action?: ActivityLog['action'];
  targetType?: ActivityLog['targetType'];
  dateFrom?: string;
  dateTo?: string;
  searchQuery?: string;
  limit?: number;
  offset?: number;
}

export interface ActivityStats {
  totalActions: number;
  actionsByType: Partial<Record<ActivityLog['action'], number>>;
  actionsByUser: Array<{ userId: string; userName: string; count: number }>;
  actionsByDay: Array<{ date: string; count: number }>;
  topDocuments: Array<{ docId: string; title: string; actionCount: number }>;
  topUsers: Array<{ userId: string; userName: string; actionCount: number }>;
}
