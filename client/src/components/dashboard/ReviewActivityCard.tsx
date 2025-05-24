import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ReviewActivityCardProps {
  customerName: string;
  rating: number;
  replySnippet: string;
  date: Date;
  platformIcon?: React.ReactNode;
}

export function ReviewActivityCard({ customerName, rating, replySnippet, date, platformIcon }: ReviewActivityCardProps) {
  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold">{customerName}</h4>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'
                    }`}
                  />
                ))}
              </div>
              {platformIcon && <div className="ml-2">{platformIcon}</div>}
            </div>
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{replySnippet}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {formatDistanceToNow(date, { addSuffix: true })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 