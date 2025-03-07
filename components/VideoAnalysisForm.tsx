import { useState } from 'react';
import ProgressBar from './ProgressBar';

interface VideoAnalysisFormProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
  progress: number;
}

export default function VideoAnalysisForm({ 
  onSubmit, 
  isLoading, 
  progress 
}: VideoAnalysisFormProps) {
  const [url, setUrl] = useState('');
  const [validationError, setValidationError] = useState('');

  const validateYouTubeUrl = (url: string): boolean => {
    const regExp = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(\S*)?$/;
    return regExp.test(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setValidationError('Please enter a YouTube URL');
      return;
    }
    
    if (!validateYouTubeUrl(url)) {
      setValidationError('Please enter a valid YouTube URL');
      return;
    }
    
    setValidationError('');
    onSubmit(url);
  };

  return (
    <div className="card p-8 bg-white/80 backdrop-blur-sm w-full max-w-3xl rounded-xl shadow-lg border border-gray-100">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="youtube-url" className="block text-base font-medium text-gray-700 mb-2 font-sans">
            Paste a YouTube video link
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg 
                className="h-5 w-5 text-red-500" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
              </svg>
            </div>
            <input
              type="text"
              id="youtube-url"
              className={`pl-10 block w-full rounded-xl border-0 bg-gray-50/50 shadow-sm ring-1 ring-inset ${
                validationError ? 'ring-red-300 text-red-900' : 'ring-gray-200 text-gray-900'
              } focus:ring-2 focus:ring-lime-400 text-base py-3.5 transition-all duration-200 ease-in-out`}
              placeholder="https://www.youtube.com/watch?v=..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
            />
          </div>
          {validationError && (
            <p className="mt-2 text-sm text-red-600 font-medium font-sans">{validationError}</p>
          )}
        </div>

        {isLoading && (
          <div className="mt-6">
            <ProgressBar progress={progress} />
            <p className="text-sm text-gray-500 mt-3 text-center font-light font-sans">
              {progress < 50 ? 'Extracting video transcript...' : 'Analyzing content...'}
            </p>
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-base font-medium text-white transition-all duration-200 font-sans ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
            }`}
          >
            {isLoading ? 'Processing...' : 'Generate Insights'}
          </button>
        </div>
      </form>
    </div>
  );
}