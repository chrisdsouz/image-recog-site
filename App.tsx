
import React, { useState, useCallback, useRef } from 'react';
import { analyzeContent } from './services/geminiService';
import { ImageData, AnalysisResult } from './types';
import { ImagePreview } from './components/ImagePreview';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [image, setImage] = useState<ImageData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setImage({
          base64: base64String,
          mimeType: file.type,
          previewUrl: URL.createObjectURL(file)
        });
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = async () => {
    if (!prompt && !image) {
      setError('Please provide at least a prompt or an image.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const text = await analyzeContent(prompt, image || undefined);
      setResult({ text, timestamp: Date.now() });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
            Gemini <span className="text-indigo-600">Vision Lab</span>
          </h1>
          <p className="text-lg text-slate-600">
            Multimodal analysis powered by Gemini 3 Flash. Upload an image, ask a question, and get instant insights.
          </p>
        </header>

        {/* Input Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          <div className="p-6 sm:p-8 space-y-6">
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wider">
                1. Provide Context
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you want to know about the image or ask a general question..."
                className="w-full min-h-[120px] p-4 text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
              />
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wider">
                2. Visual Input (Optional)
              </label>
              
              {!image ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 bg-slate-50 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all group"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-400 group-hover:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="mt-2 text-sm text-slate-500">
                    Click to upload or drag and drop your image here
                  </p>
                  <p className="mt-1 text-xs text-slate-400">PNG, JPG, WEBP up to 10MB</p>
                </div>
              ) : (
                <ImagePreview url={image.previewUrl} onRemove={clearImage} />
              )}
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            <div className="pt-4">
              <button
                onClick={handleAnalyze}
                disabled={loading || (!prompt && !image)}
                className={`w-full py-4 px-6 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center space-x-2 
                  ${loading || (!prompt && !image) 
                    ? 'bg-slate-300 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700 active:transform active:scale-[0.98]'}`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Processing Analysis...</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M11.3 1.047a1 1 0 01.897.95l.1 1.944 1.944.1a1 1 0 01.95.897l.1 1.944 1.944.1a1 1 0 01.897.95l.1 1.944-1.944.1a1 1 0 01-.95.897l-.1 1.944-1.944.1a1 1 0 01-.897-.95l-.1-1.944-1.944-.1a1 1 0 01-.95-.897l-.1-1.944-1.944-.1a1 1 0 01-.897-.95l-.1-1.944 1.944-.1a1 1 0 01.95-.897l.1-1.944 1.944-.1z" clipRule="evenodd" />
                    </svg>
                    <span>Run Gemini Intelligence</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error Messaging */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Results Area */}
        {result && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-indigo-600 px-6 py-3 flex justify-between items-center">
              <h3 className="text-white font-semibold flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                AI Insights Result
              </h3>
              <span className="text-indigo-100 text-xs font-mono">
                {new Date(result.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div className="p-6 sm:p-8">
              <div className="prose prose-slate max-w-none text-slate-800 leading-relaxed whitespace-pre-wrap">
                {result.text}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center text-slate-400 text-sm pb-10">
          Powered by Gemini 3 Flash • Built with React & Tailwind
        </footer>
      </div>
    </div>
  );
};

export default App;
