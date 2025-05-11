import { users, type User, type InsertUser, reviews, type Review, type InsertReview, metrics, type Metrics, type InsertMetrics, alerts, type Alert, type InsertAlert } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

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

  // Metrics methods
  getUserMetrics(userId: number): Promise<Metrics | undefined>;
  createMetrics(metrics: InsertMetrics): Promise<Metrics>;
  updateMetrics(userId: number, metrics: Partial<Metrics>): Promise<Metrics>;

  // Alert methods
  getAlertsByUserId(userId: number, limit?: number): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  markAlertAsRead(id: number): Promise<Alert>;

  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private reviews: Map<number, Review>;
  private metricsMap: Map<number, Metrics>;
  private alerts: Map<number, Alert>;
  sessionStore: session.SessionStore;
  
  private userCurrentId: number;
  private reviewCurrentId: number;
  private metricsCurrentId: number;
  private alertCurrentId: number;

  constructor() {
    this.users = new Map();
    this.reviews = new Map();
    this.metricsMap = new Map();
    this.alerts = new Map();
    
    this.userCurrentId = 1;
    this.reviewCurrentId = 1;
    this.metricsCurrentId = 1;
    this.alertCurrentId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
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
    const review: Review = { ...insertReview, id };
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
    const metrics: Metrics = { ...insertMetrics, id };
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
    const alert: Alert = { ...insertAlert, id };
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
}

// Import the database storage implementation
import { DatabaseStorage } from "./database-storage";

// Use DatabaseStorage instead of MemStorage for production
// Comment the line below and uncomment the one after it to switch to in-memory storage for development
// export const storage = new MemStorage();
export const storage = new DatabaseStorage();
