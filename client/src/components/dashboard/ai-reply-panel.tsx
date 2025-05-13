import { useState, useMemo, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Sparkles, Copy, Repeat, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import debounce from 'lodash.debounce';

// Types for tone options
type ToneOption = {
  value: string;
  label: string;
  description: string;
};

// Define available tone options
const toneOptions: ToneOption[] = [
  { 
    value: 'professional', 
    label: 'Professional', 
    description: 'Polite and businesslike' 
  },
  { 
    value: 'friendly', 
    label: 'Friendly', 
    description: 'Warm and conversational' 
  },
  { 
    value: 'sympathetic', 
    label: 'Sympathetic', 
    description: 'Understanding and apologetic' 
  },
  { 
    value: 'direct', 
    label: 'Direct', 
    description: 'Clear and straightforward' 
  },
  { 
    value: 'thankful', 
    label: 'Thankful', 
    description: 'Grateful and appreciative' 
  }
];

interface AIReplyPanelProps {
  reviewId: number;
  reviewContent: string;
  reviewRating: number;
  className?: string;
}

export function AIReplyPanel({ 
  reviewId, 
  reviewContent, 
  reviewRating,
  className 
}: AIReplyPanelProps) {
  // State for selected tone
  const [tone, setTone] = useState(() => {
    // Get tone preference from localStorage or default to 'professional'
    const savedTone = localStorage.getItem('preferred_ai_tone');
    return savedTone || 'professional';
  });
  
  // State to track if a regeneration is in progress
  const [isRegenerating, setIsRegenerating] = useState(false);
  
  const { toast } = useToast();
  
  // Handle tone change
  const handleToneChange = (value: string) => {
    setTone(value);
    // Save preference in localStorage
    localStorage.setItem('preferred_ai_tone', value);
  };
  
  // Copy reply to clipboard
  const handleCopyToClipboard = () => {
    if (reply) {
      navigator.clipboard.writeText(reply);
      toast({
        title: "Copied!",
        description: "Reply copied to clipboard",
      });
    }
  };
  
  // Regenerate AI Reply with debounce to prevent spam
  const regenerateReply = useCallback(() => {
    if (isRegenerating) return;
    
    setIsRegenerating(true);
    aiReplyQuery.refetch().finally(() => {
      setTimeout(() => setIsRegenerating(false), 1000); // Add a small delay to prevent spam
    });
  }, [isRegenerating]);
  
  // Debounce regenerate function to prevent multiple rapid calls
  const debouncedRegenerate = useMemo(
    () => debounce(regenerateReply, 500),
    [regenerateReply]
  );
  
  // AI Reply query with dependencies
  const aiReplyQuery = useQuery({
    queryKey: [`/api/ai/reply/${reviewId}`, tone, reviewContent, isRegenerating],
    queryFn: async () => {
      const res = await apiRequest("POST", "/api/ai/reply", {
        reviewId,
        tone,
        reviewContent,
        rating: reviewRating
      });
      return await res.json();
    },
    enabled: !!reviewId && !!reviewContent,
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes unless regenerated
  });
  
  // Memoize the AI reply to prevent unnecessary re-renders
  const reply = useMemo(() => {
    if (aiReplyQuery.isSuccess && aiReplyQuery.data) {
      return aiReplyQuery.data.reply;
    }
    return '';
  }, [aiReplyQuery.isSuccess, aiReplyQuery.data]);
  
  // If the reviewId changes, we should re-fetch
  useEffect(() => {
    if (reviewId) {
      aiReplyQuery.refetch();
    }
  }, [reviewId]);
  
  // Clear debounce on unmount
  useEffect(() => {
    return () => {
      debouncedRegenerate.cancel();
    };
  }, [debouncedRegenerate]);
  
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-md flex items-center">
            <Sparkles className="h-4 w-4 mr-2 text-primary" aria-hidden="true" />
            AI-Powered Reply Suggestion
          </CardTitle>
          {aiReplyQuery.isFetching && !aiReplyQuery.isLoading && (
            <span aria-live="polite" className="flex items-center">
              <Clock className="h-4 w-4 animate-pulse text-muted-foreground" aria-hidden="true" />
              <span className="sr-only">Generating new reply...</span>
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="space-y-4">
          <div>
            <Label htmlFor="tone-select">Response Tone</Label>
            <Select value={tone} onValueChange={handleToneChange}>
              <SelectTrigger 
                id="tone-select" 
                className="mt-1.5"
                aria-label="Select response tone"
              >
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                {toneOptions.map((toneOption) => (
                  <SelectItem 
                    key={toneOption.value} 
                    value={toneOption.value}
                    aria-description={toneOption.description}
                  >
                    <div className="flex flex-col">
                      <span>{toneOption.label}</span>
                      <span className="text-xs text-muted-foreground">{toneOption.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="ai-reply">Generated Reply</Label>
            {aiReplyQuery.isLoading ? (
              <div 
                className="space-y-2 mt-2"
                role="status"
                aria-label="Loading AI-generated reply"
                aria-live="polite"
              >
                <Skeleton className="h-4 w-full" aria-hidden="true" />
                <Skeleton className="h-4 w-full" aria-hidden="true" />
                <Skeleton className="h-4 w-full" aria-hidden="true" />
                <Skeleton className="h-4 w-3/4" aria-hidden="true" />
                <span className="sr-only">Generating AI reply, please wait...</span>
              </div>
            ) : (
              <Textarea
                id="ai-reply"
                className="mt-1.5 min-h-[120px]"
                value={reply}
                readOnly
                aria-label="AI-generated reply suggestion"
              />
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-0">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={debouncedRegenerate}
          disabled={aiReplyQuery.isLoading || isRegenerating}
          aria-label="Regenerate AI reply"
        >
          <Repeat className="h-4 w-4 mr-2" aria-hidden="true" />
          Regenerate
        </Button>
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={handleCopyToClipboard}
          disabled={!reply || aiReplyQuery.isLoading}
          aria-label="Copy reply to clipboard"
        >
          <Copy className="h-4 w-4 mr-2" aria-hidden="true" />
          Copy to Clipboard
        </Button>
      </CardFooter>
    </Card>
  );
}

export default AIReplyPanel;