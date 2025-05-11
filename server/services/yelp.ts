import axios from 'axios';
import { storage } from '../storage';
import { insertReviewSchema } from '@shared/schema';

// Interface for Yelp review data structure
interface YelpReview {
  id: string;
  rating: number;
  text: string;
  time_created: string;
  user: {
    name: string;
    image_url: string;
    profile_url: string;
  };
}

interface YelpReviewsResponse {
  reviews: YelpReview[];
  total: number;
  possible_languages: string[];
}

interface YelpBusinessResponse {
  name: string;
  id: string;
  alias: string;
  rating: number;
  review_count: number;
}

/**
 * Fetches reviews from Yelp Fusion API for a business
 * 
 * @param businessId - The Yelp business ID to fetch reviews for
 * @param apiKey - Yelp Fusion API key
 * @returns Promise with review data
 */
export async function fetchYelpReviews(businessId: string, apiKey: string) {
  try {
    // First, get business details
    const businessResponse = await axios.get<YelpBusinessResponse>(
      `https://api.yelp.com/v3/businesses/${businessId}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    // Then get reviews
    const reviewsResponse = await axios.get<YelpReviewsResponse>(
      `https://api.yelp.com/v3/businesses/${businessId}/reviews`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        params: {
          limit: 20, // Maximum allowed by Yelp API
          sort_by: 'newest'
        },
      }
    );

    return {
      businessName: businessResponse.data.name,
      reviews: reviewsResponse.data.reviews || [],
      totalReviewCount: businessResponse.data.review_count,
    };
  } catch (error) {
    console.error('Error fetching Yelp reviews:', error);
    throw error;
  }
}

/**
 * Imports Yelp reviews for a user's location
 * 
 * @param userId - User ID
 * @param locationId - Location ID
 * @param yelpBusinessId - Yelp business ID
 * @param apiKey - Yelp Fusion API key
 * @returns Promise with import results
 */
export async function importYelpReviews(
  userId: number,
  locationId: number,
  yelpBusinessId: string,
  apiKey: string
) {
  try {
    // Fetch reviews from Yelp API
    const { reviews } = await fetchYelpReviews(yelpBusinessId, apiKey);
    
    // Get existing reviews to avoid duplicates
    const existingReviews = await storage.getReviewsByPlatform(userId, 'Yelp');
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
      const externalId = `yelp-${review.id}`;
      
      // Skip if already imported
      if (existingExternalIds.has(externalId)) {
        importResults.skipped++;
        continue;
      }

      // Format sentiment score - normally this would be calculated via NLP
      // Here we're doing a simple approximation based on rating
      const sentimentScore = ((review.rating - 1) / 4); // Normalize to 0-1
      
      try {
        // Validate and create a new review
        const newReview = insertReviewSchema.parse({
          userId,
          locationId,
          reviewerName: review.user.name || 'Yelp User',
          platform: 'Yelp',
          rating: review.rating,
          reviewText: review.text,
          date: new Date(review.time_created),
          isResolved: false,
          externalId,
          sentimentScore,
        });
        
        await storage.createReview(newReview);
        newReviews.push(newReview);
        importResults.imported++;
      } catch (error) {
        console.error('Error importing Yelp review:', error);
      }
    }

    // Create alert for new negative reviews
    const negativeReviews = newReviews.filter(review => review.rating <= 2);
    if (negativeReviews.length > 0) {
      await storage.createAlert({
        userId,
        alertType: 'negative_review',
        content: `Imported ${negativeReviews.length} new negative reviews from Yelp`,
        date: new Date(),
        isRead: false,
      });
    }

    return {
      ...importResults,
      newReviews,
    };
  } catch (error) {
    console.error('Error importing Yelp reviews:', error);
    throw error;
  }
}