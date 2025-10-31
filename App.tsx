import React from 'react';
import BiliAssistant from './components/BiliAssistant';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 font-sans">
      <div className="container mx-auto p-4 md:p-6">
        <header className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-red-600">
            Naprid Bili asistent ⚪🔴
          </h1>
          <p className="text-gray-600 mt-2">Sve o našem Hajduku na jednom mistu, pokretano Gemini AI.</p>
        </header>

        <main>
          <BiliAssistant />
        </main>
      </div>
    </div>
  );
};

export default App;
