import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center bg-gray-50"
      role="main"
    >
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2 items-center">
            <AlertCircle 
              className="h-8 w-8 text-red-500 flex-shrink-0" 
              aria-hidden="true" 
            />
            <h1 className="text-2xl font-bold text-gray-900">404 Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            The page you are looking for doesn't exist or has been moved.
          </p>
          
          <div className="mt-6">
            <a 
              href="/" 
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              aria-label="Return to dashboard"
            >
              Return to Dashboard
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
