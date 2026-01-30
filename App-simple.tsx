console.log("App.tsx: Starting app component");

import React, { useState, useEffect, useMemo, useRef, useCallback, memo } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams, useSearchParams, Navigate } from 'react-router-dom';

// Importações básicas
import { ToastProvider, useToast } from './components/Toast';
import { FullPageLoader } from './components/LoadingSpinner';

console.log("App.tsx: Imports loaded");

type ViewState = 'HOME' | 'LOGIN' | 'LOADING';

const AppContent = () => {
  console.log("AppContent: Component starting");
  const toast = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>('LOADING');
  const [currentUser, setCurrentUser] = React.useState<any>(null);

  // Simulação simples para teste
  useEffect(() => {
    console.log("AppContent: useEffect running");
    setTimeout(() => {
      console.log("AppContent: Showing login screen");
      setCurrentView('LOGIN');
    }, 2000);
  }, []);

  const handleLogin = (username: string, password: string) => {
    console.log("AppContent: Login attempt", username);
    if (username === 'admin' && password === 'admin') {
      const user = { id: '1', name: 'Admin', email: 'admin@example.com' };
      setCurrentUser(user);
      setIsAuthenticated(true);
      setCurrentView('HOME');
      toast.success('Login successful!');
    } else {
      toast.error('Invalid credentials');
    }
  };

  if (currentView === 'LOADING') {
    return <FullPageLoader text="Initializing..." />;
  }

  if (!isAuthenticated || currentView === 'LOGIN') {
    console.log("AppContent: Showing login");
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9fafb',
        fontFamily: 'system-ui'
      }}>
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          width: '100%',
          maxWidth: '400px'
        }}>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '1.5rem',
            textAlign: 'center',
            color: '#1f2937'
          }}>
            Peta Wiki Login
          </h1>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#4b5563'
            }}>
              Username
            </label>
            <input
              type="text"
              id="username"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#4b5563'
            }}>
              Password
            </label>
            <input
              type="password"
              id="password"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
          </div>
          
          <button
            onClick={() => {
              const username = (document.getElementById('username') as HTMLInputElement)?.value;
              const password = (document.getElementById('password') as HTMLInputElement)?.value;
              handleLogin(username, password);
            }}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            Login
          </button>
          
          <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
            Use: admin / admin
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      fontFamily: 'system-ui',
      padding: '2rem'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#1f2937' }}>
        Bem-vindo ao Peta Wiki, {currentUser?.name}!
      </h1>
      <p style={{ color: '#4b5563', marginBottom: '2rem' }}>
        Aplicação carregada com sucesso.
      </p>
      
      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#1f2937' }}>
          Status do Sistema
        </h2>
        <ul style={{ color: '#4b5563', lineHeight: '1.6' }}>
          <li>✅ React carregado</li>
          <li>✅ Login funcional</li>
          <li>✅ Estado gerenciado</li>
          <li>✅ Toast funcionando</li>
          <li>⏳ Supabase: placeholder</li>
          <li>⏳ Componentes complexos: em desenvolvimento</li>
        </ul>
      </div>
    </div>
  );
};

const App = () => {
  console.log("App: Main App component");
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppContent />} />
          <Route path="*" element={<AppContent />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
};

export default App;