import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { ActivityLog, ActivityFilters, ActivityStats } from './activityLog';

interface UseActivityLogReturn {
  logs: ActivityLog[];
  stats: ActivityStats;
  filters: ActivityFilters;
  updateFilters: (filters: Partial<ActivityFilters>) => void;
  clearFilters: () => void;
  logActivity: (activity: Omit<ActivityLog, 'id' | 'createdAt'>) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const useActivityLog = (initialFilters?: Partial<ActivityFilters>): UseActivityLogReturn => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<ActivityStats>({
    totalActions: 0,
    actionsByType: {},
    actionsByUser: [],
    actionsByDay: [],
    topDocuments: [],
    topUsers: []
  });
  const [filters, setFilters] = useState<ActivityFilters>({
    action: undefined,
    targetType: undefined,
    dateFrom: undefined,
    dateTo: undefined,
    searchQuery: '',
    limit: 50,
    offset: 0,
    ...initialFilters
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch logs
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.rpc('get_activity_logs', {
        p_user_id: filters.userId,
        p_action: filters.action,
        p_target_type: filters.targetType,
        p_date_from: filters.dateFrom,
        p_date_to: filters.dateTo,
        p_search_query: filters.searchQuery,
        p_limit: filters.limit,
        p_offset: filters.offset
      });

      if (error) throw error;

      setLogs(data || []);
    } catch (err) {
      console.error('Error fetching activity logs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('get_activity_stats', {
        p_date_from: filters.dateFrom,
        p_date_to: filters.dateTo
      });

      if (error) throw error;

      const statsData: ActivityStats = {
        totalActions: 0,
        actionsByType: {},
        actionsByUser: [],
        actionsByDay: [],
        topDocuments: [],
        topUsers: []
      };

      (data || []).forEach((row: any) => {
        if (row.stat_type === 'total_actions') {
          statsData.totalActions = row.stat_value;
        } else if (row.stat_type === 'actions_by_type') {
          statsData.actionsByType[row.stat_label] = row.stat_value;
        } else if (row.stat_type === 'actions_by_user') {
          const [userId, userName] = row.stat_label.split(':');
          statsData.actionsByUser.push({ userId, userName, count: row.stat_value });
        } else if (row.stat_type === 'actions_by_day') {
          statsData.actionsByDay.push({ date: row.stat_label, count: row.stat_value });
        } else if (row.stat_type === 'top_documents') {
          const [docId, title] = row.stat_label.split(':');
          statsData.topDocuments.push({ docId, title, actionCount: row.stat_value });
        } else if (row.stat_type === 'top_users') {
          const [userId, userName] = row.stat_label.split(':');
          statsData.topUsers.push({ userId, userName, actionCount: row.stat_value });
        }
      });

      setStats(statsData);
    } catch (err) {
      console.error('Error fetching activity stats:', err);
    }
  }, [filters]);

  // Log activity
  const logActivity = useCallback(async (activity: Omit<ActivityLog, 'id' | 'createdAt'>) => {
    try {
      const { data, error } = await supabase.rpc('log_activity', {
        p_user_id: activity.userId,
        p_user_name: activity.userName,
        p_user_email: activity.userEmail,
        p_action: activity.action,
        p_target_type: activity.targetType,
        p_target_id: activity.targetId,
        p_target_title: activity.targetTitle,
        p_old_values: activity.oldValues,
        p_new_values: activity.newValues,
        p_metadata: activity.metadata
      });

      if (error) throw error;

      // Adicionar ao estado local otimisticamente
      const newLog: ActivityLog = {
        id: data,
        ...activity,
        createdAt: new Date().toISOString()
      };

      setLogs(prev => [newLog, ...prev.slice(0, 999)]);
    } catch (err) {
      console.error('Error logging activity:', err);
    }
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<ActivityFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, offset: 0 }));
    setError(null);
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({
      action: undefined,
      targetType: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      searchQuery: '',
      limit: 50,
      offset: 0
    });
    setError(null);
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, []);

  return {
    logs,
    stats,
    filters,
    updateFilters,
    clearFilters,
    logActivity,
    loading,
    error
  };
};