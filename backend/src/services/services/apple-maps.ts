import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import { storage } from '../storage';
import { insertReviewSchema } from '@shared/schema';

// Interfaces for Apple Maps Connect API responses
interface AppleMapsReview {
  id: string;
  reviewer: {
    name: string;
    avatarUrl?: string;
  };
  rating: number;
  text: string;
  dateCreated: string;
}

interface AppleMapsReviewsResponse {
  data: {
    reviews: AppleMapsReview[];
    pagination: {
      total: number;
      page: number;
      pageSize: number;
      pages: number;
    };
  };
}

interface AppleMapsPlaceResponse {
  data: {
    place: {
      id: string;
      name: string;
      averageRating: number;
      reviewCount: number;
    };
  };
}

/**
 * Generate a JWT token for Apple Maps Connect API authentication
 * 
 * @param teamId - Apple Developer Team ID
 * @param keyId - Apple Maps Connect API Key ID
 * @param privateKey - Apple Maps Connect Private Key content
 * @returns JWT token for authorization
 */
function generateAppleToken(teamId: string, keyId: string, privateKey: string): string {
  const now = Math.floor(Date.now() / 1000);
  
  const payload = {
    iss: teamId,
    iat: now,
    exp: now + 3600, // Token valid for 1 hour
    aud: 'https://maps-api.apple.com'
  };
  
  const header = {
    kid: keyId,
    typ: 'JWT',
    alg: 'ES256'
  };
  
  return jwt.sign(payload, privateKey, { 
    algorithm: 'ES256',
    header 
  });
}

/**
 * Fetches reviews from Apple Maps Connect API for a place
 * 
 * @param placeId - The Apple Maps place ID to fetch reviews for
 * @param authParams - Authentication parameters (teamId, keyId, privateKey)
 * @returns Promise with review data
 */
export async function fetchAppleMapsReviews(
  placeId: string, 
  authParams: { teamId: string, keyId: string, privateKey: string }
) {
  try {
    const { teamId, keyId, privateKey } = authParams;
    const token = generateAppleToken(teamId, keyId, privateKey);
    
    // First, get place details to get name and overview
    const placeResponse = await axios.get<AppleMapsPlaceResponse>(
      `https://maps-api.apple.com/v1/places/${placeId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Then get reviews for the place
    const reviewsResponse = await axios.get<AppleMapsReviewsResponse>(
      `https://maps-api.apple.com/v1/places/${placeId}/reviews`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        params: {
          page: 1,
          pageSize: 50
        }
      }
    );

    return {
      placeName: placeResponse.data.data.place.name,
      reviews: reviewsResponse.data.data.reviews || [],
      averageRating: placeResponse.data.data.place.averageRating,
      reviewCount: placeResponse.data.data.place.reviewCount
    };
  } catch (error) {
    console.error('Error fetching Apple Maps reviews:', error);
    throw error;
  }
}

/**
 * Imports Apple Maps reviews for a user's location
 * 
 * @param userId - User ID
 * @param locationId - Location ID
 * @param applePlaceId - Apple Maps place ID
 * @param authParams - Authentication parameters (teamId, keyId, privateKey)
 * @returns Promise with import results
 */
export async function importAppleMapsReviews(
  userId: number,
  locationId: number,
  applePlaceId: string,
  authParams: { teamId: string, keyId: string, privateKey: string }
) {
  try {
    // Fetch reviews from Apple Maps Connect API
    const { reviews } = await fetchAppleMapsReviews(applePlaceId, authParams);
    
    // Get existing reviews to avoid duplicates
    const existingReviews = await storage.getReviewsByPlatform(userId, 'Apple Maps');
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
      const externalId = `apple-maps-${review.id}`;
      
      // Skip if already imported
      if (existingExternalIds.has(externalId)) {
        importResults.skipped++;
        continue;
      }

      // Format sentiment score - normally this would be calculated via NLP
      const sentimentScore = ((review.rating - 1) / 4); // Normalize to 0-1
      
      try {
        // Validate and create a new review
        const newReview = insertReviewSchema.parse({
          userId,
          locationId,
          reviewerName: review.reviewer.name || 'Apple Maps User',
          platform: 'Apple Maps',
          rating: review.rating,
          reviewText: review.text || '',
          date: new Date(review.dateCreated),
          isResolved: false,
          externalId,
          sentimentScore,
        });
        
        await storage.createReview(newReview);
        newReviews.push(newReview);
        importResults.imported++;
      } catch (error) {
        console.error('Error importing Apple Maps review:', error);
      }
    }

    // Create alert for new negative reviews
    const negativeReviews = newReviews.filter(review => review.rating <= 2);
    if (negativeReviews.length > 0) {
      await storage.createAlert({
        userId,
        alertType: 'negative_review',
        content: `Imported ${negativeReviews.length} new negative reviews from Apple Maps`,
        date: new Date(),
        isRead: false,
      });
    }

    return {
      ...importResults,
      newReviews,
    };
  } catch (error) {
    console.error('Error importing Apple Maps reviews:', error);
    throw error;
  }
}