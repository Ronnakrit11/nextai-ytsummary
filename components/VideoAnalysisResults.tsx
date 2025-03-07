import SaveButton from './SaveButton';

interface TranscriptItem {
  text: string;
  duration: number;
  offset: number;
}

interface Analysis {
  topic: string;
  keyPoints: string[];
  summary: string;
}

interface VideoAnalysisResultsProps {
  transcript: TranscriptItem[];
  videoId: string | null;
  videoUrl: string;
  analysis: Analysis | null;
  onReset: () => void;
}

export default function VideoAnalysisResults({
  transcript,
  videoId,
  videoUrl,
  analysis,
  onReset,
}: VideoAnalysisResultsProps) {
  return (
    <div className="card bg-white overflow-hidden w-full max-w-4xl rounded-xl shadow-lg border border-gray-100">
      {videoId && (
        <div className="aspect-w-16 aspect-h-9">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          ></iframe>
        </div>
      )}
      
      <div className="p-8">
        {analysis ? (
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 font-sans">
              {analysis.topic || 'Video Analysis'}
            </h2>
            
            <div className="mb-8">
              <h3 className="text-xl font-medium text-gray-800 mb-4 font-sans">Key Points</h3>
              <ul className="space-y-3">
                {analysis.keyPoints && analysis.keyPoints.length > 0 ? (
                  analysis.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start">
                      <span className="flex-shrink-0 h-6 w-6 rounded-full bg-lime-100 flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-lime-600 text-sm font-medium font-sans">{index + 1}</span>
                      </span>
                      <span className="text-gray-700 font-sans">{point}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-700 font-sans">No key points identified</li>
                )}
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-medium text-gray-800 mb-4 font-sans">Summary</h3>
              <div className="bg-gray-50 rounded-lg p-5 text-gray-700 leading-relaxed font-sans">
                {analysis.summary || 'No summary available'}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-pulse flex space-x-4 w-full max-w-md">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
            <p className="mt-6 text-gray-600 font-medium font-sans">Generating insights from video content...</p>
          </div>
        )}
        
        <div className="flex justify-between items-center mt-8">
          {analysis && (
            <SaveButton 
              videoId={videoId} 
              videoUrl={videoUrl}
              analysis={analysis} 
            />
          )}
          <button
            onClick={onReset}
            className="inline-flex items-center px-5 py-2.5 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-lime-500 to-green-400 hover:from-lime-600 hover:to-green-500 font-sans"
          >
            Analyze Another Video
          </button>
        </div>
      </div>
    </div>
  );
} 