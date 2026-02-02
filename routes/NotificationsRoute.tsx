import { NotificationsPage } from '../pages/NotificationsPage';

export const NotificationsRoute = NotificationsPage;

  // Just return AppContent which already handles notification display
  // The route change alone is enough to show notifications in full page
  return <AppContent />;
};