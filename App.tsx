import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import { AdminRoute } from "./routes/AdminRoute";
import { DocumentViewRoute } from "./routes/DocumentViewRoute";
import { CategoryViewRoute } from "./routes/CategoryViewRoute";
import { NewDocumentRoute } from "./routes/NewDocumentRoute";
import { TemplatesRoute } from "./routes/TemplatesRoute";
import { AnalyticsRoute } from "./routes/AnalyticsRoute";
import { ReviewRoute } from "./routes/ReviewRoute";
import { FavoritesRoute } from "./routes/FavoritesRoute";
import { NotificationsRoute } from "./routes/NotificationsRoute";
import { ProfileRoute } from "./routes/ProfileRoute";
import { NotFoundPage } from "./components/NotFoundPage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="p-10">Carregando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/documento/:docId" element={<ProtectedRoute><DocumentViewRoute /></ProtectedRoute>} />
      <Route path="/documento/:docId/editar" element={<ProtectedRoute><DocumentViewRoute /></ProtectedRoute>} />
      <Route path="/categoria/:categoryId" element={<ProtectedRoute><CategoryViewRoute /></ProtectedRoute>} />
      <Route path="/novo" element={<ProtectedRoute><NewDocumentRoute /></ProtectedRoute>} />
      <Route path="/templates" element={<ProtectedRoute><TemplatesRoute /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><AnalyticsRoute /></ProtectedRoute>} />
      <Route path="/revisoes" element={<ProtectedRoute><ReviewRoute /></ProtectedRoute>} />
      <Route path="/favoritos" element={<ProtectedRoute><FavoritesRoute /></ProtectedRoute>} />
      <Route path="/notificacoes" element={<ProtectedRoute><NotificationsRoute /></ProtectedRoute>} />
      <Route path="/perfil" element={<ProtectedRoute><ProfileRoute /></ProtectedRoute>} />
      
      <Route path="/admin" element={<AdminRoute />} />
      
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
