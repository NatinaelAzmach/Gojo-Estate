'use client';

import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4 text-center">
      <h2 className="text-2xl font-semibold text-navy-brand">Something went wrong</h2>
      <p className="text-gray-500 text-sm max-w-md">
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={reset}
        className="mt-2 px-6 py-2 bg-teal-brand text-white rounded-md hover:bg-teal-700 transition-colors text-sm font-medium"
      >
        Try again
      </button>
    </div>
  );
}
