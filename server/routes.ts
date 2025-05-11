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
  insertLocationSchema
} from "@shared/schema";
import { generateAIReply } from "./lib/openai";
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

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Attach permissions to requests
  app.use(attachPermissions);

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
  app.post("/api/reviews/:id/generate-reply", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const reviewId = Number(req.params.id);
      const userId = req.user!.id;
      const tone = req.body.tone || "professional";
      
      // Check if the review belongs to the user
      const review = await storage.getReviewById(reviewId);
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }
      
      if (review.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const generatedReply = await generateAIReply(review, tone);
      res.json({ reply: generatedReply });
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

  // Admin-only routes for user management
  app.get("/api/admin/users", requireRole('admin'), async (req, res, next) => {
    try {
      const users = await storage.getAllUsers();
      
      // Remove sensitive information
      const safeUsers = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
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
  
  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
