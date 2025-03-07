import { NextRequest, NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';

export async function POST(request: NextRequest) {
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { headers });
  }

  try {
    // Validate content type
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400, headers }
      );
    }

    // Parse request body
    let url;
    try {
      const body = await request.json();
      url = body.url;
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400, headers }
      );
    }
    
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'YouTube URL is required and must be a string' },
        { status: 400, headers }
      );
    }

    // Extract video ID from URL
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (!videoIdMatch) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL. Please provide a valid video URL.' },
        { status: 400, headers }
      );
    }

    const videoId = videoIdMatch[1];

    try {
      // First check if captions are available
      const transcript = await YoutubeTranscript.fetchTranscript(url, {
        lang: 'en'
      }).catch((err) => {
        throw new Error('TRANSCRIPT_UNAVAILABLE');
      });
      
      if (!transcript || transcript.length === 0) {
        return NextResponse.json(
          { error: 'This video does not have any captions available. Please try a different video.' },
          { status: 404, headers }
        );
      }

      return NextResponse.json({ transcript }, { headers });
    } catch (transcriptError) {
      console.error('Transcript fetch error:', transcriptError);

      // Handle specific transcript errors
      if (transcriptError instanceof Error) {
        if (transcriptError.message === 'TRANSCRIPT_UNAVAILABLE') {
          return NextResponse.json(
            { 
              error: 'This video does not have captions enabled. Please try a video that has closed captions or subtitles available.',
              videoId 
            },
            { status: 400, headers }
          );
        }

        const errorMessage = transcriptError.message.toLowerCase();
        
        if (errorMessage.includes('could not find any transcripts') || 
            errorMessage.includes('transcript is disabled') ||
            errorMessage.includes('no transcript available')) {
          return NextResponse.json(
            { 
              error: 'This video does not have captions or transcripts enabled. Please try a different video that has closed captions available.',
              videoId
            },
            { status: 400, headers }
          );
        }

        if (errorMessage.includes('network error') || errorMessage.includes('failed to fetch')) {
          return NextResponse.json(
            { error: 'Network error while fetching transcript. Please check your connection and try again.' },
            { status: 503, headers }
          );
        }
      }

      // Generic transcript error
      return NextResponse.json(
        { 
          error: 'Unable to fetch video transcript. Please ensure the video has captions enabled and try again, or use a different video.',
          videoId
        },
        { status: 500, headers }
      );
    }
  } catch (error) {
    console.error('General API error:', error);
    
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500, headers }
    );
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}