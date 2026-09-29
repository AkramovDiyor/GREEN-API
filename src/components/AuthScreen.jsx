import { useState } from 'react';
import { Lock, Key } from 'lucide-react';

export const AuthScreen = ({ onAuth }) => {
  const [idInstance, setIdInstance] = useState('');
  const [apiToken, setApiToken] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (idInstance.trim() && apiToken.trim()) {
      localStorage.setItem('green_api_auth', JSON.stringify({ idInstance, apiTokenInstance: apiToken }));
      onAuth({ idInstance, apiTokenInstance: apiToken });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Вход в MAX Web</h1>
          <p className="text-gray-500 mt-2 text-sm">Введите учетные данные GREEN-API</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID Instance</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={idInstance}
                onChange={(e) => setIdInstance(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                placeholder="1101000000"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">API Token Instance</label>
            <div className="relative">
              <Key className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="password"
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                placeholder="Ваш токен"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-primary hover:bg-primaryHover text-white font-semibold py-2.5 rounded-lg transition-colors duration-200 mt-4"
          >
            Войти в чат
          </button>
        </form>
      </div>
    </div>
  );
};