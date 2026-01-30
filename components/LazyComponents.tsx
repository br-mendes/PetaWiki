import { lazy } from 'react';

// Componentes pesados carregados sob demanda
export const AdminSettings = lazy(() => import('./AdminSettings').then(module => ({ default: module.AdminSettings })));
export const ReviewCenter = lazy(() => import('./ReviewCenter').then(module => ({ default: module.ReviewCenter })));
export const DraftManager = lazy(() => import('./DraftManager').then(module => ({ default: module.DraftManager })));
export const UserProfile = lazy(() => import('./UserProfile').then(module => ({ default: module.UserProfile })));
export const AnalyticsDashboard = lazy(() => import('./AnalyticsDashboard').then(module => ({ default: module.AnalyticsDashboard })));
export const TemplateSelector = lazy(() => import('./TemplateSelector').then(module => ({ default: module.TemplateSelector })));
export const CategoryModal = lazy(() => import('./CategoryModal').then(module => ({ default: module.CategoryModal })));
export const NotificationsPage = lazy(() => import('./NotificationsPage').then(module => ({ default: module.NotificationsPage })));

export const LazyComponents = {
  AdminSettings,
  ReviewCenter,
  DraftManager,
  UserProfile,
  AnalyticsDashboard,
  TemplateSelector,
  CategoryModal,
  NotificationsPage,
};
