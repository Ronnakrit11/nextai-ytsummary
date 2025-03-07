import { useState, useEffect } from 'react';

interface SavedAnalysisDetailProps {
  analysis: {
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
  onClose: () => void;
}

export default function SavedAnalysisDetail({ analysis, onClose }: SavedAnalysisDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editedAnalysis, setEditedAnalysis] = useState({
    topic: analysis.analysis.topic,
    keyPoints: [...analysis.analysis.keyPoints],
    summary: analysis.analysis.summary,
  });

  // Reset success message after 3 seconds
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (saveSuccess) {
      timer = setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [saveSuccess]);

  const handleEdit = () => {
    setIsEditing(true);
    setSaveSuccess(false);
    setShowDeleteConfirm(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedAnalysis({
      topic: analysis.analysis.topic,
      keyPoints: [...analysis.analysis.keyPoints],
      summary: analysis.analysis.summary,
    });
    setError(null);
  };

  const handleKeyPointChange = (index: number, value: string) => {
    const newKeyPoints = [...editedAnalysis.keyPoints];
    newKeyPoints[index] = value;
    setEditedAnalysis({
      ...editedAnalysis,
      keyPoints: newKeyPoints,
    });
  };

  const handleAddKeyPoint = () => {
    setEditedAnalysis({
      ...editedAnalysis,
      keyPoints: [...editedAnalysis.keyPoints, ''],
    });
  };

  const handleRemoveKeyPoint = (index: number) => {
    const newKeyPoints = [...editedAnalysis.keyPoints];
    newKeyPoints.splice(index, 1);
    setEditedAnalysis({
      ...editedAnalysis,
      keyPoints: newKeyPoints,
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const response = await fetch(`/api/saved-analyses/${analysis.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysis: editedAnalysis,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update analysis');
      }

      // Update the local analysis object with the edited values
      analysis.title = editedAnalysis.topic;
      analysis.analysis = {
        topic: editedAnalysis.topic,
        keyPoints: editedAnalysis.keyPoints,
        summary: editedAnalysis.summary,
      };

      setIsEditing(false);
      setSaveSuccess(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
    setIsEditing(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/saved-analyses/${analysis.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete analysis');
      }

      // Close the modal and refresh the list
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred while deleting');
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Analysis' : analysis.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {showDeleteConfirm ? (
          <div className="p-6">
            <div className="bg-red-50 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-medium text-red-800 mb-2">Delete Analysis</h3>
              <p className="text-red-700 mb-4">
                Are you sure you want to delete this analysis? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={handleConfirmDelete}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
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
                      Deleting...
                    </>
                  ) : (
                    'Yes, Delete'
                  )}
                </button>
                <button
                  onClick={handleCancelDelete}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6">
            {/* Video embed */}
            <div className="aspect-w-16 aspect-h-9 mb-6">
              <iframe
                src={`https://www.youtube.com/embed/${analysis.videoId}`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full rounded-lg"
              ></iframe>
            </div>

            {saveSuccess && (
              <div className="mb-6 p-3 bg-green-50 text-green-700 rounded-md flex items-center">
                <svg 
                  className="h-5 w-5 mr-2" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M5 13l4 4L19 7" 
                  />
                </svg>
                Analysis updated successfully!
              </div>
            )}

            {/* Topic */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Topic</h3>
              {isEditing ? (
                <input
                  type="text"
                  value={editedAnalysis.topic}
                  onChange={(e) => setEditedAnalysis({ ...editedAnalysis, topic: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h2 className="text-xl font-semibold text-gray-900">{analysis.analysis.topic}</h2>
                </div>
              )}
            </div>

            {/* Key Points */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Key Points</h3>
              {isEditing ? (
                <div className="space-y-3">
                  {editedAnalysis.keyPoints.map((point, index) => (
                    <div key={index} className="flex items-start">
                      <span className="flex-shrink-0 h-6 w-6 rounded-full bg-lime-100 flex items-center justify-center mr-3 mt-2">
                        <span className="text-lime-600 text-sm font-medium">{index + 1}</span>
                      </span>
                      <div className="flex-grow">
                        <textarea
                          value={point}
                          onChange={(e) => handleKeyPointChange(index, e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                          rows={2}
                        />
                      </div>
                      <button
                        onClick={() => handleRemoveKeyPoint(index)}
                        className="ml-2 text-red-500 hover:text-red-700 mt-2"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={handleAddKeyPoint}
                    className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Key Point
                  </button>
                </div>
              ) : (
                <ul className="space-y-3 bg-gray-50 p-4 rounded-lg">
                  {analysis.analysis.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start">
                      <span className="flex-shrink-0 h-6 w-6 rounded-full bg-lime-100 flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-lime-600 text-sm font-medium">{index + 1}</span>
                      </span>
                      <span className="text-gray-700">{point}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Summary */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Summary</h3>
              {isEditing ? (
                <textarea
                  value={editedAnalysis.summary}
                  onChange={(e) => setEditedAnalysis({ ...editedAnalysis, summary: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  rows={6}
                />
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-line">
                  {analysis.analysis.summary}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex justify-between mt-8">
              <div className="flex space-x-3">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleCancel}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      disabled={isSaving}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      disabled={isSaving}
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
                        'Save Changes'
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleEdit}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <svg
                        className="h-4 w-4 mr-1.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Edit Analysis
                    </button>
                    <button
                      onClick={handleDeleteClick}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <svg
                        className="h-4 w-4 mr-1.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Delete
                    </button>
                  </>
                )}
              </div>
              <a
                href={analysis.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg
                  className="h-4 w-4 mr-1.5 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                </svg>
                Watch on YouTube
              </a>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
                {error}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 