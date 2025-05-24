import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader,
  CardTitle, 
  CardFooter
} from "../ui/card";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { X, Copy, CheckCheck, Send } from "lucide-react";
import { StarRating } from "../ui/star-rating";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "../../lib/queryClient";
import { Review } from "../../../../shared/schema";
import { useToast } from "../../hooks/use-toast";

interface AIReplyPanelProps {
  review: Review | null;
  onClose: () => void;
  onApplyReply: (reviewId: number, reply: string) => void;
}

type ReplyTone = 'professional' | 'friendly' | 'apologetic';

export function AIReplyPanel({ review, onClose, onApplyReply }: AIReplyPanelProps) {
  const [generatedReply, setGeneratedReply] = useState<string>("");
  const [selectedTone, setSelectedTone] = useState<ReplyTone>("professional");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generateReplyMutation = useMutation({
    mutationFn: async ({ reviewId, tone }: { reviewId: number, tone: string }) => {
      const response = await apiRequest(
        "POST",
        `/api/reviews/${reviewId}/generate-reply`,
        { tone }
      );
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedReply(data.reply);
    },
    onError: (error) => {
      // TODO: Consider extracting more specific error messages from API responses if available.
      toast({
        title: "Failed to generate reply",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGenerateReply = () => {
    if (review) {
      generateReplyMutation.mutate({ 
        reviewId: review.id, 
        tone: selectedTone 
      });
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(generatedReply);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Reply copied to clipboard",
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyReply = () => {
    if (review) {
      onApplyReply(review.id, generatedReply);
    }
  };

  if (!review) return null;

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">AI Reply Generator</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close AI Reply Panel">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent>
        <div className="p-3 rounded-lg bg-blue-50 mb-4">
          <p className="text-sm italic text-slate-600 mb-2">
            Responding to: <span className="font-medium">{review.reviewerName}'s review</span>
          </p>
          <StarRating rating={review.rating} className="mb-2" />
          <p className="text-sm">{review.reviewText}</p>
        </div>

        <div className="mb-2 flex justify-between items-center">
          <h3 className="font-medium text-sm">Suggested Reply:</h3>
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant={selectedTone === "professional" ? "default" : "outline"}
              className="text-xs h-6 px-2"
              onClick={() => setSelectedTone("professional")}
            >
              Professional
            </Button>
            <Button 
              size="sm" 
              variant={selectedTone === "friendly" ? "default" : "outline"}
              className="text-xs h-6 px-2"
              onClick={() => setSelectedTone("friendly")}
            >
              Friendly
            </Button>
            <Button 
              size="sm" 
              variant={selectedTone === "apologetic" ? "default" : "outline"}
              className="text-xs h-6 px-2"
              onClick={() => setSelectedTone("apologetic")}
            >
              Apologetic
            </Button>
          </div>
        </div>
        
        <Textarea
          value={generatedReply}
          onChange={(e) => setGeneratedReply(e.target.value)}
          placeholder={generateReplyMutation.isPending ? "Generating reply..." : "Click 'Generate Reply' to create a response"}
          className="w-full min-h-[200px] mb-4"
          disabled={generateReplyMutation.isPending}
        />

        <div className="flex space-x-2">
          <Button 
            className="w-full" 
            onClick={handleGenerateReply}
            disabled={generateReplyMutation.isPending || !review}
          >
            {generateReplyMutation.isPending ? "Generating..." : "Generate Reply"}
          </Button>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4">
        <Button 
          variant="default" 
          onClick={handleApplyReply}
          disabled={!generatedReply}
          className="flex-1 mr-2"
        >
          <Send className="mr-2 h-4 w-4" />
          Use This Reply
        </Button>
        <Button 
          variant="outline"
          onClick={handleCopyText}
          disabled={!generatedReply}
          className="flex-1"
        >
          {copied ? (
            <CheckCheck className="mr-2 h-4 w-4" />
          ) : (
            <Copy className="mr-2 h-4 w-4" />
          )}
          {copied ? "Copied!" : "Copy Text"}
        </Button>
      </CardFooter>
    </Card>
  );
}
