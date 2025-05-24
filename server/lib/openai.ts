import OpenAI from "openai";
import { Review } from "../../shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface AIReplyOptions {
  includeGreeting?: boolean;
  includeClosing?: boolean;
  businessName?: string;
}

/**
 * Generates an AI-powered reply to a customer review
 */
export async function generateAIReply(
  review: Review,
  tone: string = "professional",
  options: AIReplyOptions = {}
): Promise<string> {
  try {
    const toneInstructions = getToneInstructions(tone);
    const defaultOptions = {
      includeGreeting: true,
      includeClosing: true,
      businessName: "Our Business",
      ...options
    };

    const prompt = `
    You are an experienced customer service professional who specializes in responding to online reviews for ${defaultOptions.businessName}.
    
    Please write a thoughtful reply to the following ${review.rating}-star review by ${review.reviewerName} from ${review.platform}:
    
    "${review.reviewText}"
    
    ${toneInstructions}
    
    ${defaultOptions.includeGreeting ? "Include a personalized greeting." : "Skip the greeting."}
    ${defaultOptions.includeClosing ? "Include a professional closing with a name." : "Skip the closing."}
    
    Keep the response concise, sincere, and specific to the customer's feedback.
    If the review is negative, acknowledge their concerns and offer a solution or way forward.
    If the review is positive, express genuine gratitude and reinforce what they appreciated.
    
    Reply with only the response text, no additional commentary.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 400,
      temperature: 0.7,
    });

    const messageContent = response.choices[0].message.content;
    if (!messageContent) {
      throw new Error("OpenAI returned empty message content for AI reply.");
    }
    return messageContent;
  } catch (error) {
    console.error("Error generating AI reply:", error);
    throw new Error("Failed to generate AI reply due to an internal error.");
  }
}

/**
 * Analyzes a review text to identify sentiment and key themes
 */
export async function analyzeReviewSentiment(reviewText: string): Promise<{
  sentiment: "positive" | "negative" | "neutral";
  score: number;
  keyThemes: string[];
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a review sentiment analyzer. Analyze the sentiment of the review text and provide a rating from 0 to 100 (0 being extremely negative, 100 being extremely positive). Also identify up to 3 key themes mentioned in the review. Respond with JSON in this format: { 'sentiment': 'positive'|'negative'|'neutral', 'score': number, 'keyThemes': string[] }",
        },
        {
          role: "user",
          content: reviewText,
        },
      ],
      response_format: { type: "json_object" },
    });

    const messageContent = response.choices[0].message.content;
    if (!messageContent) {
      throw new Error("OpenAI returned empty message content for sentiment analysis.");
    }
    const result = JSON.parse(messageContent);

    return {
      sentiment: result.sentiment,
      score: result.score,
      keyThemes: result.keyThemes,
    };
  } catch (error) {
    console.error("Error analyzing review sentiment:", error);
    throw new Error("Failed to analyze sentiment due to an internal error.");
  }
}

/**
 * Generates keyword trends based on a collection of reviews
 */
export async function generateKeywordTrends(reviews: Review[]): Promise<{
  [keyword: string]: { count: number; sentiment: number; trend: "increasing" | "decreasing" | "stable" };
}> {
  try {
    if (reviews.length === 0) {
      return {};
    }

    const reviewTexts = reviews.map(r => ({
      text: r.reviewText,
      rating: r.rating,
      date: r.date
    }));

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a review analysis expert. Identify key themes and topics from these reviews. For each theme, calculate how many times it appears, the average sentiment (0-100), and whether the trend is increasing, decreasing, or stable over time. Return JSON in this format: { 'keyword1': { 'count': number, 'sentiment': number, 'trend': 'increasing'|'decreasing'|'stable' }, ... }",
        },
        {
          role: "user",
          content: JSON.stringify(reviewTexts),
        },
      ],
      response_format: { type: "json_object" },
    });

    const messageContentTrends = response.choices[0].message.content;
    if (!messageContentTrends) {
      throw new Error("OpenAI returned empty message content for keyword trends.");
    }
    return JSON.parse(messageContentTrends);
  } catch (error) {
    console.error("Error generating keyword trends:", error);
    throw new Error("Failed to generate keyword trends due to an internal error.");
  }
}

function getToneInstructions(tone: string): string {
  switch (tone.toLowerCase()) {
    case "friendly":
      return "Use a warm, conversational, and approachable tone. Be personable and casual while maintaining professionalism.";
    case "apologetic":
      return "Express sincere regret and empathy. Acknowledge any mistakes or shortcomings, and focus on making things right.";
    case "formal":
      return "Use a highly professional, somewhat formal language. Maintain appropriate distance while still being respectful and helpful.";
    default: // professional
      return "Maintain a balanced, professional tone that is courteous and respectful without being overly formal or casual.";
  }
}
