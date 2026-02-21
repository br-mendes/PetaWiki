import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface Document {
  id: string;
  title: string;
  content: string;
  status: string;
  updated_at: string;
}

export default function Home() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();

  useEffect(() => {
    loadDocs();
  }, []);

  const loadDocs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("documents")
      .select("id, title, content, status, updated_at")
      .eq("status", "PUBLISHED")
      .eq("is_template", false)
      .order("updated_at", { ascending: false })
      .limit(50);

    setDocs(data || []);
    setLoading(false);
  };

  if (!isAuthenticated || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4">Por favor, faça login.</p>
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Ir para Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="p-10">Carregando...</div>;
  }

  const canEdit = currentUser.role === 'EDITOR' || currentUser.role === 'ADMIN' || currentUser.isSuperAdmin;
  const isAdmin = currentUser.role === 'ADMIN' || currentUser.isSuperAdmin;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Documentos Publicados</h1>
        <div className="flex gap-2">
          {canEdit && (
            <button
              onClick={() => navigate('/novo')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Novo Documento
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300"
            >
              Admin
            </button>
          )}
        </div>
      </div>

      {docs.length === 0 ? (
        <p className="text-gray-500">Nenhum documento publicado.</p>
      ) : (
        <div className="grid gap-4">
          {docs.map(doc => (
            <div
              key={doc.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-white dark:bg-gray-800"
              onClick={() => navigate(`/documento/${doc.id}`)}
            >
              <h2 className="font-semibold text-lg">{doc.title}</h2>
              <p className="text-gray-500 text-sm mt-1">
                Atualizado em {new Date(doc.updated_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
