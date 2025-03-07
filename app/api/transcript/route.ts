import { NextRequest, NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json(
        { error: 'YouTube URL is required' },
        { status: 400 }
      );
    }

    try {
      const transcript = await YoutubeTranscript.fetchTranscript(url);
      return NextResponse.json({ transcript });
    } catch (transcriptError) {
      // Check for specific transcript-related errors
      if (transcriptError instanceof Error) {
        if (transcriptError.message.includes('Could not find any transcripts') || 
            transcriptError.message.includes('Transcript is disabled')) {
          return NextResponse.json(
            { error: 'This video does not have captions or transcripts enabled. Please try a different video.' },
            { status: 400 }
          );
        }
      }
      // For other transcript errors
      return NextResponse.json(
        { error: 'Unable to fetch video transcript. Please try again or use a different video.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in transcript API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}