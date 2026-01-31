import { lazy, Suspense } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

// Safe lazy loading with error boundaries
const safeLazy = (importFunc: any, fallback?: React.ComponentType) => {
  return lazy(() => 
    importFunc()
      .then(module => ({ default: module.default || module }))
      .catch(error => {
        console.error('Component loading failed:', error);
        // Fallback component on error
        return { default: fallback || (() => <div>Component unavailable</div>) };
      })
  );
};

// Componentes pesados carregados sob demanda com fallback seguro
export const AdminSettings = safeLazy(() => import('./AdminSettings'));
export const ReviewCenter = safeLazy(() => import('./ReviewCenter'));
export const DraftManager = safeLazy(() => import('./DraftManager'));
export const UserProfile = safeLazy(() => import('./UserProfile'));
export const AnalyticsDashboard = safeLazy(() => import('./AnalyticsDashboard'));
export const TemplateSelector = safeLazy(() => import('./TemplateSelector'));
export const CategoryModal = safeLazy(() => import('./CategoryModal'));

// Enhanced lazy wrapper with suspense
export const LazyWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingSpinner />}>
    {children}
  </Suspense>
);

export const LazyComponents = {
  AdminSettings,
  ReviewCenter,
  DraftManager,
  UserProfile,
  AnalyticsDashboard,
  TemplateSelector,
  CategoryModal,
  LazyWrapper,
};
