import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import { insertReviewSchema, insertAlertSchema } from '@shared/schema';

// Verify signature from webhook providers
export function verifyWebhookSignature(
  req: Request,
  res: Response,
  next: NextFunction,
  provider: 'yelp' | 'google' | 'facebook' | 'apple'
) {
  try {
    const signature = req.headers['x-signature'] as string;
    if (!signature) {
      return res.status(401).json({ error: 'Missing signature header' });
    }

    const body = JSON.stringify(req.body);
    let secret;
    
    // Get appropriate secret based on provider
    switch (provider) {
      case 'yelp':
        secret = process.env.YELP_WEBHOOK_SECRET;
        break;
      case 'google':
        secret = process.env.GOOGLE_WEBHOOK_SECRET;
        break;
      case 'facebook':
        secret = process.env.FACEBOOK_WEBHOOK_SECRET;
        break;
      case 'apple':
        secret = process.env.APPLE_WEBHOOK_SECRET;
        break;
    }
    
    if (!secret) {
      return res.status(500).json({ error: `${provider.toUpperCase()}_WEBHOOK_SECRET not configured` });
    }
    
    // Verify signature
    const hmac = crypto.createHmac('sha256', secret);
    const expectedSignature = hmac.update(body).digest('hex');
    
    if (signature !== expectedSignature) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
    
    next();
  } catch (error) {
    console.error('Webhook signature verification error:', error);
    return res.status(500).json({ error: 'Signature verification failed' });
  }
}

// Facebook webhook verification handler
export function verifyFacebookWebhook(req: Request, res: Response) {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  // Verify tokens match to verify ownership of the page
  if (mode === 'subscribe' && token === process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN) {
    console.log('Facebook webhook verified');
    return res.status(200).send(challenge);
  }
  
  return res.sendStatus(403);
}

// Generic webhook handler for new reviews
export async function handleReviewWebhook(
  req: Request,
  res: Response,
  provider: 'yelp' | 'google' | 'facebook' | 'apple'
) {
  try {
    const { 
      userId, 
      locationId, 
      reviewData 
    } = req.body;
    
    // Validate required fields
    if (!userId || !reviewData) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Verify user exists
    const user = await storage.getUser(Number(userId));
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // FIXED: Only allow review/alert creation if user has activity (e.g., completed onboarding or has at least one location)
    const userLocations = await storage.getLocations(user.id);
    if (!userLocations || userLocations.length === 0) {
      console.log(`User ${user.id} has no activity/locations. Skipping review and alert creation.`); // FIXED: Log and skip
      return res.status(200).json({ status: 'skipped', message: 'User has no activity/locations' });
    }
    
    // Check location if provided
    let location;
    if (locationId) {
      location = await storage.getLocation(Number(locationId));
      if (!location) {
        return res.status(404).json({ error: 'Location not found' });
      }
    }
    
    // Process based on provider-specific structures
    let review;
    switch (provider) {
      case 'yelp':
        review = processYelpReview(reviewData, userId, locationId);
        break;
      case 'google':
        review = processGoogleReview(reviewData, userId, locationId);
        break;
      case 'facebook':
        review = processFacebookReview(reviewData, userId, locationId);
        break;
      case 'apple':
        review = processAppleMapsReview(reviewData, userId, locationId);
        break;
      default:
        return res.status(400).json({ error: `Unsupported provider: ${provider}` });
    }
    
    // Check for duplicate review
    const existingReviews = await storage.getReviewsByPlatform(userId, provider);
    const isDuplicate = existingReviews.some(
      r => r.externalId === review.externalId
    );
    
    if (isDuplicate) {
      return res.status(200).json({ status: 'skipped', message: 'Review already exists' });
    }
    
    // Create the new review
    const createdReview = await storage.createReview(review);
    
    // Create alert for negative review
    if (review.rating <= 2) {
      await storage.createAlert({
        userId: Number(userId),
        alertType: 'negative_review',
        content: `New negative review received with ${review.rating} rating from ${review.reviewerName} on ${provider}`,
        date: new Date(),
        isRead: false,
      });
    }
    
    return res.status(201).json({
      status: 'created',
      review: createdReview
    });
  } catch (error) {
    console.error(`Error handling ${provider} webhook:`, error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Process review data from Yelp
function processYelpReview(reviewData: any, userId: number, locationId?: number) {
  // Map Yelp-specific fields to our schema
  return insertReviewSchema.parse({
    userId: Number(userId),
    locationId: locationId ? Number(locationId) : null,
    reviewerName: reviewData.user?.name || 'Yelp User',
    platform: 'Yelp',
    rating: reviewData.rating,
    reviewText: reviewData.text || '',
    date: new Date(reviewData.time_created),
    isResolved: false,
    externalId: `yelp-${reviewData.id}`,
    sentimentScore: ((reviewData.rating - 1) / 4), // Simple normalization
  });
}

// Process review data from Google
function processGoogleReview(reviewData: any, userId: number, locationId?: number) {
  return insertReviewSchema.parse({
    userId: Number(userId),
    locationId: locationId ? Number(locationId) : null,
    reviewerName: reviewData.author_name || 'Google User',
    platform: 'Google',
    rating: reviewData.rating,
    reviewText: reviewData.text || '',
    date: new Date(reviewData.time * 1000), // Convert Unix timestamp
    isResolved: false,
    externalId: `google-${reviewData.author_name}-${reviewData.time}`,
    sentimentScore: ((reviewData.rating - 1) / 4),
  });
}

// Process review data from Facebook
function processFacebookReview(reviewData: any, userId: number, locationId?: number) {
  // Facebook provides recommendation_type as 'positive' or 'negative'
  // Convert to a rating if not provided directly
  const rating = reviewData.rating || 
    (reviewData.recommendation_type === 'positive' ? 5 : 1);
  
  return insertReviewSchema.parse({
    userId: Number(userId),
    locationId: locationId ? Number(locationId) : null,
    reviewerName: reviewData.reviewer?.name || 'Facebook User',
    platform: 'Facebook',
    rating,
    reviewText: reviewData.review_text || 
      `${reviewData.recommendation_type === 'positive' ? 'Recommended' : 'Not recommended'}`,
    date: new Date(reviewData.created_time),
    isResolved: false,
    externalId: `facebook-${reviewData.id}`,
    sentimentScore: ((rating - 1) / 4),
  });
}

// Process review data from Apple Maps
function processAppleMapsReview(reviewData: any, userId: number, locationId?: number) {
  return insertReviewSchema.parse({
    userId: Number(userId),
    locationId: locationId ? Number(locationId) : null,
    reviewerName: reviewData.reviewer?.name || 'Apple Maps User',
    platform: 'Apple Maps',
    rating: reviewData.rating,
    reviewText: reviewData.text || '',
    date: new Date(reviewData.dateCreated),
    isResolved: false,
    externalId: `apple-maps-${reviewData.id}`,
    sentimentScore: ((reviewData.rating - 1) / 4),
  });
}