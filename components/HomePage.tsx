import React from "react";
import { ToastProvider, useToast } from '../components/Toast';

const HomePage = () => {
  const toast = useToast();

  return (
    <ToastProvider>
      <div className="p-8 max-w-5xl mx-auto">
        <div className="text-center py-16">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Home Page
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Componente HomePage em desenvolvimento.
          </p>
          <button
            onClick={() => toast.success("Toast funcionando!")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Testar Toast
          </button>
        </div>
      </div>
    </ToastProvider>
  );
};

export default HomePage;