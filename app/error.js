"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center bg-background">
      <div className="text-center p-8 bg-surface rounded-lg shadow-md max-w-md mx-auto">
        <AlertCircle className="mx-auto h-16 w-16 text-danger mb-4" />
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          Oops! Something went wrong
        </h1>
        <p className="text-text-secondary mb-4">
          We&apos;re sorry, but an error occurred while processing your request.
        </p>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition duration-150 ease-in-out"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
