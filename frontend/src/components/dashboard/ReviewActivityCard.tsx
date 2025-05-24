import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Star } from 'lucide-react'; // Assuming Star icon for rating
import { cn } from '../../lib/utils';

export interface ReviewActivity {
  id: string | number;
  name: string;
  profilePictureUrl?: string;
  rating: number;
  replySnippet: string;
  date: string; // Or Date object, format as needed
}

interface ReviewActivityCardProps {
  activity: ReviewActivity;
  className?: string;
}

export function ReviewActivityCard({ activity, className }: ReviewActivityCardProps) {
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={cn(
            "h-4 w-4",
            i < rating ? "text-yellow-400 fill-yellow-400" : "text-slate-300 dark:text-slate-600"
          )}
        />
      );
    }
    return stars;
  };

  return (
    <Card className={cn("shadow-sm hover:shadow-md transition-shadow", className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={activity.profilePictureUrl} alt={activity.name} />
                    <AvatarFallback>{activity.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle className="text-sm font-medium text-slate-800 dark:text-slate-200">{activity.name}</CardTitle>
                    <div className="flex items-center">{renderStars(activity.rating)}</div>
                </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{activity.date}</p>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
          {activity.replySnippet}
        </p>
      </CardContent>
    </Card>
  );
} 