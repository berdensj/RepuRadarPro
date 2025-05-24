import React, { useState } from 'react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { ErrorBoundary } from './ErrorBoundary';
import { AlertTriangle } from 'lucide-react';

// Component that will throw an error when button is clicked
function BuggyComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('This is a test error to demonstrate ErrorBoundary functionality');
  }
  
  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded">
      <p className="text-green-800">✅ Component is working correctly!</p>
    </div>
  );
}

export function ErrorBoundaryDemo() {
  const [shouldThrow, setShouldThrow] = useState(false);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Error Boundary Demo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          This demo shows how our ErrorBoundary component handles component crashes gracefully.
        </p>
        
        <div className="space-x-2">
          <Button 
            onClick={() => setShouldThrow(true)}
            variant="destructive"
          >
            Trigger Error
          </Button>
          <Button 
            onClick={() => setShouldThrow(false)}
            variant="outline"
          >
            Reset Component
          </Button>
        </div>

        <ErrorBoundary showError={true}>
          <BuggyComponent shouldThrow={shouldThrow} />
        </ErrorBoundary>
      </CardContent>
    </Card>
  );
} 