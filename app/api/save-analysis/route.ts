import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  console.log('Save analysis API route called');
  
  try {
    // Log the request body for debugging
    const requestBody = await request.text();
    console.log('Request body:', requestBody);
    
    // Parse the JSON manually to better handle errors
    let data;
    try {
      data = JSON.parse(requestBody);
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body', details: String(parseError) },
        { status: 400 }
      );
    }
    
    const { videoId, videoUrl, analysis } = data;
    
    console.log('Parsed data:', { videoId, videoUrl, analysis: !!analysis });
    
    if (!videoId || !videoUrl || !analysis) {
      console.error('Missing required fields:', { videoId: !!videoId, videoUrl: !!videoUrl, analysis: !!analysis });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Attempting to save to database...');
    
    // Save the analysis to the database
    const savedAnalysis = await prisma.savedAnalysis.create({
      data: {
        videoId,
        videoUrl,
        title: analysis.topic || 'Untitled Analysis',
        analysis, // Store the entire analysis object as JSON
      },
    });
    
    console.log('Analysis saved successfully:', savedAnalysis.id);
    
    return NextResponse.json({ 
      success: true, 
      id: savedAnalysis.id 
    });
  } catch (error) {
    console.error('Error saving analysis:', error);
    
    let errorMessage = 'Failed to save analysis';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    // Always return a JSON response, even for errors
    return NextResponse.json(
      { error: errorMessage, details: String(error) },
      { status: 500 }
    );
  }
} 