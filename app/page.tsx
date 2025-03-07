'use client';

import { useState } from 'react';
import VideoAnalysisForm from '@/components/VideoAnalysisForm';
import VideoAnalysisResults from '@/components/VideoAnalysisResults';
import ErrorMessage from '@/components/ErrorMessage';
import Link from 'next/link';

type TranscriptItem = {
  text: string;
  duration: number;
  offset: number;
};

type Analysis = {
  topic: string;
  keyPoints: string[];
  summary: string;
};

type AnalysisState = {
  isLoading: boolean;
  progress: number;
  error: string | null;
  transcript: TranscriptItem[] | null;
  videoId: string | null;
  videoUrl: string | null;
  analysis: Analysis | null;
  isAnalyzing: boolean;
};

export default function Home() {
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    isLoading: false,
    progress: 0,
    error: null,
    transcript: null,
    videoId: null,
    videoUrl: null,
    analysis: null,
    isAnalyzing: false,
  });

  const handleAnalyzeVideo = async (url: string) => {
    try {
      setAnalysisState({
        isLoading: true,
        progress: 10,
        error: null,
        transcript: null,
        videoId: extractVideoId(url),
        videoUrl: url,
        analysis: null,
        isAnalyzing: false,
      });

      // Simulate progress for transcript fetching
      const progressInterval = setInterval(() => {
        setAnalysisState((prev) => ({
          ...prev,
          progress: Math.min(prev.progress + 5, 40),
        }));
      }, 300);

      // Get transcript using our API route
      const transcriptResponse = await fetch('/api/transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const transcriptData = await transcriptResponse.json();
      clearInterval(progressInterval);

      if (transcriptData.error) {
        throw new Error(transcriptData.error);
      }
      
      // Update progress for AI analysis
      setAnalysisState((prev) => ({
        ...prev,
        isLoading: false,
        progress: 100,
        transcript: transcriptData.transcript,
        isAnalyzing: true,
      }));
      
      // Get AI analysis
      const analysisResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript: transcriptData.transcript }),
      });
      
      const analysisData = await analysisResponse.json();
      
      if (analysisData.error) {
        throw new Error(analysisData.error);
      }
      
      if (!analysisData.analysis) {
        throw new Error('Failed to generate analysis');
      }
      
      setAnalysisState((prev) => ({
        ...prev,
        isAnalyzing: false,
        analysis: analysisData.analysis,
      }));
    } catch (error) {
      setAnalysisState({
        isLoading: false,
        progress: 0,
        error: getErrorMessage(error),
        transcript: null,
        videoId: null,
        videoUrl: null,
        analysis: null,
        isAnalyzing: false,
      });
    }
  };

  const handleReset = () => {
    setAnalysisState({
      isLoading: false,
      progress: 0,
      error: null,
      transcript: null,
      videoId: null,
      videoUrl: null,
      analysis: null,
      isAnalyzing: false,
    });
  };

  const extractVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
      if (error.message.includes('Could not find any transcripts')) {
        return 'This video does not have a transcript available.';
      }
      return error.message;
    }
    return 'An unexpected error occurred. Please try again.';
  };
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      
     <div className="absolute inset-0 h-[calc(100vh-80px)] w-full
      dark:bg-[linear-gradient(to_right,#4a5568_1px,transparent_1px),linear-gradient(to_bottom,#4a5568_1px,transparent_1px)]
      bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)]
      bg-[size:3rem_3rem] 
      [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_70%,transparent_100%)] 
      opacity-[0.15] pointer-events-none z-0"/>
      <div className="mx-auto flex flex-col items-center justify-center w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            YouTube Video Insights
          </h1>
          <p className="text-lg text-gray-600">
            Get AI-powered summaries and key points from any YouTube video
          </p>
        </div>
        
        <div className="flex justify-center mb-4">
          <Link 
            href="/saved" 
            className="text-indigo-600 hover:text-indigo-800 flex items-center"
          >
            <svg 
              className="w-4 h-4 mr-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" 
              />
            </svg>
            View Saved Analyses
          </Link>
        </div>
        
        {analysisState.error && (
          <ErrorMessage 
            message={analysisState.error} 
            onDismiss={handleReset} 
          />
        )}
        
        <div className="w-full flex justify-center">
          {!analysisState.transcript ? (
            <VideoAnalysisForm 
              onSubmit={handleAnalyzeVideo} 
              isLoading={analysisState.isLoading}
              progress={analysisState.progress}
            />
          ) : (
            <VideoAnalysisResults 
              transcript={analysisState.transcript}
              videoId={analysisState.videoId}
              videoUrl={analysisState.videoUrl || ''}
              analysis={analysisState.isAnalyzing ? null : analysisState.analysis}
              onReset={handleReset}
            />
          )}
        </div>
      </div>
    </main>
  );
}
