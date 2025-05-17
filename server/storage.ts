import { 
  users, type User, type InsertUser, 
  reviews, type Review, type InsertReview, 
  metrics, type Metrics, type InsertMetrics, 
  alerts, type Alert, type InsertAlert,
  locations, type Location, type InsertLocation,
  crmIntegrations, type CrmIntegration, type InsertCrmIntegration,
  aiReplies, type AiReply, type InsertAiReply,
  reviewInvites, type ReviewInvite, type InsertReviewInvite,
  healthcareSettings, type HealthcareSettings, type InsertHealthcareSettings
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Location methods
  getLocations(userId: number): Promise<Location[]>;
  getAllLocations(): Promise<Location[]>;

  // Review methods
  getReviewsByUserId(userId: number): Promise<Review[]>;
  getReviewById(id: number): Promise<Review | undefined>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: number, review: Partial<Review>): Promise<Review>;
  deleteReview(id: number): Promise<void>;
  getRecentReviews(userId: number, limit: number): Promise<Review[]>;
  getReviewsByPlatform(userId: number, platform: string): Promise<Review[]>;
  getReviewsByRating(userId: number, minRating: number, maxRating: number): Promise<Review[]>;
  getNegativeReviews(userId: number, limit: number): Promise<Review[]>;
  getReviewsWithoutAIReplies(userId: number, limit?: number): Promise<Review[]>;
  getReviewsByLocation(locationId: number): Promise<Review[]>;
  getReviewsByLocationWithSentiment(locationId: number): Promise<Review[]>;

  // AI Reply methods
  getAiRepliesForReview(reviewId: number): Promise<AiReply[]>;
  createAiReply(aiReply: InsertAiReply): Promise<AiReply>;
  updateAiReply(id: number, aiReply: Partial<AiReply>): Promise<AiReply>;
  getApprovedAiReply(reviewId: number): Promise<AiReply | undefined>;
  
  // Metrics methods
  getUserMetrics(userId: number): Promise<Metrics | undefined>;
  createMetrics(metrics: InsertMetrics): Promise<Metrics>;
  updateMetrics(userId: number, metrics: Partial<Metrics>): Promise<Metrics>;
  getLocationMetrics(locationId: number): Promise<any>;
  getWeeklySummary(userId: number): Promise<any>;

  // Alert methods
  getAlertsByUserId(userId: number, limit?: number): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  markAlertAsRead(id: number): Promise<Alert>;
  
  // CRM Integration methods
  getCrmIntegrations(userId: number): Promise<CrmIntegration[]>;
  getCrmIntegration(id: number): Promise<CrmIntegration | undefined>;
  createCrmIntegration(integration: InsertCrmIntegration): Promise<CrmIntegration>;
  updateCrmIntegration(id: number, integration: Partial<CrmIntegration>): Promise<CrmIntegration>;
  deleteCrmIntegration(id: number): Promise<void>;

  // AI Reply methods
  getAiRepliesForReview(reviewId: number): Promise<AiReply[]>;
  createAiReply(aiReply: InsertAiReply): Promise<AiReply>;
  updateAiReply(id: number, aiReply: Partial<AiReply>): Promise<AiReply>;
  getApprovedAiReply(reviewId: number): Promise<AiReply | undefined>;
  
  // Additional review methods
  getReviewsWithoutAIReplies(userId: number, limit?: number): Promise<Review[]>;
  getReviewsByLocation(locationId: number): Promise<Review[]>;
  getReviewsByLocationWithSentiment(locationId: number): Promise<Review[]>;
  
  // Additional metrics methods
  getLocationMetrics(locationId: number): Promise<any>;
  getWeeklySummary(userId: number): Promise<any>;

  // Healthcare-specific methods
  createReviewInvite(invitation: InsertReviewInvite): Promise<ReviewInvite>;
  getReviewInviteById(id: number): Promise<ReviewInvite | undefined>;
  updateReviewInvite(id: number, invitation: Partial<ReviewInvite>): Promise<ReviewInvite>;
  getReviewInvitesByLocationId(locationId: number, startDate?: Date, endDate?: Date): Promise<ReviewInvite[]>;
  
  // Healthcare settings methods
  getHealthcareSettingsByUserId(userId: number): Promise<HealthcareSettings | undefined>;
  createHealthcareSettings(settings: InsertHealthcareSettings): Promise<HealthcareSettings>;
  updateHealthcareSettings(id: number, settings: Partial<HealthcareSettings>): Promise<HealthcareSettings>;

  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private reviews: Map<number, Review>;
  private metricsMap: Map<number, Metrics>;
  private alerts: Map<number, Alert>;
  private locations: Map<number, Location>;
  private crmIntegrations: Map<number, CrmIntegration>;
  private aiReplies: Map<number, AiReply>;
  private reviewInvites: Map<number, ReviewInvite>;
  private healthcareSettingsMap: Map<number, HealthcareSettings>;
  sessionStore: session.Store;
  
  private userCurrentId: number;
  private reviewCurrentId: number;
  private metricsCurrentId: number;
  private alertCurrentId: number;
  private locationCurrentId: number;
  private crmIntegrationCurrentId: number;
  private aiReplyCurrentId: number;
  private reviewInviteCurrentId: number;
  private healthcareSettingsCurrentId: number;

  constructor() {
    this.users = new Map();
    this.reviews = new Map();
    this.metricsMap = new Map();
    this.alerts = new Map();
    this.locations = new Map();
    this.crmIntegrations = new Map();
    this.aiReplies = new Map();
    this.reviewInvites = new Map();
    this.healthcareSettingsMap = new Map();
    
    this.userCurrentId = 1;
    this.reviewCurrentId = 1;
    this.metricsCurrentId = 1;
    this.alertCurrentId = 1;
    this.locationCurrentId = 1;
    this.crmIntegrationCurrentId = 1;
    this.aiReplyCurrentId = 1;
    this.reviewInviteCurrentId = 1;
    this.healthcareSettingsCurrentId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Seed users including an admin
    this._seedUsers();
  }
  
  // Method to seed initial users
  private _seedUsers() {
    // Admin user
    const adminUser: User = {
      id: this.userCurrentId++,
      username: 'admin',
      password: '$2b$10$5QnkCEJKBTrfZS27qkZcU.tnULAjO4tmEt2s2XBuZIr6CYnigr96S', // hashed "admin123"
      email: 'admin@repuradar.com',
      fullName: 'System Administrator',
      role: 'admin',
      isActive: true,
      createdAt: new Date(),
      profilePicture: null,
      companyLogo: null,
      plan: 'enterprise'
    };
    this.users.set(adminUser.id, adminUser);
    
    // Regular user (already seeded by registration)
    const regularUser: User = {
      id: this.userCurrentId++,
      username: 'user',
      password: '$2b$10$5QnkCEJKBTrfZS27qkZcU.tnULAjO4tmEt2s2XBuZIr6CYnigr96S', // hashed "user123"
      email: 'user@example.com',
      fullName: 'Regular User',
      role: 'user',
      isActive: true,
      createdAt: new Date(),
      profilePicture: null,
      companyLogo: null,
      plan: 'free'
    };
    this.users.set(regularUser.id, regularUser);
    
    console.log('Seeded admin user with username: admin, password: admin123');
    console.log('Seeded regular user with username: user, password: user123');
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { 
      ...insertUser, 
      id,
      // Ensure all required fields are present
      role: 'user',
      isActive: true,
      createdAt: new Date(),
      // Handle nullable fields with defaults
      profilePicture: insertUser.profilePicture || null,
      companyLogo: insertUser.companyLogo || null,
      plan: insertUser.plan || 'free'
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, partial: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    const updated = { ...user, ...partial };
    this.users.set(id, updated);
    return updated;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  // Location methods
  async getLocations(userId: number): Promise<Location[]> {
    return Array.from(this.locations.values()).filter(
      (location) => location.userId === userId
    );
  }
  
  async getAllLocations(): Promise<Location[]> {
    return Array.from(this.locations.values());
  }

  // Review methods
  async getReviewsByUserId(userId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.userId === userId,
    );
  }

  async getReviewById(id: number): Promise<Review | undefined> {
    return this.reviews.get(id);
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = this.reviewCurrentId++;
    const review: Review = { 
      ...insertReview, 
      id,
      // Ensure all required fields are present
      date: insertReview.date || new Date(),
      locationId: insertReview.locationId || null,
      isResolved: insertReview.isResolved ?? false,
      // Handle nullable fields with defaults
      response: insertReview.response || null,
      externalId: insertReview.externalId || null,
      sentimentScore: insertReview.sentimentScore || null,
      keywords: insertReview.keywords || null
    };
    this.reviews.set(id, review);
    return review;
  }

  async updateReview(id: number, partial: Partial<Review>): Promise<Review> {
    const review = this.reviews.get(id);
    if (!review) {
      throw new Error(`Review with id ${id} not found`);
    }
    const updated = { ...review, ...partial };
    this.reviews.set(id, updated);
    return updated;
  }

  async deleteReview(id: number): Promise<void> {
    this.reviews.delete(id);
  }

  async getRecentReviews(userId: number, limit: number): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter((review) => review.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  async getReviewsByPlatform(userId: number, platform: string): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.userId === userId && review.platform === platform,
    );
  }

  async getReviewsByRating(userId: number, minRating: number, maxRating: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.userId === userId && review.rating >= minRating && review.rating <= maxRating,
    );
  }

  async getNegativeReviews(userId: number, limit: number): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter((review) => review.userId === userId && review.rating <= 2)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  // Metrics methods
  async getUserMetrics(userId: number): Promise<Metrics | undefined> {
    return Array.from(this.metricsMap.values()).find(
      (metric) => metric.userId === userId,
    );
  }

  async createMetrics(insertMetrics: InsertMetrics): Promise<Metrics> {
    const id = this.metricsCurrentId++;
    const metrics: Metrics = { 
      ...insertMetrics, 
      id,
      // Ensure all required fields are present
      date: insertMetrics.date || new Date(),
      // Handle nullable fields with defaults
      averageRating: insertMetrics.averageRating || null,
      totalReviews: insertMetrics.totalReviews || null,
      positivePercentage: insertMetrics.positivePercentage || null,
      keywordTrends: insertMetrics.keywordTrends || null
    };
    this.metricsMap.set(id, metrics);
    return metrics;
  }

  async updateMetrics(userId: number, partial: Partial<Metrics>): Promise<Metrics> {
    const metrics = Array.from(this.metricsMap.values()).find(
      (metric) => metric.userId === userId,
    );
    
    if (!metrics) {
      throw new Error(`Metrics for user ${userId} not found`);
    }
    
    const updated = { ...metrics, ...partial };
    this.metricsMap.set(metrics.id, updated);
    return updated;
  }

  // Alert methods
  async getAlertsByUserId(userId: number, limit?: number): Promise<Alert[]> {
    const alerts = Array.from(this.alerts.values())
      .filter((alert) => alert.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
    return limit ? alerts.slice(0, limit) : alerts;
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const id = this.alertCurrentId++;
    // Ensure all required fields are present with proper types
    const alert: Alert = {
      id,
      userId: insertAlert.userId,
      alertType: insertAlert.alertType,
      content: insertAlert.content,
      date: new Date(), // Always create with a valid date
      isRead: false // Always create as unread
    };
    this.alerts.set(id, alert);
    return alert;
  }

  async markAlertAsRead(id: number): Promise<Alert> {
    const alert = this.alerts.get(id);
    if (!alert) {
      throw new Error(`Alert with id ${id} not found`);
    }
    const updated = { ...alert, isRead: true };
    this.alerts.set(id, updated);
    return updated;
  }
  
  // CRM Integration methods
  async getCrmIntegrations(userId: number): Promise<CrmIntegration[]> {
    return Array.from(this.crmIntegrations.values()).filter(
      (integration) => integration.userId === userId
    );
  }

  async getCrmIntegration(id: number): Promise<CrmIntegration | undefined> {
    return this.crmIntegrations.get(id);
  }

  async createCrmIntegration(insertIntegration: InsertCrmIntegration): Promise<CrmIntegration> {
    const id = this.crmIntegrationCurrentId++;
    const integration: CrmIntegration = {
      ...insertIntegration,
      id,
      createdAt: new Date(),
      lastSync: null,
      requestsSent: 0
    };
    this.crmIntegrations.set(id, integration);
    return integration;
  }

  async updateCrmIntegration(id: number, partial: Partial<CrmIntegration>): Promise<CrmIntegration> {
    const integration = this.crmIntegrations.get(id);
    if (!integration) {
      throw new Error(`CRM Integration with id ${id} not found`);
    }
    const updated = { ...integration, ...partial };
    this.crmIntegrations.set(id, updated);
    return updated;
  }

  async deleteCrmIntegration(id: number): Promise<void> {
    this.crmIntegrations.delete(id);
  }

  // Review Extension Methods for AI features
  async getReviewsWithoutAIReplies(userId: number, limit?: number): Promise<Review[]> {
    const reviews = Array.from(this.reviews.values())
      .filter(r => r.userId === userId && !r.ai_replied)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return limit ? reviews.slice(0, limit) : reviews;
  }

  async getReviewsByLocation(locationId: number): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter(r => r.locationId === locationId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getReviewsByLocationWithSentiment(locationId: number): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter(r => r.locationId === locationId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // AI Reply Methods
  async getAiRepliesForReview(reviewId: number): Promise<AiReply[]> {
    return Array.from(this.aiReplies.values())
      .filter(reply => reply.reviewId === reviewId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createAiReply(aiReply: InsertAiReply): Promise<AiReply> {
    const id = this.aiReplyCurrentId++;
    const now = new Date();
    
    const newReply: AiReply = {
      id,
      reviewId: aiReply.reviewId,
      reply_text: aiReply.reply_text,
      tone: aiReply.tone || 'professional',
      approved: aiReply.approved || false,
      createdAt: now,
      updatedAt: aiReply.updatedAt || null
    };
    
    this.aiReplies.set(id, newReply);
    
    // Update the review to mark it as having an AI reply
    const review = await this.getReviewById(aiReply.reviewId);
    if (review) {
      await this.updateReview(review.id, { ai_replied: true });
    }
    
    return newReply;
  }

  async updateAiReply(id: number, aiReply: Partial<AiReply>): Promise<AiReply> {
    const existingReply = this.aiReplies.get(id);
    if (!existingReply) {
      throw new Error(`AI Reply with id ${id} not found`);
    }
    
    const updatedReply = {
      ...existingReply,
      ...aiReply,
      updatedAt: new Date()
    };
    
    this.aiReplies.set(id, updatedReply);
    return updatedReply;
  }

  async getApprovedAiReply(reviewId: number): Promise<AiReply | undefined> {
    return Array.from(this.aiReplies.values())
      .find(reply => reply.reviewId === reviewId && reply.approved);
  }

  // Location metrics methods
  async getLocationMetrics(locationId: number): Promise<any> {
    const reviews = await this.getReviewsByLocation(locationId);
    
    if (reviews.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        sentimentBreakdown: {
          positive: 0,
          neutral: 0,
          negative: 0
        },
        platforms: {}
      };
    }
    
    // Calculate metrics
    const totalReviews = reviews.length;
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
    
    // Calculate sentiment breakdown
    const sentimentBreakdown = {
      positive: reviews.filter(r => r.sentiment === 'positive').length,
      neutral: reviews.filter(r => r.sentiment === 'neutral').length,
      negative: reviews.filter(r => r.sentiment === 'negative').length
    };
    
    // Calculate platform breakdown
    const platforms = reviews.reduce((acc, review) => {
      acc[review.platform] = (acc[review.platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalReviews,
      averageRating,
      sentimentBreakdown,
      platforms
    };
  }

  async getWeeklySummary(userId: number): Promise<any> {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Get all reviews from the past week
    const reviews = Array.from(this.reviews.values())
      .filter(r => r.userId === userId && new Date(r.date) >= oneWeekAgo);
    
    if (reviews.length === 0) {
      return {
        period: {
          start: oneWeekAgo.toISOString(),
          end: now.toISOString()
        },
        totalNewReviews: 0,
        averageRating: 0,
        sentimentBreakdown: {
          positive: 0,
          neutral: 0,
          negative: 0
        },
        topReviews: []
      };
    }
    
    // Calculate metrics
    const totalNewReviews = reviews.length;
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalNewReviews;
    
    // Calculate sentiment breakdown
    const sentimentBreakdown = {
      positive: reviews.filter(r => r.sentiment === 'positive').length,
      neutral: reviews.filter(r => r.sentiment === 'neutral').length,
      negative: reviews.filter(r => r.sentiment === 'negative').length
    };
    
    // Get top reviews (by rating or review length)
    const topReviews = [...reviews]
      .sort((a, b) => {
        // First sort by rating (descending)
        if (b.rating !== a.rating) return b.rating - a.rating;
        // Then by review length (descending)
        return b.reviewText.length - a.reviewText.length;
      })
      .slice(0, 3); // Top 3 reviews
    
    return {
      period: {
        start: oneWeekAgo.toISOString(),
        end: now.toISOString()
      },
      totalNewReviews,
      averageRating,
      sentimentBreakdown,
      topReviews
    };
  }
}

// Import the database storage implementation
import { DatabaseStorage } from "./database-storage";

// Use DatabaseStorage instead of MemStorage for production
// Comment the line below and uncomment the one after it to switch to in-memory storage for development
// export const storage = new MemStorage();
export const storage = new DatabaseStorage();
