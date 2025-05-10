import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertReviewSchema, insertAlertSchema, insertMetricsSchema } from "@shared/schema";
import { generateAIReply } from "./lib/openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

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

  const httpServer = createServer(app);
  return httpServer;
}
