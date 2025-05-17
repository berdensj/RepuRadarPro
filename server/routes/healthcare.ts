import { Router } from "express";
import { storage } from "../storage";
import { requireAuthentication } from "../middleware/auth";
import { z } from "zod";
import { 
  insertReviewInviteSchema,
  insertHealthcareSettingsSchema
} from "@shared/schema";
import { 
  sendReviewInvite, 
  simulateInviteOpened,
  simulateInviteClicked,
  getOrCreateHealthcareSettings,
  updateHealthcareSettings,
  getReviewInviteAnalytics,
  getHealthcareAIReply
} from "../services/healthcare-service";

const router = Router();

// Middleware to ensure we're working with healthcare accounts
const healthcareBusinessCheck = async (req, res, next) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const user = await storage.getUser(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Check if user is a healthcare business type
    const isHealthcare = user.clientType && [
      "Medical Clinic", 
      "Dental Practice", 
      "MedSpa", 
      "Mental Health"
    ].includes(user.clientType);
    
    if (!isHealthcare) {
      return res.status(403).json({ 
        message: "This feature is only available for healthcare businesses"
      });
    }
    
    next();
  } catch (error) {
    console.error("Healthcare middleware error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get healthcare settings
router.get("/settings", requireAuthentication, async (req, res) => {
  try {
    const userId = req.user.id;
    const settings = await getOrCreateHealthcareSettings(userId);
    res.json(settings);
  } catch (error) {
    console.error("Error fetching healthcare settings:", error);
    res.status(500).json({ message: "Error fetching healthcare settings" });
  }
});

// Update healthcare settings
router.post("/settings", requireAuthentication, async (req, res) => {
  try {
    const userId = req.user.id;
    const schema = insertHealthcareSettingsSchema.partial();
    
    const validatedData = schema.parse(req.body);
    const settings = await updateHealthcareSettings(userId, validatedData);
    
    res.json(settings);
  } catch (error) {
    console.error("Error updating healthcare settings:", error);
    res.status(500).json({ message: "Error updating healthcare settings" });
  }
});

// Send a review invite
router.post("/review-invites", requireAuthentication, healthcareBusinessCheck, async (req, res) => {
  try {
    const schema = z.object({
      locationId: z.number(),
      patientName: z.string(),
      method: z.enum(["email", "sms"]).default("email"),
    });
    
    const { locationId, patientName, method } = schema.parse(req.body);
    
    // Verify location belongs to the user
    const location = await storage.getLocation(locationId);
    if (!location || location.userId !== req.user.id) {
      return res.status(403).json({ message: "You do not have access to this location" });
    }
    
    const invite = await sendReviewInvite(locationId, patientName, method);
    res.status(201).json(invite);
  } catch (error) {
    console.error("Error sending review invite:", error);
    res.status(500).json({ message: "Error sending review invite" });
  }
});

// Get review invites for a location
router.get("/review-invites/location/:locationId", requireAuthentication, async (req, res) => {
  try {
    const locationId = parseInt(req.params.locationId);
    if (isNaN(locationId)) {
      return res.status(400).json({ message: "Invalid location ID" });
    }
    
    // Verify location belongs to the user
    const location = await storage.getLocation(locationId);
    if (!location || location.userId !== req.user.id) {
      return res.status(403).json({ message: "You do not have access to this location" });
    }
    
    const days = req.query.days ? parseInt(req.query.days as string) : 7;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const invites = await storage.getReviewInvitesByLocationId(locationId, startDate);
    res.json(invites);
  } catch (error) {
    console.error("Error fetching review invites:", error);
    res.status(500).json({ message: "Error fetching review invites" });
  }
});

// Get analytics for review invites
router.get("/review-invites/analytics/:locationId", requireAuthentication, async (req, res) => {
  try {
    const locationId = parseInt(req.params.locationId);
    if (isNaN(locationId)) {
      return res.status(400).json({ message: "Invalid location ID" });
    }
    
    // Verify location belongs to the user
    const location = await storage.getLocation(locationId);
    if (!location || location.userId !== req.user.id) {
      return res.status(403).json({ message: "You do not have access to this location" });
    }
    
    const days = req.query.days ? parseInt(req.query.days as string) : 7;
    
    const analytics = await getReviewInviteAnalytics(locationId, days);
    res.json(analytics);
  } catch (error) {
    console.error("Error fetching review invite analytics:", error);
    res.status(500).json({ message: "Error fetching review invite analytics" });
  }
});

// Simulate invite opened (for demo purposes)
router.post("/review-invites/:id/opened", requireAuthentication, async (req, res) => {
  try {
    const inviteId = parseInt(req.params.id);
    if (isNaN(inviteId)) {
      return res.status(400).json({ message: "Invalid invite ID" });
    }
    
    const invite = await storage.getReviewInviteById(inviteId);
    if (!invite) {
      return res.status(404).json({ message: "Invite not found" });
    }
    
    const location = await storage.getLocation(invite.locationId);
    if (!location || location.userId !== req.user.id) {
      return res.status(403).json({ message: "You do not have access to this invite" });
    }
    
    const updated = await simulateInviteOpened(inviteId);
    res.json(updated);
  } catch (error) {
    console.error("Error simulating invite opened:", error);
    res.status(500).json({ message: "Error simulating invite opened" });
  }
});

// Simulate invite clicked (for demo purposes)
router.post("/review-invites/:id/clicked", requireAuthentication, async (req, res) => {
  try {
    const inviteId = parseInt(req.params.id);
    if (isNaN(inviteId)) {
      return res.status(400).json({ message: "Invalid invite ID" });
    }
    
    const invite = await storage.getReviewInviteById(inviteId);
    if (!invite) {
      return res.status(404).json({ message: "Invite not found" });
    }
    
    const location = await storage.getLocation(invite.locationId);
    if (!location || location.userId !== req.user.id) {
      return res.status(403).json({ message: "You do not have access to this invite" });
    }
    
    const updated = await simulateInviteClicked(inviteId);
    res.json(updated);
  } catch (error) {
    console.error("Error simulating invite clicked:", error);
    res.status(500).json({ message: "Error simulating invite clicked" });
  }
});

// Get healthcare-aware AI reply for a review
router.get("/ai-reply/:reviewId", requireAuthentication, async (req, res) => {
  try {
    const reviewId = parseInt(req.params.reviewId);
    if (isNaN(reviewId)) {
      return res.status(400).json({ message: "Invalid review ID" });
    }
    
    const review = await storage.getReviewById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    
    if (review.userId !== req.user.id) {
      return res.status(403).json({ message: "You do not have access to this review" });
    }
    
    const replyText = await getHealthcareAIReply(reviewId, req.user.id);
    res.json({ reply: replyText });
  } catch (error) {
    console.error("Error generating healthcare AI reply:", error);
    res.status(500).json({ message: "Error generating healthcare AI reply" });
  }
});

export default router;