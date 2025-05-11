import { apiRequest } from "./queryClient";

/**
 * Client-side function to generate an AI-powered reply to a review
 */
export async function generateReply(reviewId: number, tone: string = "professional") {
  try {
    const response = await apiRequest(
      "POST",
      `/api/reviews/${reviewId}/generate-reply`,
      { tone }
    );
    
    const data = await response.json();
    return data.reply;
  } catch (error) {
    console.error("Error generating AI reply:", error);
    throw error;
  }
}
