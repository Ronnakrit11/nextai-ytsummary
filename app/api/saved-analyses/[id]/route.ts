import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Analysis ID is required' },
        { status: 400 }
      );
    }

    // Get the request body
    const { analysis } = await request.json();
    
    if (!analysis) {
      return NextResponse.json(
        { error: 'Analysis data is required' },
        { status: 400 }
      );
    }

    // Check if the analysis exists
    const existingAnalysis = await prisma.savedAnalysis.findUnique({
      where: { id },
    });

    if (!existingAnalysis) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      );
    }

    // Update the analysis
    const updatedAnalysis = await prisma.savedAnalysis.update({
      where: { id },
      data: {
        title: analysis.topic || 'Untitled Analysis',
        analysis: {
          topic: analysis.topic,
          keyPoints: analysis.keyPoints,
          summary: analysis.summary,
        },
      },
    });

    return NextResponse.json({
      success: true,
      analysis: updatedAnalysis,
    });
  } catch (error) {
    console.error('Error updating analysis:', error);
    
    let errorMessage = 'Failed to update analysis';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { error: errorMessage, details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Analysis ID is required' },
        { status: 400 }
      );
    }

    // Get the analysis
    const analysis = await prisma.savedAnalysis.findUnique({
      where: { id },
    });

    if (!analysis) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Error fetching analysis:', error);
    
    let errorMessage = 'Failed to fetch analysis';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Analysis ID is required' },
        { status: 400 }
      );
    }

    // Check if the analysis exists
    const existingAnalysis = await prisma.savedAnalysis.findUnique({
      where: { id },
    });

    if (!existingAnalysis) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      );
    }

    // Delete the analysis
    await prisma.savedAnalysis.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Analysis deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting analysis:', error);
    
    let errorMessage = 'Failed to delete analysis';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 