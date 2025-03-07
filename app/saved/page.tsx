'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SavedAnalysisDetail from '@/components/SavedAnalysisDetail';

type SavedAnalysis = {
  id: string;
  videoId: string;
  videoUrl: string;
  title: string;
  analysis: {
    topic: string;
    keyPoints: string[];
    summary: string;
  };
  createdAt: string;
};

export default function SavedAnalysesPage() {
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<SavedAnalysis | null>(null);

  const fetchSavedAnalyses = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/saved-analyses');
      
      if (!response.ok) {
        throw new Error('Failed to fetch saved analyses');
      }
      
      const data = await response.json();
      setSavedAnalyses(data.analyses);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedAnalyses();
  }, []);

  const handleViewAnalysis = (analysis: SavedAnalysis) => {
    setSelectedAnalysis(analysis);
  };

  const handleCloseDetail = () => {
    setSelectedAnalysis(null);
    // Refresh the list to get any updates
    fetchSavedAnalyses();
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Saved Analyses
          </h1>
          <p className="text-lg text-gray-600">
            Your collection of saved YouTube video analyses
          </p>
        </div>
        
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
          >
            <svg 
              className="w-4 h-4 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10 19l-7-7m0 0l7-7m-7 7h18" 
              />
            </svg>
            Back to Analyzer
          </Link>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <svg 
              className="animate-spin h-8 w-8 text-indigo-500" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              ></circle>
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-lg text-red-700">
            {error}
          </div>
        ) : savedAnalyses.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-gray-600 mb-4">You haven't saved any analyses yet.</p>
            <Link 
              href="/" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Analyze a Video
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {savedAnalyses.map((item) => (
              <div 
                key={item.id} 
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleViewAnalysis(item)}
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h2>
                <div className="flex items-center justify-between mb-4">
                  <a 
                    href={item.videoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg className="h-4 w-4 mr-1 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                    </svg>
                    Watch on YouTube
                  </a>
                  <button
                    className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewAnalysis(item);
                    }}
                  >
                    <svg 
                      className="h-4 w-4 mr-1" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                      />
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
                      />
                    </svg>
                    View Details
                  </button>
                </div>
                <p className="text-gray-700 line-clamp-3 mb-2">{item.analysis.summary}</p>
                <p className="text-gray-500 text-sm">
                  Saved on {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedAnalysis && (
        <SavedAnalysisDetail 
          analysis={selectedAnalysis} 
          onClose={handleCloseDetail} 
        />
      )}
    </main>
  );
} 