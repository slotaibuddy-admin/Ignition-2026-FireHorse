import { useState } from 'react';
import Header from './components/Header';
import ModuleCard from './components/ModuleCard';
import GenerateButton from './components/GenerateButton';
import Footer from './components/Footer';
import { generateCyberModule } from './services/gemini';

function App() {
  const [module, setModule] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newModule = await generateCyberModule();
      setModule(newModule);
    } catch (err) {
      setError(err.message);
      console.error('Generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-12">
        <div className="space-y-8 w-full flex flex-col items-center">
          <GenerateButton onClick={handleGenerate} isLoading={isLoading} />
          
          {error && (
            <div className="glass-card p-6 max-w-2xl w-full border-red-500 border-2">
              <p className="text-red-400 text-center">
                <span className="font-bold">Error:</span> {error}
              </p>
            </div>
          )}
          
          {module && !isLoading && (
            <ModuleCard module={module} />
          )}
          
          {!module && !isLoading && !error && (
            <div className="glass-container p-8 max-w-2xl w-full text-center">
              <p className="text-gray-400 text-lg">
                Click the button above to generate your first Cyber Module using AI! 🔥
              </p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default App;
