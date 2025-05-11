import axios from 'axios';
import { storage } from '../storage';
import { insertReviewSchema } from '@shared/schema';

// Interface for Google Places review data structure
interface GooglePlacesReview {
  author_name: string;
  rating: number;
  text: string;
  time: number;
  author_url: string;
}

interface GooglePlacesResponse {
  result: {
    reviews: GooglePlacesReview[];
    name: string;
  };
  status: string;
}

/**
 * Fetches reviews from Google Places API for a specific place
 * 
 * @param placeId - The Google Place ID to fetch reviews for
 * @param apiKey - Google Places API key
 * @returns Promise with review data
 */
export async function fetchGooglePlacesReviews(placeId: string, apiKey: string) {
  try {
    const response = await axios.get<GooglePlacesResponse>(
      `https://maps.googleapis.com/maps/api/place/details/json`,
      {
        params: {
          place_id: placeId,
          fields: 'name,reviews',
          key: apiKey,
        },
      }
    );

    if (response.data.status !== 'OK') {
      throw new Error(`Google Places API error: ${response.data.status}`);
    }

    return {
      placeName: response.data.result.name,
      reviews: response.data.result.reviews || [],
    };
  } catch (error) {
    console.error('Error fetching Google Places reviews:', error);
    throw error;
  }
}

/**
 * Imports Google Places reviews for a user's location
 * 
 * @param userId - User ID
 * @param locationId - Location ID
 * @param googlePlaceId - Google Place ID
 * @param apiKey - Google Places API key
 * @returns Promise with import results
 */
export async function importGooglePlacesReviews(
  userId: number,
  locationId: number,
  googlePlaceId: string,
  apiKey: string
) {
  try {
    // Fetch reviews from Google Places API
    const { reviews } = await fetchGooglePlacesReviews(googlePlaceId, apiKey);
    
    // Get existing reviews to avoid duplicates
    const existingReviews = await storage.getReviewsByPlatform(userId, 'Google');
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
      // Create an external ID based on review details to identify duplicates
      const externalId = `google-${review.author_name}-${review.time}`;
      
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
          reviewerName: review.author_name,
          platform: 'Google',
          rating: review.rating,
          reviewText: review.text,
          date: new Date(review.time * 1000), // Convert Unix timestamp to Date
          isResolved: false,
          externalId,
          sentimentScore,
        });
        
        await storage.createReview(newReview);
        newReviews.push(newReview);
        importResults.imported++;
      } catch (error) {
        console.error('Error importing Google review:', error);
      }
    }

    // Create alert for new negative reviews
    const negativeReviews = newReviews.filter(review => review.rating <= 2);
    if (negativeReviews.length > 0) {
      await storage.createAlert({
        userId,
        alertType: 'negative_review',
        content: `Imported ${negativeReviews.length} new negative reviews from Google`,
        date: new Date(),
        isRead: false,
      });
    }

    return {
      ...importResults,
      newReviews,
    };
  } catch (error) {
    console.error('Error importing Google Places reviews:', error);
    throw error;
  }
}