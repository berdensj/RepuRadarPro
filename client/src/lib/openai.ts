import { apiRequest } from "./queryClient";

/**
 * Generate an AI-powered response suggestion for a review
 * 
 * @param reviewId - The ID of the review to generate a response for
 * @param tone - The tone to use for the response (professional, friendly, apologetic, formal)
 * @returns A promise that resolves to the generated response text
 */
export async function generateReply(reviewId: number, tone: string = 'professional'): Promise<string> {
  try {
    const response = await apiRequest(
      "POST", 
      "/api/reviews/generate-reply", 
      { reviewId, tone }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to generate AI response");
    }
    
    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error("Error generating AI reply:", error);
    throw error;
  }
}

/**
 * Analyze review sentiment using AI
 * 
 * @param reviewText - The text of the review to analyze
 * @returns A promise that resolves to an object with sentiment information
 */
export async function analyzeSentiment(reviewText: string): Promise<{
  sentiment: "positive" | "negative" | "neutral";
  score: number;
  keyThemes: string[];
}> {
  try {
    const response = await apiRequest(
      "POST", 
      "/api/reviews/analyze-sentiment", 
      { reviewText }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to analyze sentiment");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    throw error;
  }
}