import { useState } from 'react';

interface SaveButtonProps {
  videoId: string | null;
  videoUrl: string;
  analysis: {
    topic: string;
    keyPoints: string[];
    summary: string;
  } | null;
  onSaved?: () => void;
}

export default function SaveButton({ videoId, videoUrl, analysis, onSaved }: SaveButtonProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!videoId || !analysis) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      console.log('Saving analysis for video:', videoId);
      console.log('Analysis data:', { 
        videoId, 
        videoUrl, 
        analysisTopicLength: analysis.topic?.length || 0,
        analysisKeyPointsCount: analysis.keyPoints?.length || 0,
        analysisSummaryLength: analysis.summary?.length || 0
      });
      
      const payload = {
        videoId,
        videoUrl,
        analysis,
      };
      
      console.log('Sending payload to API');
      
      const response = await fetch('/api/save-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      console.log('API response status:', response.status);
      
      // Check if the response is JSON
      const contentType = response.headers.get('content-type');
      console.log('Response content type:', contentType);
      
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned non-JSON response. Check server logs.');
      }
      
      const data = await response.json();
      console.log('API response data:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save analysis');
      }
      
      setIsSaved(true);
      if (onSaved) onSaved();
    } catch (error) {
      console.error('Save error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };

  if (isSaved) {
    return (
      <button 
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 cursor-default"
        disabled
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
            d="M5 13l4 4L19 7" 
          />
        </svg>
        Saved
      </button>
    );
  }

  return (
    <div>
      <button
        onClick={handleSave}
        disabled={isSaving || !videoId || !analysis}
        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
          isSaving 
            ? 'bg-indigo-400 cursor-wait' 
            : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
        }`}
      >
        {isSaving ? (
          <>
            <svg 
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
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
            Saving...
          </>
        ) : (
          <>
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
                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" 
              />
            </svg>
            Save Analysis
          </>
        )}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
} 