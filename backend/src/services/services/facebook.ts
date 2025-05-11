import axios from 'axios';
import { storage } from '../storage';
import { insertReviewSchema } from '@shared/schema';

// Interface for Facebook Page Review data structure
interface FacebookPageReview {
  created_time: string;
  recommendation_type: string; // 'positive' or 'negative'
  rating?: number; // Not always provided
  review_text: string;
  reviewer: {
    id: string;
    name: string;
  };
  open_graph_story?: {
    id: string;
  };
  id: string;
}

interface FacebookReviewsResponse {
  data: FacebookPageReview[];
  paging: {
    cursors: {
      before: string;
      after: string;
    };
    next?: string;
  };
}

interface FacebookPageResponse {
  name: string;
  id: string;
  overall_star_rating?: number;
  rating_count?: number;
}

/**
 * Fetches reviews from Facebook Graph API for a page
 * 
 * @param pageId - The Facebook Page ID to fetch reviews for
 * @param accessToken - Facebook access token with page permissions
 * @returns Promise with review data
 */
export async function fetchFacebookReviews(pageId: string, accessToken: string) {
  try {
    // Get page details
    const pageResponse = await axios.get<FacebookPageResponse>(
      `https://graph.facebook.com/v18.0/${pageId}`,
      {
        params: {
          fields: 'name,overall_star_rating,rating_count',
          access_token: accessToken,
        },
      }
    );

    // Get page ratings and reviews
    const reviewsResponse = await axios.get<FacebookReviewsResponse>(
      `https://graph.facebook.com/v18.0/${pageId}/ratings`,
      {
        params: {
          fields: 'created_time,recommendation_type,rating,review_text,reviewer{id,name},open_graph_story',
          access_token: accessToken,
          limit: 100,
        },
      }
    );

    return {
      pageName: pageResponse.data.name,
      reviews: reviewsResponse.data.data || [],
      overallRating: pageResponse.data.overall_star_rating,
      ratingCount: pageResponse.data.rating_count,
    };
  } catch (error) {
    console.error('Error fetching Facebook reviews:', error);
    throw error;
  }
}

/**
 * Imports Facebook page reviews for a user's location
 * 
 * @param userId - User ID
 * @param locationId - Location ID
 * @param facebookPageId - Facebook Page ID
 * @param accessToken - Facebook access token
 * @returns Promise with import results
 */
export async function importFacebookReviews(
  userId: number,
  locationId: number,
  facebookPageId: string,
  accessToken: string
) {
  try {
    // Fetch reviews from Facebook API
    const { reviews } = await fetchFacebookReviews(facebookPageId, accessToken);
    
    // Get existing reviews to avoid duplicates
    const existingReviews = await storage.getReviewsByPlatform(userId, 'Facebook');
    const existingExternalIds = new Set(
      existingReviews
        .filter(r => r.externalId !== null)
        .map(r => r.externalId)
    );

    const newReviews = [];
    const importResults = {
      total: reviews.length,
      imported: 0,
      skipped: 0,
    };

    // Process each review
    for (const review of reviews) {
      // Create an external ID based on review details
      const externalId = `facebook-${review.id}`;
      
      // Skip if already imported
      if (existingExternalIds.has(externalId)) {
        importResults.skipped++;
        continue;
      }

      // Facebook provides recommendation_type as 'positive' or 'negative'
      // Convert to a rating if not provided directly
      const rating = review.rating || (review.recommendation_type === 'positive' ? 5 : 1);
      
      // Format sentiment score - normally this would be calculated via NLP
      const sentimentScore = ((rating - 1) / 4); // Normalize to 0-1
      
      try {
        // Validate and create a new review
        const newReview = insertReviewSchema.parse({
          userId,
          locationId,
          reviewerName: review.reviewer.name || 'Facebook User',
          platform: 'Facebook',
          rating,
          reviewText: review.review_text || 
            `${review.recommendation_type === 'positive' ? 'Recommended' : 'Not recommended'}`,
          date: new Date(review.created_time),
          isResolved: false,
          externalId,
          sentimentScore,
        });
        
        await storage.createReview(newReview);
        newReviews.push(newReview);
        importResults.imported++;
      } catch (error) {
        console.error('Error importing Facebook review:', error);
      }
    }

    // Create alert for new negative reviews
    const negativeReviews = newReviews.filter(review => review.rating <= 2);
    if (negativeReviews.length > 0) {
      await storage.createAlert({
        userId,
        alertType: 'negative_review',
        content: `Imported ${negativeReviews.length} new negative reviews from Facebook`,
        date: new Date(),
        isRead: false,
      });
    }

    return {
      ...importResults,
      newReviews,
    };
  } catch (error) {
    console.error('Error importing Facebook reviews:', error);
    throw error;
  }
}