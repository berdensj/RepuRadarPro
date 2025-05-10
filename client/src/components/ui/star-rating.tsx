import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function StarRating({ rating, size = "md", className }: StarRatingProps) {
  // Convert rating to nearest half star
  const roundedRating = Math.round(rating * 2) / 2;

  // Create array of stars (5 total)
  const starElements = Array(5).fill(0).map((_, i) => {
    const starValue = i + 1;
    const diff = roundedRating - starValue;

    let starComponent;
    if (diff >= 0) {
      // Full star
      starComponent = (
        <Star 
          key={i} 
          className={cn("fill-current", size === "sm" ? "w-3 h-3" : size === "md" ? "w-4 h-4" : "w-5 h-5")} 
        />
      );
    } else if (diff > -1 && diff < 0) {
      // Half star
      starComponent = (
        <StarHalf 
          key={i} 
          className={cn("fill-current", size === "sm" ? "w-3 h-3" : size === "md" ? "w-4 h-4" : "w-5 h-5")} 
        />
      );
    } else {
      // Empty star
      starComponent = (
        <Star 
          key={i} 
          className={cn("stroke-current fill-none", size === "sm" ? "w-3 h-3" : size === "md" ? "w-4 h-4" : "w-5 h-5")} 
        />
      );
    }

    return starComponent;
  });

  return (
    <div className={cn("flex text-amber-400", className)}>
      {starElements}
    </div>
  );
}
