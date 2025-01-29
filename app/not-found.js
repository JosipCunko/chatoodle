import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center bg-background">
      <div className="text-center p-8 bg-surface rounded-lg shadow-md max-w-md mx-auto">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-text-primary mb-2">
          Page Not Found
        </h2>
        <p className="text-text-secondary mb-4">
          Sorry, we couldn&apos;t find the page you&apos;re looking for.
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition duration-150 ease-in-out"
        >
          <Home className="mr-2 h-5 w-5" />
          Go back home
        </Link>
      </div>
    </div>
  );
}
