import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { 
  insertReviewSchema, 
  insertAlertSchema, 
  insertMetricsSchema, 
  insertReviewRequestSchema,
  insertLocationSchema,
  insertCrmIntegrationSchema
} from "@shared/schema";
import { generateAIReply, analyzeReviewSentiment } from "./lib/openai";
import { requireRole, attachPermissions } from "./middleware/rbac";

// Import external services
import { importGooglePlacesReviews } from "./services/google-places";
import { importYelpReviews } from "./services/yelp";
import { importFacebookReviews } from "./services/facebook";
import { importAppleMapsReviews } from "./services/apple-maps";
import { processReviewRequest } from "./services/review-request";
import { 
  verifyWebhookSignature, 
  verifyFacebookWebhook,
  handleReviewWebhook 
} from "./services/webhooks";
import {
  initializeSubscriptionPlans,
  startTrial,
  updateSubscription,
  cancelSubscription,
  hasFeatureAccess,
  hasReachedLocationLimit,
  hasValidSubscription
} from "./services/subscription";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Attach permissions to requests
  app.use(attachPermissions);

  // Onboarding routes
  app.get("/api/user/onboarding/status", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Get full user data
      const userId = req.user!.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get user's locations
      const locations = await storage.getLocations(userId);
      
      // Calculate trial status
      const now = new Date();
      let trialEndsAt: Date;
      
      if (user.trialEndsAt) {
        trialEndsAt = new Date(user.trialEndsAt);
      } else {
        // Default 14 days from now
        trialEndsAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
        
        // Update user with trial end date
        await storage.updateUser(userId, {
          trialEndsAt,
          subscriptionStatus: "trial",
          plan: "Pro" // Default to Pro plan for trial
        });
      }
      
      const trialActive = now < trialEndsAt;
      const daysRemaining = Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

      res.json({
        onboardingComplete: user.onboardingCompleted || locations.length > 0,
        businessInfo: {
          businessName: user.businessName || "",
          industry: user.industry || "",
          clientType: user.clientType || "",
          clientTypeCustom: user.clientTypeCustom || "",
          isAgency: user.isAgency || false,
          contactName: user.contactName || "",
          contactEmail: user.contactEmail || "",
          contactPhone: user.contactPhone || ""
        },
        trialStatus: {
          active: trialActive,
          daysRemaining,
          endsAt: trialEndsAt
        },
        plan: user.plan,
        subscriptionStatus: user.subscriptionStatus
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/user/onboarding/business-info", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const userId = req.user!.id;
      const { businessName, industry, contactName, contactEmail, contactPhone } = req.body;

      // Update user profile with business info
      const updatedUser = await storage.updateUser(userId, {
        businessName,
        industry,
        contactName,
        contactEmail,
        contactPhone
      });

      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/user/onboarding/complete", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const userId = req.user!.id;
      
      // Update user with onboarding data from request body
      const { businessInfo, locations, platforms, aiPreferences } = req.body;
      
      const updates: any = {
        onboardingCompleted: true,
        subscriptionStatus: "trial"
      };
      
      // Update business info if provided
      if (businessInfo) {
        updates.businessName = businessInfo.businessName;
        updates.industry = businessInfo.industry;
        updates.contactName = businessInfo.contactName;
        updates.contactEmail = businessInfo.contactEmail;
        updates.contactPhone = businessInfo.contactPhone;
        
        // Add new business type fields if provided
        if (businessInfo.clientType) {
          updates.clientType = businessInfo.clientType;
          
          // Set agency flag if selected
          updates.isAgency = businessInfo.clientType === 'agency';
          
          // If client type is "other", save the custom description
          if (businessInfo.clientType === 'other' && businessInfo.clientTypeCustom) {
            updates.clientTypeCustom = businessInfo.clientTypeCustom;
          }
        }
      }
      
      // Update AI preferences if provided
      if (aiPreferences) {
        updates.aiDefaultTone = aiPreferences.defaultTone;
        updates.aiAutoReplyToFiveStars = aiPreferences.autoReplyToFiveStars;
        updates.notificationFrequency = aiPreferences.notificationFrequency;
      }
      
      // Update user record
      const updatedUser = await storage.updateUser(userId, updates);
      
      // Create locations with platform connections if provided
      if (locations && Array.isArray(locations) && locations.length > 0) {
        for (const location of locations) {
          const locationData: any = {
            userId,
            name: location.name,
            address: `${location.address}, ${location.city}, ${location.state} ${location.zip}`,
            phone: location.phone,
            email: location.email
          };
          
          // If we have platforms data for this location
          if (platforms) {
            if (platforms.google) locationData.googlePlaceId = platforms.googlePlaceId || "placeholder";
            if (platforms.yelp) locationData.yelpBusinessId = platforms.yelpBusinessId || "placeholder";
            if (platforms.facebook) locationData.facebookPageId = platforms.facebookPageId || "placeholder";
          }
          
          await storage.createLocation(locationData);
        }
      }
      
      // Create a welcome alert for the user
      await storage.createAlert({
        userId,
        alertType: "onboarding",
        content: JSON.stringify({
          title: "Welcome to RepuRadar!",
          message: "Your 14-day trial has started. Explore all the premium features to manage your online reputation."
        }),
        date: new Date(),
        isRead: false
      });
      
      res.json({ 
        success: true, 
        message: "Onboarding completed successfully",
        redirectTo: "/"
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/user/onboarding/add-location", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = req.user;
      const { name, address, city, state, zip, email, phone } = req.body;

      // Add location to the user's account
      const fullAddress = `${address}, ${city}, ${state} ${zip}`;
      const location = await storage.createLocation({
        userId: user.id,
        name,
        address: fullAddress,
        phone,
        email
      });

      res.json(location);
    } catch (error) {
      console.error("Error adding location:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/user/onboarding/connect-platform", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = req.user;
      const { platform, platformId, locationId } = req.body;

      // Update the location with platform info
      let updateData = {};
      if (platform === 'google') {
        updateData = { googlePlaceId: platformId };
      } else if (platform === 'yelp') {
        updateData = { yelpBusinessId: platformId };
      }

      const location = await storage.updateLocation(locationId, updateData);

      res.json(location);
    } catch (error) {
      console.error("Error connecting platform:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/user/onboarding/ai-preferences", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = req.user;
      const { defaultTone, autoReplyToFiveStars, notificationFrequency } = req.body;

      // Save AI preferences
      // In a real app, we'd add a user_preferences table, but for now we'll add to the user
      const updatedUser = await storage.updateUser(user.id, {
        aiDefaultTone: defaultTone,
        aiAutoReplyToFiveStars: autoReplyToFiveStars,
        notificationFrequency
      });

      res.json(updatedUser);
    } catch (error) {
      console.error("Error saving AI preferences:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/user/onboarding/complete", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = req.user;
      
      // Mark onboarding as complete
      const updatedUser = await storage.updateUser(user.id, {
        onboardingCompleted: true
      });

      res.json(updatedUser);
    } catch (error) {
      console.error("Error completing onboarding:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // API routes
  // Reviews
  app.get("/api/reviews", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const userId = req.user!.id;
      let reviews;
      
      const { platform, minRating, maxRating } = req.query;
      
      if (platform) {
        reviews = await storage.getReviewsByPlatform(userId, platform as string);
      } else if (minRating && maxRating) {
        reviews = await storage.getReviewsByRating(
          userId, 
          Number(minRating), 
          Number(maxRating)
        );
      } else {
        reviews = await storage.getReviewsByUserId(userId);
      }
      
      res.json(reviews);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/reviews", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const userId = req.user!.id;
      const validatedData = insertReviewSchema.parse({
        ...req.body,
        userId
      });
      
      const review = await storage.createReview(validatedData);
      res.status(201).json(review);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/reviews/recent", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const userId = req.user!.id;
      const limit = Number(req.query.limit) || 10;
      
      const reviews = await storage.getRecentReviews(userId, limit);
      res.json(reviews);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/reviews/negative", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const userId = req.user!.id;
      const limit = Number(req.query.limit) || 5;
      
      const reviews = await storage.getNegativeReviews(userId, limit);
      res.json(reviews);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/reviews/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const reviewId = Number(req.params.id);
      const userId = req.user!.id;
      
      // Check if the review belongs to the user
      const review = await storage.getReviewById(reviewId);
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }
      
      if (review.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedReview = await storage.updateReview(reviewId, req.body);
      res.json(updatedReview);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/reviews/:id/resolve", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const reviewId = Number(req.params.id);
      const userId = req.user!.id;
      
      // Check if the review belongs to the user
      const review = await storage.getReviewById(reviewId);
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }
      
      if (review.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedReview = await storage.updateReview(reviewId, { isResolved: true });
      res.json(updatedReview);
    } catch (error) {
      next(error);
    }
  });

  // AI Reply generation
  app.post("/api/reviews/generate-reply", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const { reviewId, tone = "professional" } = req.body;
      if (!reviewId) {
        return res.status(400).json({ message: "reviewId is required" });
      }
      
      const userId = req.user!.id;
      
      // Check if the review belongs to the user
      const review = await storage.getReviewById(Number(reviewId));
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }
      
      if (review.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const generatedReply = await generateAIReply(review, tone);
      res.json({ response: generatedReply });
    } catch (error) {
      next(error);
    }
  });
  
  // Sentiment analysis
  app.post("/api/reviews/analyze-sentiment", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const { reviewText } = req.body;
      if (!reviewText) {
        return res.status(400).json({ message: "reviewText is required" });
      }
      
      const sentiment = await analyzeReviewSentiment(reviewText);
      res.json(sentiment);
    } catch (error) {
      next(error);
    }
  });

  // Metrics
  app.get("/api/metrics", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const userId = req.user!.id;
      const metrics = await storage.getUserMetrics(userId);
      
      if (!metrics) {
        // If no metrics exist yet, calculate them on-the-fly
        const reviews = await storage.getReviewsByUserId(userId);
        
        if (reviews.length === 0) {
          return res.json({
            averageRating: 0,
            totalReviews: 0,
            positivePercentage: 0,
            keywordTrends: {}
          });
        }
        
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / reviews.length;
        const positiveCount = reviews.filter(review => review.rating >= 4).length;
        const positivePercentage = (positiveCount / reviews.length) * 100;
        
        return res.json({
          averageRating,
          totalReviews: reviews.length,
          positivePercentage,
          keywordTrends: {}
        });
      }
      
      res.json(metrics);
    } catch (error) {
      next(error);
    }
  });
  
  // Reviews trends for analytics
  app.get("/api/reviews/trends", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const userId = req.user!.id;
      const period = req.query.period || '90'; // Default to 90 days
      
      // Mock data for charts - in a real app this would be generated from actual review data
      const trendData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [
          {
            label: 'Average Rating',
            data: [4.2, 4.3, 4.1, 4.4, 4.5, 4.3, 4.7],
          },
          {
            label: 'Review Count',
            data: [5, 8, 12, 9, 11, 14, 16],
          }
        ],
        platforms: {
          google: 65,
          yelp: 32,
          facebook: 18,
          healthgrades: 12
        },
        ratings: {
          '5': 48,
          '4': 35,
          '3': 22,
          '2': 14,
          '1': 8
        },
        keywords: {
          'staff': 85,
          'service': 64,
          'price': 54,
          'quality': 42,
          'wait time': 38,
          'results': 28
        }
      };
      
      res.json(trendData);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/metrics", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const userId = req.user!.id;
      const validatedData = insertMetricsSchema.parse({
        ...req.body,
        userId
      });
      
      const existingMetrics = await storage.getUserMetrics(userId);
      
      let metrics;
      if (existingMetrics) {
        metrics = await storage.updateMetrics(userId, validatedData);
      } else {
        metrics = await storage.createMetrics(validatedData);
      }
      
      res.status(201).json(metrics);
    } catch (error) {
      next(error);
    }
  });

  // Alerts
  app.get("/api/alerts", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const userId = req.user!.id;
      const limit = req.query.limit ? Number(req.query.limit) : undefined;
      
      const alerts = await storage.getAlertsByUserId(userId, limit);
      res.json(alerts);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/alerts", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const userId = req.user!.id;
      const validatedData = insertAlertSchema.parse({
        ...req.body,
        userId
      });
      
      const alert = await storage.createAlert(validatedData);
      res.status(201).json(alert);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/alerts/:id/read", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const alertId = Number(req.params.id);
      const alert = await storage.markAlertAsRead(alertId);
      res.json(alert);
    } catch (error) {
      next(error);
    }
  });

  // External API integrations routes
  
  // Google Places reviews import
  app.post("/api/integrations/google-places/import", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const userId = req.user!.id;
      const { locationId, placeId, apiKey } = req.body;
      
      if (!placeId || !apiKey) {
        return res.status(400).json({ 
          message: "Missing required fields: placeId and apiKey are required" 
        });
      }
      
      const result = await importGooglePlacesReviews(
        userId,
        locationId || null,
        placeId,
        apiKey
      );
      
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  });
  
  // Yelp reviews import
  app.post("/api/integrations/yelp/import", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const userId = req.user!.id;
      const { locationId, businessId, apiKey } = req.body;
      
      if (!businessId || !apiKey) {
        return res.status(400).json({ 
          message: "Missing required fields: businessId and apiKey are required" 
        });
      }
      
      const result = await importYelpReviews(
        userId,
        locationId || null,
        businessId,
        apiKey
      );
      
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  });
  
  // Facebook reviews import
  app.post("/api/integrations/facebook/import", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const userId = req.user!.id;
      const { locationId, pageId, accessToken } = req.body;
      
      if (!pageId || !accessToken) {
        return res.status(400).json({ 
          message: "Missing required fields: pageId and accessToken are required" 
        });
      }
      
      const result = await importFacebookReviews(
        userId,
        locationId || null,
        pageId,
        accessToken
      );
      
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  });
  
  // Apple Maps reviews import
  app.post("/api/integrations/apple-maps/import", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const userId = req.user!.id;
      const { locationId, placeId, teamId, keyId, privateKey } = req.body;
      
      if (!placeId || !teamId || !keyId || !privateKey) {
        return res.status(400).json({ 
          message: "Missing required fields: placeId, teamId, keyId, and privateKey are required" 
        });
      }
      
      const authParams = { teamId, keyId, privateKey };
      
      const result = await importAppleMapsReviews(
        userId,
        locationId || null,
        placeId,
        authParams
      );
      
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  });
  
  // Review request endpoints
  app.post("/api/review-requests", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const userId = req.user!.id;
      const validatedData = insertReviewRequestSchema.parse({
        ...req.body,
        userId
      });
      
      const reviewRequest = await storage.createReviewRequest(validatedData);
      res.status(201).json(reviewRequest);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/review-requests", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const userId = req.user!.id;
      const reviewRequests = await storage.getReviewRequests(userId);
      
      res.json(reviewRequests);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/review-requests/:id/send", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const requestId = Number(req.params.id);
      const request = await storage.getReviewRequest(requestId);
      
      if (!request) {
        return res.status(404).json({ message: "Review request not found" });
      }
      
      if (request.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const result = await processReviewRequest(requestId);
      
      if (result.success) {
        res.status(200).json({ message: "Review request sent successfully", result });
      } else {
        res.status(500).json({ message: "Failed to send review request", error: result.error });
      }
    } catch (error) {
      next(error);
    }
  });
  
  // CRM Integration endpoints
  app.get("/api/crm-integrations", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const userId = req.user!.id;
      
      // If storage method doesn't exist yet, return empty array until the DB is updated
      if (!storage.getCrmIntegrations) {
        return res.json([]);
      }
      
      const integrations = await storage.getCrmIntegrations(userId);
      res.json(integrations);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/crm-integrations", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const userId = req.user!.id;
      
      // If subscription check needed
      const hasAccess = await hasFeatureAccess(userId, 'crm_integrations');
      if (!hasAccess) {
        return res.status(403).json({ 
          message: "CRM integrations are available on higher subscription plans. Please upgrade your plan." 
        });
      }
      
      // Validate the request data
      const validatedData = insertCrmIntegrationSchema.parse({
        ...req.body,
        userId
      });
      
      // If storage method doesn't exist yet, we'll mock this until the DB is updated
      if (!storage.createCrmIntegration) {
        const mockResponse = {
          id: 1,
          userId,
          ...validatedData,
          createdAt: new Date().toISOString(),
          lastSync: null,
          requestsSent: 0
        };
        return res.status(201).json(mockResponse);
      }
      
      const integration = await storage.createCrmIntegration(validatedData);
      
      res.status(201).json(integration);
    } catch (error) {
      next(error);
    }
  });
  
  app.patch("/api/crm-integrations/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const integrationId = Number(req.params.id);
      
      // If storage method doesn't exist yet, we'll mock this until the DB is updated
      if (!storage.getCrmIntegration || !storage.updateCrmIntegration) {
        return res.status(200).json({
          id: integrationId,
          userId: req.user!.id,
          ...req.body,
          createdAt: new Date().toISOString(),
          lastSync: new Date().toISOString(),
          requestsSent: 0
        });
      }
      
      const integration = await storage.getCrmIntegration(integrationId);
      
      if (!integration) {
        return res.status(404).json({ message: "CRM integration not found" });
      }
      
      if (integration.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedIntegration = await storage.updateCrmIntegration(integrationId, req.body);
      res.json(updatedIntegration);
    } catch (error) {
      next(error);
    }
  });
  
  app.delete("/api/crm-integrations/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const integrationId = Number(req.params.id);
      
      // If storage method doesn't exist yet, we'll just return success
      if (!storage.getCrmIntegration || !storage.deleteCrmIntegration) {
        return res.status(200).json({ success: true });
      }
      
      const integration = await storage.getCrmIntegration(integrationId);
      
      if (!integration) {
        return res.status(404).json({ message: "CRM integration not found" });
      }
      
      if (integration.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteCrmIntegration(integrationId);
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/crm-integrations/:id/test", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const integrationId = Number(req.params.id);
      
      // If storage method doesn't exist yet, we'll mock this until the DB is updated
      if (!storage.getCrmIntegration) {
        return res.status(200).json({ 
          success: true, 
          message: "Connection successful",
          status: "connected" 
        });
      }
      
      const integration = await storage.getCrmIntegration(integrationId);
      
      if (!integration) {
        return res.status(404).json({ message: "CRM integration not found" });
      }
      
      if (integration.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // In a real system, we would actually call the CRM's API here to verify the connection
      // For now, we'll just simulate a successful connection
      const testResult = {
        success: true,
        message: "Successfully connected to " + integration.crmType,
        status: "connected"
      };
      
      // Update last sync time
      if (storage.updateCrmIntegration) {
        await storage.updateCrmIntegration(integrationId, {
          lastSync: new Date()
        });
      }
      
      res.status(200).json(testResult);
    } catch (error) {
      next(error);
    }
  });
  
  // Webhook endpoints
  
  // Facebook webhook verification endpoint (required by Facebook API)
  app.get("/api/webhooks/facebook", verifyFacebookWebhook);
  
  // Facebook review notification webhook
  app.post("/api/webhooks/facebook", 
    (req, res, next) => verifyWebhookSignature(req, res, next, 'facebook'),
    (req, res) => handleReviewWebhook(req, res, 'facebook')
  );
  
  // Yelp review notification webhook
  app.post("/api/webhooks/yelp", 
    (req, res, next) => verifyWebhookSignature(req, res, next, 'yelp'),
    (req, res) => handleReviewWebhook(req, res, 'yelp')
  );
  
  // Google review notification webhook
  app.post("/api/webhooks/google", 
    (req, res, next) => verifyWebhookSignature(req, res, next, 'google'),
    (req, res) => handleReviewWebhook(req, res, 'google')
  );
  
  // Apple Maps review notification webhook
  app.post("/api/webhooks/apple", 
    (req, res, next) => verifyWebhookSignature(req, res, next, 'apple'),
    (req, res) => handleReviewWebhook(req, res, 'apple')
  );
  
  // Locations endpoints
  app.get("/api/locations", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const userId = req.user!.id;
      const locations = await storage.getLocations(userId);
      
      res.json(locations);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/locations", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const userId = req.user!.id;
      const validatedData = insertLocationSchema.parse({
        ...req.body,
        userId
      });
      
      const location = await storage.createLocation(validatedData);
      res.status(201).json(location);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/locations/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const locationId = Number(req.params.id);
      const location = await storage.getLocation(locationId);
      
      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      }
      
      // Check if the location belongs to the user (unless admin or staff with permissions)
      if (location.userId !== req.user!.id && !req.permissions?.canViewAllLocations) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(location);
    } catch (error) {
      next(error);
    }
  });
  
  app.patch("/api/locations/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const locationId = Number(req.params.id);
      const location = await storage.getLocation(locationId);
      
      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      }
      
      // Check if the location belongs to the user (unless admin or staff with permissions)
      if (location.userId !== req.user!.id && !req.permissions?.canViewAllLocations) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedLocation = await storage.updateLocation(locationId, req.body);
      res.json(updatedLocation);
    } catch (error) {
      next(error);
    }
  });
  
  app.delete("/api/locations/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const locationId = Number(req.params.id);
      const location = await storage.getLocation(locationId);
      
      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      }
      
      // Check if the location belongs to the user (unless admin with permissions)
      if (location.userId !== req.user!.id && !req.permissions?.canManageIntegrations) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteLocation(locationId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });
  
  // Staff-specific routes for locations
  app.get("/api/staff/locations", requireRole('staff'), async (req, res, next) => {
    try {
      const locations = await storage.getAllLocations();
      res.json(locations);
    } catch (error) {
      next(error);
    }
  });
  
  // Manager-specific routes for locations
  app.get("/api/manager/locations", requireRole('manager'), async (req, res, next) => {
    try {
      // Get locations that this manager is assigned to
      const managedLocations = await db.query.locationManagers.findMany({
        where: eq(locationManagers.userId, req.user!.id),
        with: {
          location: true
        }
      });
      
      if (managedLocations && managedLocations.length > 0) {
        const locations = managedLocations.map(ml => ml.location);
        return res.json(locations);
      }
      return res.json([]);
    } catch (error) {
      next(error);
    }
  });
  
  // Route to assign a manager to a location
  app.post("/api/admin/location-managers", requireRole('admin'), async (req, res, next) => {
    try {
      const { userId, locationId } = req.body;
      
      if (!userId || !locationId) {
        return res.status(400).json({ message: "User ID and Location ID are required" });
      }
      
      // Verify user exists and is a manager
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (user.role !== 'manager') {
        return res.status(400).json({ message: "User must have manager role to be assigned to a location" });
      }
      
      // Verify location exists
      const location = await storage.getLocation(locationId);
      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      }
      
      // Create the assignment
      const [assignment] = await db.insert(locationManagers)
        .values({
          userId,
          locationId
        })
        .returning();
      
      res.status(201).json(assignment);
    } catch (error) {
      next(error);
    }
  });
  
  // Permissions endpoint
  app.get("/api/permissions", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      // Permissions are attached to the request by the attachPermissions middleware
      res.json(req.permissions || {
        canManageUsers: false,
        canManageStaff: false,
        canViewAllLocations: false,
        canEditSettings: false,
        canDeleteReviews: false,
        canManageIntegrations: false,
        canViewReports: false,
        canBulkEditReviews: false,
      });
    } catch (error) {
      next(error);
    }
  });

  // Admin Dashboard API endpoints
  app.get("/api/admin/dashboard", requireRole('admin'), async (req, res, next) => {
    try {
      const { timeRange = '30days' } = req.query;
      
      // In a real app, this would fetch real dashboard data based on the time range
      // For now, we'll return sample data with structure matching frontend requirements
      const dashboardData = {
        metrics: {
          activeUsers: 2845,
          activeUsersTrend: 12.6,
          revenue: 24512,
          revenueTrend: 8.2,
          accounts: 875,
          accountsTrend: 4.7,
          locations: 1240,
          locationsTrend: 6.2
        },
        usage: {
          reviews: 42750,
          ai_responses: 18320,
          review_requests: 9450,
          api_calls: 156800
        },
        planDistribution: [
          { name: 'Free', value: 65 },
          { name: 'Pro', value: 27 },
          { name: 'Business', value: 8 },
        ],
        revenueData: [
          { month: 'Jan', revenue: 15400, users: 1820 },
          { month: 'Feb', revenue: 17200, users: 2010 },
          { month: 'Mar', revenue: 19100, users: 2180 },
          { month: 'Apr', revenue: 21500, users: 2340 },
          { month: 'May', revenue: 22800, users: 2520 },
          { month: 'Jun', revenue: 24100, users: 2710 },
          { month: 'Jul', revenue: 25400, users: 2845 },
        ],
        revenueByPlan: [
          { month: 'Jan', free: 0, pro: 7500, business: 5400, enterprise: 2500 },
          { month: 'Feb', free: 0, pro: 8100, business: 6200, enterprise: 2900 },
          { month: 'Mar', free: 0, pro: 8700, business: 7100, enterprise: 3300 },
          { month: 'Apr', free: 0, pro: 9400, business: 8300, enterprise: 3800 },
          { month: 'May', free: 0, pro: 9800, business: 8900, enterprise: 4100 },
          { month: 'Jun', free: 0, pro: 10200, business: 9600, enterprise: 4300 },
          { month: 'Jul', free: 0, pro: 10900, business: 10100, enterprise: 4400 },
        ]
      };
      
      res.json(dashboardData);
    } catch (error) {
      next(error);
    }
  });
  
  // Admin Customer Management API endpoints
  app.get("/api/admin/customers", requireRole('admin'), async (req, res, next) => {
    try {
      // In a real app, this would fetch real customer data from the database
      // For now, we'll return sample data with structure matching frontend requirements
      const customerData = [
        {
          id: 1,
          username: "johndoe",
          email: "john.doe@example.com",
          fullName: "John Doe",
          phone: "555-123-4567",
          address: "123 Main St, Anytown, USA",
          company: "Doe Enterprises",
          role: "user",
          isActive: true,
          plan: "Pro",
          billingCycle: "monthly",
          nextBillingDate: "2025-06-01",
          paymentMethod: "Credit Card",
          createdAt: "2024-01-15",
          profilePicture: null,
          locationCount: 3,
          totalSpend: 1250
        },
        {
          id: 2,
          username: "janewilson",
          email: "jane.wilson@example.com",
          fullName: "Jane Wilson",
          phone: "555-987-6543",
          address: "456 Oak Ave, Somewhere, USA",
          company: "Wilson Law Firm",
          role: "user",
          isActive: true,
          plan: "Business",
          billingCycle: "annually",
          nextBillingDate: "2025-12-15",
          paymentMethod: "Credit Card",
          createdAt: "2024-02-10",
          profilePicture: null,
          locationCount: 8,
          totalSpend: 3600
        },
        {
          id: 3,
          username: "mikesmith",
          email: "mike.smith@example.com",
          fullName: "Michael Smith",
          phone: "555-789-0123",
          address: "789 Pine Rd, Elsewhere, USA",
          company: "Smith Dental Care",
          role: "user",
          isActive: true,
          plan: "Enterprise",
          billingCycle: "annually",
          nextBillingDate: "2025-08-22",
          paymentMethod: "ACH Transfer",
          createdAt: "2024-01-22",
          profilePicture: null,
          locationCount: 15,
          totalSpend: 8750
        },
        {
          id: 4,
          username: "sarahlee",
          email: "sarah.lee@example.com",
          fullName: "Sarah Lee",
          phone: "555-456-7890",
          address: "321 Elm St, Nowhere, USA",
          company: "Lee Accounting",
          role: "user",
          isActive: false,
          plan: "Pro",
          billingCycle: "monthly",
          nextBillingDate: "2025-05-15",
          paymentMethod: "Credit Card",
          createdAt: "2024-03-05",
          profilePicture: null,
          locationCount: 1,
          totalSpend: 425
        },
        {
          id: 5,
          username: "robertjohnson",
          email: "robert.johnson@example.com",
          fullName: "Robert Johnson",
          phone: "555-567-8901",
          address: "654 Maple Dr, Anywhere, USA",
          company: "Johnson Real Estate",
          role: "user",
          isActive: true,
          plan: "Business",
          billingCycle: "monthly",
          nextBillingDate: "2025-05-30",
          paymentMethod: "Credit Card",
          createdAt: "2024-01-30",
          profilePicture: null,
          locationCount: 6,
          totalSpend: 2100
        },
        {
          id: 6,
          username: "lisamiller",
          email: "lisa.miller@example.com",
          fullName: "Lisa Miller",
          phone: "555-678-9012",
          address: "987 Walnut Blvd, Someplace, USA",
          company: "Miller Physical Therapy",
          role: "user",
          isActive: true,
          plan: "Pro",
          billingCycle: "annually",
          nextBillingDate: "2026-01-10",
          paymentMethod: "Credit Card",
          createdAt: "2024-02-10",
          profilePicture: null,
          locationCount: 2,
          totalSpend: 950
        },
        {
          id: 7,
          username: "davidthomas",
          email: "david.thomas@example.com",
          fullName: "David Thomas",
          phone: "555-789-0123",
          address: "246 Cedar St, Somewhere, USA",
          company: "Thomas Consulting",
          role: "user",
          isActive: true,
          plan: "Free",
          billingCycle: "monthly",
          nextBillingDate: null,
          paymentMethod: null,
          createdAt: "2024-04-01",
          profilePicture: null,
          locationCount: 1,
          totalSpend: 0
        },
        {
          id: 8,
          username: "jenniferwhite",
          email: "jennifer.white@example.com",
          fullName: "Jennifer White",
          phone: "555-890-1234",
          address: "135 Birch Ln, Elsewhere, USA",
          company: "White Veterinary Clinic",
          role: "user",
          isActive: true,
          plan: "Enterprise",
          billingCycle: "annually",
          nextBillingDate: "2025-11-05",
          paymentMethod: "ACH Transfer",
          createdAt: "2024-01-05",
          profilePicture: null,
          locationCount: 12,
          totalSpend: 7200
        },
        {
          id: 9,
          username: "jamesbrown",
          email: "james.brown@example.com",
          fullName: "James Brown",
          phone: "555-901-2345",
          address: "753 Oak St, Nowhere, USA",
          company: "Brown Financial Services",
          role: "user",
          isActive: false,
          plan: "Business",
          billingCycle: "monthly",
          nextBillingDate: "2025-04-20",
          paymentMethod: "Credit Card",
          createdAt: "2024-02-20",
          profilePicture: null,
          locationCount: 4,
          totalSpend: 1800
        },
        {
          id: 10,
          username: "susanwilliams",
          email: "susan.williams@example.com",
          fullName: "Susan Williams",
          phone: "555-012-3456",
          address: "864 Pine Ave, Anywhere, USA",
          company: "Williams Medical Practice",
          role: "user",
          isActive: true,
          plan: "Pro",
          billingCycle: "monthly",
          nextBillingDate: "2025-05-25",
          paymentMethod: "Credit Card",
          createdAt: "2024-01-25",
          profilePicture: null,
          locationCount: 2,
          totalSpend: 900
        }
      ];
      
      res.json(customerData);
    } catch (error) {
      next(error);
    }
  });
  
  // Update customer endpoint
  app.patch("/api/admin/customers/:id", requireRole('admin'), async (req, res, next) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      // In a real app, this would update the customer in the database
      // For now, we'll just return the updated data
      const updatedCustomer = {
        id: parseInt(id),
        username: "customer_username", // This would be retrieved from the database
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      res.json(updatedCustomer);
    } catch (error) {
      next(error);
    }
  });
  
  // Customer onboarding endpoints
  app.get("/api/admin/onboarding", requireRole('admin'), async (req, res, next) => {
    try {
      // In a real app, this would fetch customers with their onboarding status from the database
      const onboardingData = [
        {
          id: 1,
          customerId: 1,
          customerName: "John Doe",
          customerCompany: "Doe Enterprises",
          email: "john.doe@example.com",
          phone: "555-123-4567",
          plan: "Pro",
          startDate: "2024-04-15",
          assignedTo: "Alex Johnson",
          progress: 35,
          tasks: [
            { id: 1, name: "Account Setup", completed: true, lastUpdated: "2024-04-15" },
            { id: 2, name: "Payment Information", completed: true, lastUpdated: "2024-04-15" },
            { id: 3, name: "Business Details", completed: true, lastUpdated: "2024-04-16" },
            { id: 4, name: "Google Integration", completed: false, lastUpdated: null },
            { id: 5, name: "Yelp Integration", completed: false, lastUpdated: null },
            { id: 6, name: "Facebook Integration", completed: false, lastUpdated: null },
            { id: 7, name: "Initial Team Training", completed: false, lastUpdated: null },
            { id: 8, name: "Review Template Setup", completed: false, lastUpdated: null },
            { id: 9, name: "Workflow Customization", completed: false, lastUpdated: null },
            { id: 10, name: "QR Code Generation", completed: false, lastUpdated: null }
          ]
        },
        {
          id: 2,
          customerId: 2,
          customerName: "Jane Wilson",
          customerCompany: "Wilson Law Firm",
          email: "jane.wilson@example.com",
          phone: "555-987-6543",
          plan: "Business",
          startDate: "2024-04-10",
          assignedTo: "Sam Lee",
          progress: 60,
          tasks: [
            { id: 1, name: "Account Setup", completed: true, lastUpdated: "2024-04-10" },
            { id: 2, name: "Payment Information", completed: true, lastUpdated: "2024-04-10" },
            { id: 3, name: "Business Details", completed: true, lastUpdated: "2024-04-11" },
            { id: 4, name: "Google Integration", completed: true, lastUpdated: "2024-04-12" },
            { id: 5, name: "Yelp Integration", completed: true, lastUpdated: "2024-04-12" },
            { id: 6, name: "Facebook Integration", completed: true, lastUpdated: "2024-04-12" },
            { id: 7, name: "Initial Team Training", completed: false, lastUpdated: null },
            { id: 8, name: "Review Template Setup", completed: false, lastUpdated: null },
            { id: 9, name: "Workflow Customization", completed: false, lastUpdated: null },
            { id: 10, name: "QR Code Generation", completed: false, lastUpdated: null }
          ]
        },
        {
          id: 3,
          customerId: 3,
          customerName: "Michael Smith",
          customerCompany: "Smith Dental Care",
          email: "mike.smith@example.com",
          phone: "555-789-0123",
          plan: "Enterprise",
          startDate: "2024-03-25",
          assignedTo: "Taylor Wong",
          progress: 90,
          tasks: [
            { id: 1, name: "Account Setup", completed: true, lastUpdated: "2024-03-25" },
            { id: 2, name: "Payment Information", completed: true, lastUpdated: "2024-03-25" },
            { id: 3, name: "Business Details", completed: true, lastUpdated: "2024-03-26" },
            { id: 4, name: "Google Integration", completed: true, lastUpdated: "2024-03-27" },
            { id: 5, name: "Yelp Integration", completed: true, lastUpdated: "2024-03-27" },
            { id: 6, name: "Facebook Integration", completed: true, lastUpdated: "2024-03-27" },
            { id: 7, name: "Initial Team Training", completed: true, lastUpdated: "2024-04-02" },
            { id: 8, name: "Review Template Setup", completed: true, lastUpdated: "2024-04-05" },
            { id: 9, name: "Workflow Customization", completed: true, lastUpdated: "2024-04-10" },
            { id: 10, name: "QR Code Generation", completed: false, lastUpdated: null }
          ]
        },
        {
          id: 4,
          customerId: 4,
          customerName: "Sarah Lee",
          customerCompany: "Lee Accounting",
          email: "sarah.lee@example.com",
          phone: "555-456-7890",
          plan: "Pro",
          startDate: "2024-04-05",
          assignedTo: "Alex Johnson",
          progress: 20,
          tasks: [
            { id: 1, name: "Account Setup", completed: true, lastUpdated: "2024-04-05" },
            { id: 2, name: "Payment Information", completed: true, lastUpdated: "2024-04-05" },
            { id: 3, name: "Business Details", completed: false, lastUpdated: null },
            { id: 4, name: "Google Integration", completed: false, lastUpdated: null },
            { id: 5, name: "Yelp Integration", completed: false, lastUpdated: null },
            { id: 6, name: "Facebook Integration", completed: false, lastUpdated: null },
            { id: 7, name: "Initial Team Training", completed: false, lastUpdated: null },
            { id: 8, name: "Review Template Setup", completed: false, lastUpdated: null },
            { id: 9, name: "Workflow Customization", completed: false, lastUpdated: null },
            { id: 10, name: "QR Code Generation", completed: false, lastUpdated: null }
          ]
        },
        {
          id: 5,
          customerId: 5,
          customerName: "Robert Johnson",
          customerCompany: "Johnson Real Estate",
          email: "robert.johnson@example.com",
          phone: "555-567-8901",
          plan: "Business",
          startDate: "2024-03-30",
          assignedTo: "Jordan Miller",
          progress: 70,
          tasks: [
            { id: 1, name: "Account Setup", completed: true, lastUpdated: "2024-03-30" },
            { id: 2, name: "Payment Information", completed: true, lastUpdated: "2024-03-30" },
            { id: 3, name: "Business Details", completed: true, lastUpdated: "2024-03-31" },
            { id: 4, name: "Google Integration", completed: true, lastUpdated: "2024-04-01" },
            { id: 5, name: "Yelp Integration", completed: true, lastUpdated: "2024-04-01" },
            { id: 6, name: "Facebook Integration", completed: true, lastUpdated: "2024-04-01" },
            { id: 7, name: "Initial Team Training", completed: true, lastUpdated: "2024-04-05" },
            { id: 8, name: "Review Template Setup", completed: false, lastUpdated: null },
            { id: 9, name: "Workflow Customization", completed: false, lastUpdated: null },
            { id: 10, name: "QR Code Generation", completed: false, lastUpdated: null }
          ]
        }
      ];
      
      res.json(onboardingData);
    } catch (error) {
      next(error);
    }
  });
  
  // Get specific customer onboarding data
  app.get("/api/admin/onboarding/:id", requireRole('admin'), async (req, res, next) => {
    try {
      const { id } = req.params;
      
      // In a real app, this would fetch the specific customer's onboarding data by ID
      // For demo purposes, we'll return a fixed object
      
      const onboardingData = {
        id: parseInt(id),
        customerId: parseInt(id),
        customerName: "John Doe",
        customerCompany: "Doe Enterprises",
        email: "john.doe@example.com",
        phone: "555-123-4567",
        plan: "Pro",
        startDate: "2024-04-15",
        assignedTo: "Alex Johnson",
        progress: 35,
        tasks: [
          { id: 1, name: "Account Setup", completed: true, lastUpdated: "2024-04-15" },
          { id: 2, name: "Payment Information", completed: true, lastUpdated: "2024-04-15" },
          { id: 3, name: "Business Details", completed: true, lastUpdated: "2024-04-16" },
          { id: 4, name: "Google Integration", completed: false, lastUpdated: null },
          { id: 5, name: "Yelp Integration", completed: false, lastUpdated: null },
          { id: 6, name: "Facebook Integration", completed: false, lastUpdated: null },
          { id: 7, name: "Initial Team Training", completed: false, lastUpdated: null },
          { id: 8, name: "Review Template Setup", completed: false, lastUpdated: null },
          { id: 9, name: "Workflow Customization", completed: false, lastUpdated: null },
          { id: 10, name: "QR Code Generation", completed: false, lastUpdated: null }
        ],
        notes: [
          {
            id: 1,
            date: "2024-04-15",
            author: "Alex Johnson",
            content: "Initial setup completed. Customer needs help with Google integration."
          },
          {
            id: 2,
            date: "2024-04-16",
            author: "System",
            content: "Business details updated successfully."
          }
        ],
        activity: [
          {
            id: 1,
            date: "2024-04-15T10:30:00",
            type: "signup",
            description: "Customer signed up for Pro plan"
          },
          {
            id: 2,
            date: "2024-04-15T10:45:00",
            type: "payment",
            description: "Payment method added"
          },
          {
            id: 3,
            date: "2024-04-16T14:20:00",
            type: "update",
            description: "Business details updated"
          },
          {
            id: 4,
            date: "2024-04-18T09:15:00",
            type: "support",
            description: "Customer support call scheduled for Google integration"
          }
        ]
      };
      
      res.json(onboardingData);
    } catch (error) {
      next(error);
    }
  });
  
  // Update customer onboarding task
  app.patch("/api/admin/onboarding/:id/tasks/:taskId", requireRole('admin'), async (req, res, next) => {
    try {
      const { id, taskId } = req.params;
      const { completed } = req.body;
      
      // In a real app, this would update the task in the database
      // For demo purposes, we'll just return a success response
      
      res.json({
        id: parseInt(taskId),
        name: "Task Name", // This would come from the database
        completed,
        lastUpdated: completed ? new Date().toISOString().split('T')[0] : null
      });
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/admin/users/stats", requireRole('admin'), async (req, res, next) => {
    try {
      const { timeRange = '30days' } = req.query;
      
      // Sample user statistics - updated to match frontend expectations
      const userStats = {
        total: 2845,
        newUsers: {
          count: 385,
          trend: -5.3
        },
        activeUsers: {
          count: 2680,
          trend: 4.2
        },
        churnRate: 2.5,
        planDistribution: [
          { name: 'Free', value: 65 },
          { name: 'Pro', value: 27 },
          { name: 'Business', value: 8 },
        ],
        userGrowth: [
          { month: 'Jan', newUsers: 280, churn: 42 },
          { month: 'Feb', newUsers: 310, churn: 48 },
          { month: 'Mar', newUsers: 340, churn: 52 },
          { month: 'Apr', newUsers: 370, churn: 58 },
          { month: 'May', newUsers: 390, churn: 62 },
          { month: 'Jun', newUsers: 410, churn: 65 },
          { month: 'Jul', newUsers: 385, churn: 72 },
        ],
        acquisitionSources: [
          { name: 'Organic Search', value: 40 },
          { name: 'Direct', value: 25 },
          { name: 'Referral', value: 15 },
          { name: 'Social Media', value: 12 },
          { name: 'Paid Ads', value: 8 },
        ]
      };
      
      res.json(userStats);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/admin/users/recent", requireRole('admin'), async (req, res, next) => {
    try {
      // In a real app, we would fetch the most recent users
      // Sample data for recent users
      const recentUsers = [
        {
          id: 1001,
          username: 'sarahjohnson',
          email: 'sarah@example.com',
          fullName: 'Sarah Johnson',
          plan: 'Pro',
          joinedAt: new Date().toISOString(),
          status: 'active'
        },
        {
          id: 1002,
          username: 'michaelclark',
          email: 'mike@example.com',
          fullName: 'Michael Clark',
          plan: 'Free',
          joinedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          status: 'active'
        },
        {
          id: 1003,
          username: 'dentalcare',
          email: 'admin@dentalcare.com',
          fullName: 'Dental Care Inc.',
          plan: 'Business',
          joinedAt: new Date(Date.now() - 2 * 86400000).toISOString(), // 2 days ago
          status: 'active'
        }
      ];
      
      res.json(recentUsers);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/admin/financial", requireRole('admin'), async (req, res, next) => {
    try {
      const { timeRange = '30days' } = req.query;
      
      // Sample financial data - updated to match frontend expectations
      const financialData = {
        mrr: 24512,
        mrrChange: 8.2,
        arr: 294144,
        arrChange: 12.4,
        ltv: 412,
        ltv_change: 5.7,
        cac: 52,
        cac_change: -2.3,
        conversion_rate: 4.2,
        conversion_change: 0.8,
        revenue_by_plan: {
          free: 0,
          professional: 14700,
          business: 9400,
          enterprise: 5500
        },
        new_subscriptions: 142,
        upgrades: 38,
        cancellations: 22,
        renewal_rate: 89.5,
        // Keep these properties for other components that might need them
        revenueBreakdown: [
          { month: 'Jan', free: 0, pro: 9200, business: 6200 },
          { month: 'Feb', free: 0, pro: 10100, business: 7100 },
          { month: 'Mar', free: 0, pro: 11300, business: 7800 },
          { month: 'Apr', free: 0, pro: 12600, business: 8900 },
          { month: 'May', free: 0, pro: 13400, business: 9400 },
          { month: 'Jun', free: 0, pro: 14100, business: 10000 },
          { month: 'Jul', free: 0, pro: 14700, business: 10700 },
        ],
        revenueForecast: [
          { month: 'Aug', revenue: 26800, projected: true },
          { month: 'Sep', revenue: 28200, projected: true },
          { month: 'Oct', revenue: 29600, projected: true },
          { month: 'Nov', revenue: 31000, projected: true },
          { month: 'Dec', revenue: 33500, projected: true },
          { month: 'Jan', revenue: 35000, projected: true },
        ],
        planPricing: {
          free: 0,
          pro: 49,
          business: 149,
          enterprise: 499
        }
      };
      
      res.json(financialData);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/admin/transactions/recent", requireRole('admin'), async (req, res, next) => {
    try {
      // Sample recent transactions
      const recentTransactions = [
        {
          id: 'txn_1001',
          userId: 1001,
          customerName: 'Sarah Johnson',
          amount: 49.00,
          date: new Date().toISOString(),
          status: 'completed',
          plan: 'Pro'
        },
        {
          id: 'txn_1002',
          userId: 1003,
          customerName: 'Dental Care Inc.',
          amount: 149.00,
          date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          status: 'completed',
          plan: 'Business'
        },
        {
          id: 'txn_1003',
          userId: 1004,
          customerName: 'Robert Smith',
          amount: 49.00,
          date: new Date(Date.now() - 3 * 86400000).toISOString(), // 3 days ago
          status: 'completed',
          plan: 'Pro'
        }
      ];
      
      res.json(recentTransactions);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/admin/system-health", requireRole('admin'), async (req, res, next) => {
    try {
      // Sample system health data
      const systemHealth = {
        status: 'operational',
        lastIncident: new Date(Date.now() - 13 * 86400000).toISOString(), // 13 days ago
        apiPerformance: {
          getRequests: 78, // in ms
          postRequests: 124, // in ms
          aiGeneration: 890 // in ms
        },
        errorRate: 0.5, // percentage
        serverResources: {
          cpu: 42, // percentage
          memory: 68, // percentage
          disk: 54, // percentage
          network: 35 // percentage
        },
        databaseMetrics: {
          size: 12.8, // in GB
          queryPerformance: 42, // in ms
          connections: 32,
          maxConnections: 50,
          tableSizes: {
            reviews: 8.2, // in GB
            users: 1.4, // in GB
            locations: 0.8, // in GB
            metrics: 1.8, // in GB
            other: 0.6 // in GB
          }
        },
        externalServices: [
          {
            name: 'Google Places API',
            status: 'operational',
            latency: 214, // in ms
            lastCheck: new Date(Date.now() - 2 * 60000).toISOString() // 2 minutes ago
          },
          {
            name: 'Yelp API',
            status: 'operational',
            latency: 287, // in ms
            lastCheck: new Date(Date.now() - 4 * 60000).toISOString() // 4 minutes ago
          },
          {
            name: 'Facebook Graph API',
            status: 'operational',
            latency: 312, // in ms
            lastCheck: new Date(Date.now() - 3 * 60000).toISOString() // 3 minutes ago
          },
          {
            name: 'OpenAI API',
            status: 'operational',
            latency: 587, // in ms
            lastCheck: new Date(Date.now() - 1 * 60000).toISOString() // 1 minute ago
          },
          {
            name: 'Apple Maps API',
            status: 'degraded',
            latency: 645, // in ms
            lastCheck: new Date(Date.now() - 5 * 60000).toISOString() // 5 minutes ago
          }
        ],
        systemEvents: [
          {
            id: 'evt_1001',
            timestamp: new Date(Date.now() - 9 * 3600000).toISOString(), // 9 hours ago
            type: 'deployment',
            description: 'Deployed v2.8.3: Added Apple Maps integration and fixed review fetching issues.'
          },
          {
            id: 'evt_1002',
            timestamp: new Date(Date.now() - 1 * 86400000 - 3 * 3600000).toISOString(), // 1 day and 3 hours ago
            type: 'incident',
            description: 'Temporary API latency increase due to database maintenance. Resolved within 28 minutes.'
          },
          {
            id: 'evt_1003',
            timestamp: new Date(Date.now() - 2 * 86400000).toISOString(), // 2 days ago
            type: 'scaling',
            description: 'Added additional database read replicas to handle increased traffic.'
          },
          {
            id: 'evt_1004',
            timestamp: new Date(Date.now() - 4 * 86400000).toISOString(), // 4 days ago
            type: 'deployment',
            description: 'Deployed v2.8.2: Enhanced AI response generation and competitor analysis features.'
          }
        ]
      };
      
      res.json(systemHealth);
    } catch (error) {
      next(error);
    }
  });

  // Admin Analytics Data
  app.get("/api/admin/analytics", requireRole('admin'), async (req, res, next) => {
    try {
      const timeRange = req.query.timeRange || "30days";
      const platform = req.query.platform || "all";
      
      // Sample data for Admin Analytics
      const overview = {
        totalReviews: 18762,
        reviewChange: 22.8,
        averageRating: 4.2,
        ratingChange: 0.3,
        responseRate: 82,
        responseRateChange: 5.2,
        sentimentScore: 87,
        sentimentChange: 3.5
      };
      
      const reviewTrends = [
        { date: "Jan", Google: 850, Yelp: 450, Facebook: 240, "Apple Maps": 60 },
        { date: "Feb", Google: 920, Yelp: 470, Facebook: 250, "Apple Maps": 65 },
        { date: "Mar", Google: 980, Yelp: 490, Facebook: 265, "Apple Maps": 70 },
        { date: "Apr", Google: 1050, Yelp: 520, Facebook: 280, "Apple Maps": 75 },
        { date: "May", Google: 1120, Yelp: 560, Facebook: 300, "Apple Maps": 80 },
        { date: "Jun", Google: 1190, Yelp: 580, Facebook: 320, "Apple Maps": 90 },
        { date: "Jul", Google: 1240, Yelp: 610, Facebook: 340, "Apple Maps": 95 },
        { date: "Aug", Google: 1320, Yelp: 645, Facebook: 360, "Apple Maps": 100 },
        { date: "Sep", Google: 1380, Yelp: 680, Facebook: 385, "Apple Maps": 110 },
        { date: "Oct", Google: 1450, Yelp: 730, Facebook: 410, "Apple Maps": 120 },
        { date: "Nov", Google: 1530, Yelp: 785, Facebook: 435, "Apple Maps": 130 },
      ];
      
      const ratingDistribution = [
        { rating: "5", count: 8234 },
        { rating: "4", count: 6218 },
        { rating: "3", count: 2584 },
        { rating: "2", count: 1124 },
        { rating: "1", count: 602 }
      ];
      
      const sentimentTrends = [
        { date: "Jan", Positive: 65, Neutral: 25, Negative: 10 },
        { date: "Feb", Positive: 68, Neutral: 22, Negative: 10 },
        { date: "Mar", Positive: 70, Neutral: 21, Negative: 9 },
        { date: "Apr", Positive: 72, Neutral: 20, Negative: 8 },
        { date: "May", Positive: 73, Neutral: 19, Negative: 8 },
        { date: "Jun", Positive: 75, Neutral: 18, Negative: 7 },
        { date: "Jul", Positive: 77, Neutral: 17, Negative: 6 },
        { date: "Aug", Positive: 78, Neutral: 16, Negative: 6 },
        { date: "Sep", Positive: 80, Neutral: 15, Negative: 5 },
        { date: "Oct", Positive: 82, Neutral: 14, Negative: 4 },
        { date: "Nov", Positive: 85, Neutral: 11, Negative: 4 },
      ];
      
      const keyTopics = [
        { name: "Customer Service", sentiment: 82 },
        { name: "Price", sentiment: 65 },
        { name: "Product Quality", sentiment: 88 },
        { name: "Delivery Speed", sentiment: 74 },
        { name: "Return Process", sentiment: 70 }
      ];
      
      const responseTimeTrend = [
        { date: "Jan", hours: 18 },
        { date: "Feb", hours: 16 },
        { date: "Mar", hours: 15 },
        { date: "Apr", hours: 14 },
        { date: "May", hours: 12 },
        { date: "Jun", hours: 10 },
        { date: "Jul", hours: 8 },
        { date: "Aug", hours: 7 },
        { date: "Sep", hours: 6 },
        { date: "Oct", hours: 5 },
        { date: "Nov", hours: 4 },
      ];
      
      const interactionDistribution = [
        { type: "Replies", count: 14520 },
        { type: "Likes", count: 8246 },
        { type: "Shares", count: 3154 },
        { type: "Direct Messages", count: 1892 }
      ];
      
      const ratingComparison = [
        { name: "Your Business", rating: 4.2 },
        { name: "Competitor A", rating: 3.8 },
        { name: "Competitor B", rating: 4.0 },
        { name: "Competitor C", rating: 3.5 },
        { name: "Industry Average", rating: 3.7 }
      ];
      
      const volumeComparison = [
        { name: "Your Business", count: 18762 },
        { name: "Competitor A", count: 12450 },
        { name: "Competitor B", count: 14280 },
        { name: "Competitor C", count: 9540 },
        { name: "Industry Average", count: 13758 }
      ];
      
      res.json({
        overview,
        reviewTrends,
        ratingDistribution,
        sentimentTrends,
        keyTopics,
        responseTimeTrend,
        interactionDistribution,
        ratingComparison,
        volumeComparison
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Admin Customers List for Filters
  app.get("/api/admin/customers/list", requireRole('admin'), async (req, res, next) => {
    try {
      // Sample customers list data
      const customers = [
        { id: 1, name: "Johnson & Partners Law Firm" },
        { id: 2, name: "SmileBright Dental Clinic" },
        { id: 3, name: "City Central Medical Center" },
        { id: 4, name: "Peak Performance Physical Therapy" },
        { id: 5, name: "Greenfield Financial Advisors" },
        { id: 6, name: "Coast to Coast Accounting" },
        { id: 7, name: "Tech Forward IT Consulting" },
        { id: 8, name: "Mountain View Orthodontics" }
      ];
      
      res.json(customers);
    } catch (error) {
      next(error);
    }
  });
  
  // Location Analytics Data
  app.get("/api/admin/analytics/locations", requireRole('admin'), async (req, res, next) => {
    try {
      const customerId = req.query.customer;
      const timeRange = req.query.timeRange || "30days";
      
      if (customerId === "all") {
        return res.status(400).json({ error: "Please select a specific customer" });
      }
      
      // Sample location analytics data
      const customerNames = [
        "Johnson & Partners Law Firm",
        "SmileBright Dental Clinic",
        "City Central Medical Center",
        "Peak Performance Physical Therapy",
        "Greenfield Financial Advisors",
        "Coast to Coast Accounting",
        "Tech Forward IT Consulting",
        "Mountain View Orthodontics"
      ];
      
      const customerName = customerNames[Number(customerId) - 1] || "Unknown Customer";
      
      const totalLocations = Math.floor(Math.random() * 8) + 3;
      const totalReviews = Math.floor(Math.random() * 2000) + 500;
      const reviewChange = Math.floor(Math.random() * 30) + 5;
      const averageRating = (Math.random() * 1.5) + 3.5;
      const ratingChange = (Math.random() * 0.6) - 0.1;
      const responseRate = Math.floor(Math.random() * 30) + 70;
      const responseRateChange = Math.floor(Math.random() * 12) - 2;
      
      // Generate random locations
      const cities = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose"];
      const areas = ["Downtown", "Uptown", "Westside", "Eastside", "Midtown", "North", "South", "Central", "Riverside", "Lakefront"];
      
      const locations = [];
      const volumeByLocation = [];
      const ratingByLocation = [];
      
      for (let i = 0; i < totalLocations; i++) {
        const cityIndex = Math.floor(Math.random() * cities.length);
        const areaIndex = Math.floor(Math.random() * areas.length);
        const locationName = `${cities[cityIndex]} - ${areas[areaIndex]}`;
        
        const reviewCount = Math.floor(Math.random() * 500) + 50;
        const rating = (Math.random() * 1.5) + 3.5;
        const responseRate = Math.floor(Math.random() * 25) + 75;
        const sentiment = Math.floor(Math.random() * 30) + 65;
        const trend = Math.floor(Math.random() * 30) - 10;
        
        locations.push({
          id: i + 1,
          name: locationName,
          reviewCount,
          rating,
          responseRate,
          sentiment,
          trend
        });
        
        volumeByLocation.push({
          name: locationName,
          count: reviewCount
        });
        
        ratingByLocation.push({
          name: locationName,
          rating: rating
        });
      }
      
      res.json({
        customerName,
        totalLocations,
        totalReviews,
        reviewChange,
        averageRating,
        ratingChange,
        responseRate,
        responseRateChange,
        locations,
        volumeByLocation,
        ratingByLocation
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Reports API
  app.get("/api/admin/reports", requireRole('admin'), async (req, res, next) => {
    try {
      const timeRange = req.query.timeRange || "30days";
      const reportType = req.query.type || "all";
      const searchTerm = req.query.search || "";
      
      // Sample reports data
      const reports = [
        {
          id: 1,
          name: "Monthly Performance Report - November 2023",
          type: "performance",
          created: "Nov 30, 2023",
          size: "1.4 MB",
          format: "pdf"
        },
        {
          id: 2,
          name: "Quarterly Sentiment Analysis - Q3 2023",
          type: "sentiment",
          created: "Oct 5, 2023",
          size: "2.8 MB",
          format: "excel"
        },
        {
          id: 3,
          name: "Competitor Analysis Report - Q4 2023",
          type: "competitive",
          created: "Nov 15, 2023",
          size: "3.2 MB",
          format: "pdf"
        },
        {
          id: 4,
          name: "Financial Performance Summary - November 2023",
          type: "financial",
          created: "Nov 28, 2023",
          size: "1.1 MB",
          format: "excel"
        },
        {
          id: 5,
          name: "Custom KPI Dashboard - Q4 2023",
          type: "custom",
          created: "Nov 10, 2023",
          size: "1.7 MB",
          format: "pdf"
        }
      ];
      
      // Filter by type if needed
      let filteredReports = reports;
      if (reportType !== "all") {
        filteredReports = reports.filter(report => report.type === reportType);
      }
      
      // Filter by search term if provided
      if (searchTerm) {
        const term = searchTerm.toString().toLowerCase();
        filteredReports = filteredReports.filter(report => 
          report.name.toLowerCase().includes(term) || 
          report.type.toLowerCase().includes(term)
        );
      }
      
      res.json({
        reports: filteredReports,
        total: reports.length,
        filtered: filteredReports.length
      });
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/admin/reports/scheduled", requireRole('admin'), async (req, res, next) => {
    try {
      // Sample scheduled reports data
      const schedules = [
        {
          id: 1,
          name: "Monthly Performance Summary",
          description: "Comprehensive review of platform performance",
          frequency: "Monthly (1st)",
          recipients: "3 recipients",
          lastGenerated: "Nov 1, 2023",
          status: "active"
        },
        {
          id: 2,
          name: "Weekly Reviews Digest",
          description: "Summary of new reviews and response metrics",
          frequency: "Weekly (Monday)",
          recipients: "5 recipients",
          lastGenerated: "Nov 27, 2023",
          status: "active"
        },
        {
          id: 3,
          name: "Quarterly Business Intelligence",
          description: "In-depth analysis of business trends and metrics",
          frequency: "Quarterly",
          recipients: "7 recipients",
          lastGenerated: "Oct 1, 2023",
          status: "active"
        },
        {
          id: 4,
          name: "Competitor Benchmark Report",
          description: "Comparison with key competitors",
          frequency: "Monthly (15th)",
          recipients: "4 recipients",
          lastGenerated: "Nov 15, 2023",
          status: "paused"
        }
      ];
      
      res.json({
        schedules,
        total: schedules.length
      });
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/admin/reports/templates", requireRole('admin'), async (req, res, next) => {
    try {
      // Sample report templates data
      const templates = [
        {
          id: 1,
          name: "Executive Dashboard",
          description: "High-level metrics for executive review",
          type: "executive",
          sections: "5",
          isDefault: true
        },
        {
          id: 2,
          name: "Performance Analytics",
          description: "Detailed performance metrics and trends",
          type: "performance",
          sections: "8",
          isDefault: false
        },
        {
          id: 3,
          name: "Sentiment Analysis",
          description: "Customer sentiment trends and insights",
          type: "sentiment",
          sections: "6",
          isDefault: false
        },
        {
          id: 4,
          name: "User Engagement Report",
          description: "User interaction and engagement metrics",
          type: "user",
          sections: "7",
          isDefault: false
        },
        {
          id: 5,
          name: "Financial Summary",
          description: "Revenue and financial performance",
          type: "executive",
          sections: "4",
          isDefault: false
        }
      ];
      
      res.json({
        templates,
        total: templates.length
      });
    } catch (error) {
      next(error);
    }
  });

  // Admin-only routes for user management
  app.get("/api/admin/users", requireRole('admin'), async (req, res, next) => {
    try {
      const users = await storage.getAllUsers();
      const allLocations = await storage.getAllLocations();
      
      // Remove sensitive information and add location counts
      const safeUsers = await Promise.all(users.map(async user => {
        const { password, ...userWithoutPassword } = user;
        
        // Count locations for this user
        const locationCount = allLocations.filter(location => location.userId === user.id).length;
        
        return {
          ...userWithoutPassword,
          locationCount
        };
      }));
      
      res.json(safeUsers);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/admin/users/:id", requireRole('admin'), async (req, res, next) => {
    try {
      const userId = Number(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove sensitive information
      const { password, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error) {
      next(error);
    }
  });
  
  app.patch("/api/admin/users/:id/role", requireRole('admin'), async (req, res, next) => {
    try {
      const userId = Number(req.params.id);
      const { role } = req.body;
      
      // Validate role
      const validRoles = ['admin', 'staff', 'user'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid role. Must be 'admin', 'staff', or 'user'" });
      }
      
      // Don't allow admins to demote themselves
      if (userId === req.user!.id && role !== 'admin') {
        return res.status(403).json({ 
          message: "Cannot change your own admin role" 
        });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const updatedUser = await storage.updateUser(userId, { role });
      
      // Remove sensitive information
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.json(userWithoutPassword);
    } catch (error) {
      next(error);
    }
  });
  
  app.patch("/api/admin/users/:id/active", requireRole('admin'), async (req, res, next) => {
    try {
      const userId = Number(req.params.id);
      const { isActive } = req.body;
      
      // Validate isActive
      if (typeof isActive !== 'boolean') {
        return res.status(400).json({ 
          message: "Invalid isActive value. Must be a boolean" 
        });
      }
      
      // Don't allow admins to deactivate themselves
      if (userId === req.user!.id && !isActive) {
        return res.status(403).json({ 
          message: "Cannot deactivate your own account" 
        });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const updatedUser = await storage.updateUser(userId, { isActive });
      
      // Remove sensitive information
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.json(userWithoutPassword);
    } catch (error) {
      next(error);
    }
  });
  
  // Staff-accessible routes
  app.get("/api/staff/locations", requireRole('staff'), async (req, res, next) => {
    try {
      // Staff can view all locations
      const locations = await storage.getAllLocations();
      res.json(locations);
    } catch (error) {
      next(error);
    }
  });
  
  // User and above can see their own user info
  app.get("/api/profile", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user!.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove sensitive information
      const { password, ...userWithoutPassword } = user;
      
      // Include permissions in the profile response
      const response = {
        ...userWithoutPassword,
        permissions: req.permissions
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  });
  
  // Development-only route to create an admin user (NOT for production)
  app.post('/api/dev/make-admin', async (req, res) => {
    try {
      if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ error: 'This endpoint is not available in production' });
      }
      
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }
      
      const user = await storage.getUser(Number(userId));
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const updatedUser = await storage.updateUser(Number(userId), { role: 'admin' });
      res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error('Error making user admin:', error);
      res.status(500).json({ error: 'Failed to update user role' });
    }
  });
  
  // DEVELOPMENT-ONLY: Create a test client account with sample data
  app.get("/api/setup-test-client", async (req, res, next) => {
    try {
      // Check if client user already exists
      const existingClient = await storage.getUserByUsername("client");
      
      if (existingClient) {
        return res.status(200).json({ 
          message: "Test client account already exists",
          credentials: {
            username: "client",
            password: "client123"
          }
        });
      }
      
      // Import functions for password hashing
      const { scrypt, randomBytes } = await import('crypto');
      const { promisify } = await import('util');
      const scryptAsync = promisify(scrypt);
      
      // Hash the password like in auth.ts
      async function hashPassword(password: string) {
        const salt = randomBytes(16).toString("hex");
        const buf = (await scryptAsync(password, salt, 64)) as Buffer;
        return `${buf.toString("hex")}.${salt}`;
      }
      
      // Create client user with password 'client123'
      const clientUser = await storage.createUser({
        username: "client",
        password: await hashPassword("client123"),
        email: "client@example.com",
        fullName: "Test Client",
        profilePicture: null,
        companyLogo: null,
        plan: "premium"
      });
      
      // Create locations for the client
      const downtownLocation = await storage.createLocation({
        userId: clientUser.id,
        name: "Downtown Office",
        address: "123 Main St, Downtown, NY 10001",
        phone: "555-123-4567",
      });
      
      const uptownLocation = await storage.createLocation({
        userId: clientUser.id,
        name: "Uptown Branch",
        address: "456 Park Ave, Uptown, NY 10022",
        phone: "555-987-6543",
      });
      
      // Create Downtown Location Reviews
      await storage.createReview({
        userId: clientUser.id,
        locationId: downtownLocation.id,
        reviewerName: "John Smith",
        rating: 5,
        reviewText: "The team at the downtown office was extremely helpful and professional. Highly recommended!",
        platform: "Google",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        isResolved: true,
        response: "Thank you for your kind words, John! We're glad we could help you."
      });
      
      await storage.createReview({
        userId: clientUser.id,
        locationId: downtownLocation.id,
        reviewerName: "Sarah Johnson",
        rating: 4,
        reviewText: "I had a good experience at the downtown office. The staff was helpful, although I had to wait a bit longer than expected.",
        platform: "Yelp",
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        isResolved: true,
        response: "Thanks for the feedback, Sarah. We appreciate your patience and will work on improving our wait times."
      });
      
      await storage.createReview({
        userId: clientUser.id,
        locationId: downtownLocation.id,
        reviewerName: "Mike Thompson",
        rating: 2,
        reviewText: "Long wait times and staff seemed disorganized. Expected better service based on the reviews.",
        platform: "Google",
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        isResolved: true,
        response: "We're sorry to hear about your experience, Mike. We'd like to make it right - please contact our office manager to discuss further."
      });
      
      // Create Uptown Location Reviews
      await storage.createReview({
        userId: clientUser.id,
        locationId: uptownLocation.id,
        reviewerName: "Emily Davis",
        rating: 5,
        reviewText: "The uptown branch team was amazing! They went above and beyond to help me with my issue.",
        platform: "Google",
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        isResolved: true,
        response: "Thank you for the wonderful review, Emily! We're delighted to have been able to help you."
      });
      
      await storage.createReview({
        userId: clientUser.id,
        locationId: uptownLocation.id,
        reviewerName: "Robert Wilson",
        rating: 3,
        reviewText: "The service was okay but nothing special. Staff was polite but seemed rushed.",
        platform: "Facebook",
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        isResolved: false
      });
      
      await storage.createReview({
        userId: clientUser.id,
        locationId: uptownLocation.id,
        reviewerName: "Jessica Brown",
        rating: 4,
        reviewText: "I've been coming to this location for years. The service is consistently good.",
        platform: "Yelp",
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        isResolved: true,
        response: "Thank you for being a loyal customer, Jessica! We value your continued trust in our services."
      });
      
      // Create metrics for the client
      await storage.createMetrics({
        userId: clientUser.id,
        date: new Date(),
        averageRating: 3.83,
        totalReviews: 6,
        positivePercentage: 66.7,
        keywordTrends: JSON.stringify({
          "service": 6,
          "staff": 4,
          "helpful": 3,
          "professional": 2,
          "wait": 2
        })
      });
      
      res.status(201).json({
        message: "Test client account created successfully",
        credentials: {
          username: "client",
          password: "client123"
        }
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Subscription plans endpoints
  app.get("/api/subscription-plans", async (req, res, next) => {
    try {
      // Initialize subscription plans if they don't exist
      const plans = await initializeSubscriptionPlans();
      res.json(plans.flat()); // Flatten array of arrays if any
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/subscribe", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const userId = req.user!.id;
      const { planId, isAnnual = false } = req.body;
      
      if (!planId) {
        return res.status(400).json({ message: "Plan ID is required" });
      }
      
      const updatedUser = await updateSubscription(userId, planId, isAnnual);
      
      // In a real application with Stripe integration, you might return a checkout URL
      // For this demo, we'll just return the updated user
      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/start-trial", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const userId = req.user!.id;
      const { planName = 'Pro' } = req.body;
      
      const updatedUser = await startTrial(userId, planName);
      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/cancel-subscription", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const userId = req.user!.id;
      const updatedUser = await cancelSubscription(userId);
      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/subscription", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const userId = req.user!.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return subscription details
      res.json({
        plan: user.plan,
        status: user.subscriptionStatus,
        trialEndsAt: user.trialEndsAt,
        subscriptionEndsAt: user.subscriptionEndsAt,
        isValid: await hasValidSubscription(userId),
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
