import { lazy } from 'react';

// Componentes pesados carregados sob demanda
export const AdminSettings = lazy(() => import('./components/AdminSettings').then(module => ({ default: module.AdminSettings })));
export const ReviewCenter = lazy(() => import('./components/ReviewCenter').then(module => ({ default: module.ReviewCenter })));
export const DraftManager = lazy(() => import('./components/DraftManager').then(module => ({ default: module.DraftManager })));
export const UserProfile = lazy(() => import('./components/UserProfile').then(module => ({ default: module.UserProfile })));
export const AnalyticsDashboard = lazy(() => import('./components/AnalyticsDashboard').then(module => ({ default: module.AnalyticsDashboard })));
export const TemplateSelector = lazy(() => import('./components/TemplateSelector').then(module => ({ default: module.TemplateSelector })));
export const CategoryModal = lazy(() => import('./components/CategoryModal').then(module => ({ default: module.CategoryModal })));