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

    const transcript = await YoutubeTranscript.fetchTranscript(url);
    
    return NextResponse.json({ transcript });
  } catch (error) {
    console.error('Error fetching transcript:', error);
    
    let errorMessage = 'Failed to fetch transcript';
    if (error instanceof Error) {
      if (error.message.includes('Could not find any transcripts')) {
        errorMessage = 'This video does not have a transcript available.';
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 