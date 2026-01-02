'use client';

interface ProgressTimelineProps {
  messages: string[];
  isLoading: boolean;
  errors: string[];
}

export function ProgressTimeline({ messages, isLoading, errors }: ProgressTimelineProps) {
  if (!isLoading && messages.length === 0 && errors.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-6">
      <h3 className="font-semibold text-gray-700 mb-3">
        {isLoading ? '🔄 Fetching Jobs...' : '✅ Fetch Complete'}
      </h3>

      <div className="space-y-2">
        {messages.map((message, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <span className="text-green-500">✓</span>
            <span className="text-gray-600">{message}</span>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-sm">
            <span className="animate-spin">⏳</span>
            <span className="text-gray-500">Processing...</span>
          </div>
        )}

        {errors.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            {errors.map((error, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-red-600">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
