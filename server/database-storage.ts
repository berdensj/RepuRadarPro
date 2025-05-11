import {
  users, 
  type User, 
  type InsertUser,
  reviews, 
  type Review, 
  type InsertReview,
  metrics, 
  type Metrics, 
  type InsertMetrics,
  alerts, 
  type Alert, 
  type InsertAlert,
  locations,
  type Location,
  type InsertLocation,
  reviewTemplates,
  type ReviewTemplate,
  type InsertReviewTemplate,
  reviewRequests,
  type ReviewRequest,
  type InsertReviewRequest,
  competitors,
  type Competitor,
  type InsertCompetitor,
  competitorReports,
  agencies,
  agencyClients
} from "@shared/schema";
import { IStorage } from "./storage";
import { db } from "./db";
import { eq, and, desc, lte, between, sql, count } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { alias } from "drizzle-orm/pg-core";

// Set up PostgreSQL session store
const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async updateUser(id: number, partial: Partial<User>): Promise<User> {
    const [updated] = await db
      .update(users)
      .set(partial)
      .where(eq(users.id, id))
      .returning();
    return updated;
  }
  
  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  // Review methods
  async getReviewsByUserId(userId: number): Promise<Review[]> {
    return db.select().from(reviews).where(eq(reviews.userId, userId));
  }

  async getReviewById(id: number): Promise<Review | undefined> {
    const [review] = await db.select().from(reviews).where(eq(reviews.id, id));
    return review;
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db.insert(reviews).values(insertReview).returning();
    return review;
  }

  async updateReview(id: number, partial: Partial<Review>): Promise<Review> {
    const [updatedReview] = await db
      .update(reviews)
      .set(partial)
      .where(eq(reviews.id, id))
      .returning();
    
    if (!updatedReview) {
      throw new Error(`Review with id ${id} not found`);
    }
    
    return updatedReview;
  }

  async deleteReview(id: number): Promise<void> {
    await db.delete(reviews).where(eq(reviews.id, id));
  }

  async getRecentReviews(userId: number, limit: number): Promise<Review[]> {
    return db
      .select()
      .from(reviews)
      .where(eq(reviews.userId, userId))
      .orderBy(desc(reviews.date))
      .limit(limit);
  }

  async getReviewsByPlatform(userId: number, platform: string): Promise<Review[]> {
    return db
      .select()
      .from(reviews)
      .where(and(eq(reviews.userId, userId), eq(reviews.platform, platform)));
  }

  async getReviewsByRating(userId: number, minRating: number, maxRating: number): Promise<Review[]> {
    return db
      .select()
      .from(reviews)
      .where(
        and(
          eq(reviews.userId, userId),
          between(reviews.rating, minRating, maxRating)
        )
      );
  }

  async getNegativeReviews(userId: number, limit: number): Promise<Review[]> {
    return db
      .select()
      .from(reviews)
      .where(and(eq(reviews.userId, userId), lte(reviews.rating, 2)))
      .orderBy(desc(reviews.date))
      .limit(limit);
  }

  // Metrics methods
  async getUserMetrics(userId: number): Promise<Metrics | undefined> {
    const [userMetrics] = await db
      .select()
      .from(metrics)
      .where(eq(metrics.userId, userId))
      .orderBy(desc(metrics.date))
      .limit(1);
    
    return userMetrics;
  }

  async createMetrics(insertMetrics: InsertMetrics): Promise<Metrics> {
    const [newMetrics] = await db
      .insert(metrics)
      .values(insertMetrics)
      .returning();
    
    return newMetrics;
  }

  async updateMetrics(userId: number, partial: Partial<Metrics>): Promise<Metrics> {
    // Find the most recent metrics record
    const [userMetrics] = await db
      .select()
      .from(metrics)
      .where(eq(metrics.userId, userId))
      .orderBy(desc(metrics.date))
      .limit(1);
    
    if (!userMetrics) {
      throw new Error(`Metrics for user ${userId} not found`);
    }
    
    const [updatedMetrics] = await db
      .update(metrics)
      .set(partial)
      .where(eq(metrics.id, userMetrics.id))
      .returning();
    
    return updatedMetrics;
  }

  // Alert methods
  async getAlertsByUserId(userId: number, limit?: number): Promise<Alert[]> {
    const query = db
      .select()
      .from(alerts)
      .where(eq(alerts.userId, userId))
      .orderBy(desc(alerts.date));
    
    if (limit) {
      query.limit(limit);
    }
    
    return query;
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const [alert] = await db
      .insert(alerts)
      .values(insertAlert)
      .returning();
    
    return alert;
  }

  async markAlertAsRead(id: number): Promise<Alert> {
    const [updatedAlert] = await db
      .update(alerts)
      .set({ isRead: true })
      .where(eq(alerts.id, id))
      .returning();
    
    if (!updatedAlert) {
      throw new Error(`Alert with id ${id} not found`);
    }
    
    return updatedAlert;
  }

  // Location methods
  async getLocations(userId: number): Promise<Location[]> {
    return db
      .select()
      .from(locations)
      .where(eq(locations.userId, userId));
  }
  
  async getAllLocations(): Promise<Location[]> {
    return db.select().from(locations);
  }

  async getLocation(id: number): Promise<Location | undefined> {
    const [location] = await db
      .select()
      .from(locations)
      .where(eq(locations.id, id));
    
    return location;
  }

  async createLocation(insertLocation: InsertLocation): Promise<Location> {
    const [location] = await db
      .insert(locations)
      .values(insertLocation)
      .returning();
    
    return location;
  }

  async updateLocation(id: number, partial: Partial<Location>): Promise<Location> {
    const [updatedLocation] = await db
      .update(locations)
      .set(partial)
      .where(eq(locations.id, id))
      .returning();
    
    if (!updatedLocation) {
      throw new Error(`Location with id ${id} not found`);
    }
    
    return updatedLocation;
  }

  async deleteLocation(id: number): Promise<void> {
    await db.delete(locations).where(eq(locations.id, id));
  }

  // Review template methods
  async getReviewTemplates(userId: number): Promise<ReviewTemplate[]> {
    return db
      .select()
      .from(reviewTemplates)
      .where(eq(reviewTemplates.userId, userId));
  }

  async getReviewTemplate(id: number): Promise<ReviewTemplate | undefined> {
    const [template] = await db
      .select()
      .from(reviewTemplates)
      .where(eq(reviewTemplates.id, id));
    
    return template;
  }

  async getDefaultReviewTemplate(userId: number, templateType: string): Promise<ReviewTemplate | undefined> {
    const [template] = await db
      .select()
      .from(reviewTemplates)
      .where(
        and(
          eq(reviewTemplates.userId, userId),
          eq(reviewTemplates.isDefault, true),
          eq(reviewTemplates.templateType, templateType as string)
        )
      );
    
    return template;
  }

  async createReviewTemplate(insertTemplate: InsertReviewTemplate): Promise<ReviewTemplate> {
    // If this is set as default, unset any existing defaults of the same type
    if (insertTemplate.isDefault) {
      await db
        .update(reviewTemplates)
        .set({ isDefault: false })
        .where(
          and(
            eq(reviewTemplates.userId, insertTemplate.userId),
            eq(reviewTemplates.templateType, insertTemplate.templateType as string),
            eq(reviewTemplates.isDefault, true)
          )
        );
    }
    
    const [template] = await db
      .insert(reviewTemplates)
      .values(insertTemplate)
      .returning();
    
    return template;
  }

  async updateReviewTemplate(id: number, partial: Partial<ReviewTemplate>): Promise<ReviewTemplate> {
    const [template] = await db
      .select()
      .from(reviewTemplates)
      .where(eq(reviewTemplates.id, id));
    
    if (!template) {
      throw new Error(`Review template with id ${id} not found`);
    }
    
    // If setting as default, unset any existing defaults of the same type
    if (partial.isDefault) {
      await db
        .update(reviewTemplates)
        .set({ isDefault: false })
        .where(
          and(
            eq(reviewTemplates.userId, template.userId),
            eq(reviewTemplates.templateType, template.templateType as string),
            eq(reviewTemplates.isDefault, true),
            sql`${reviewTemplates.id} != ${id}`
          )
        );
    }
    
    const [updatedTemplate] = await db
      .update(reviewTemplates)
      .set(partial)
      .where(eq(reviewTemplates.id, id))
      .returning();
    
    return updatedTemplate;
  }

  async deleteReviewTemplate(id: number): Promise<void> {
    await db.delete(reviewTemplates).where(eq(reviewTemplates.id, id));
  }

  // Review request methods
  async getReviewRequests(userId: number): Promise<ReviewRequest[]> {
    return db
      .select()
      .from(reviewRequests)
      .where(eq(reviewRequests.userId, userId))
      .orderBy(desc(reviewRequests.createdAt));
  }

  async getReviewRequest(id: number): Promise<ReviewRequest | undefined> {
    const [request] = await db
      .select()
      .from(reviewRequests)
      .where(eq(reviewRequests.id, id));
    
    return request;
  }

  async createReviewRequest(insertRequest: InsertReviewRequest): Promise<ReviewRequest> {
    const [request] = await db
      .insert(reviewRequests)
      .values(insertRequest)
      .returning();
    
    return request;
  }

  async updateReviewRequest(id: number, partial: Partial<ReviewRequest>): Promise<ReviewRequest> {
    const [updatedRequest] = await db
      .update(reviewRequests)
      .set(partial)
      .where(eq(reviewRequests.id, id))
      .returning();
    
    if (!updatedRequest) {
      throw new Error(`Review request with id ${id} not found`);
    }
    
    return updatedRequest;
  }

  async deleteReviewRequest(id: number): Promise<void> {
    await db.delete(reviewRequests).where(eq(reviewRequests.id, id));
  }

  // Competitor methods
  async getCompetitors(userId: number): Promise<Competitor[]> {
    return db
      .select()
      .from(competitors)
      .where(eq(competitors.userId, userId));
  }

  async getCompetitor(id: number): Promise<Competitor | undefined> {
    const [competitor] = await db
      .select()
      .from(competitors)
      .where(eq(competitors.id, id));
    
    return competitor;
  }

  async createCompetitor(insertCompetitor: InsertCompetitor): Promise<Competitor> {
    const [competitor] = await db
      .insert(competitors)
      .values(insertCompetitor)
      .returning();
    
    return competitor;
  }

  async updateCompetitor(id: number, partial: Partial<Competitor>): Promise<Competitor> {
    const [updatedCompetitor] = await db
      .update(competitors)
      .set(partial)
      .where(eq(competitors.id, id))
      .returning();
    
    if (!updatedCompetitor) {
      throw new Error(`Competitor with id ${id} not found`);
    }
    
    return updatedCompetitor;
  }

  async deleteCompetitor(id: number): Promise<void> {
    await db.delete(competitors).where(eq(competitors.id, id));
  }

  // Dashboard analytics methods
  async getDashboardStats(userId: number): Promise<{
    totalReviews: number;
    averageRating: number;
    positiveReviews: number;
    negativeReviews: number;
    recentTrend: number;
  }> {
    // Get total reviews count
    const [totalResult] = await db
      .select({ count: count() })
      .from(reviews)
      .where(eq(reviews.userId, userId));
    
    const totalReviews = totalResult?.count || 0;
    
    if (totalReviews === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        positiveReviews: 0,
        negativeReviews: 0,
        recentTrend: 0,
      };
    }
    
    // Get average rating
    const [avgResult] = await db
      .select({ average: sql`AVG(${reviews.rating})` })
      .from(reviews)
      .where(eq(reviews.userId, userId));
    
    const averageRating = parseFloat(avgResult.average as string) || 0;
    
    // Get positive reviews count (rating >= 4)
    const [positiveResult] = await db
      .select({ count: count() })
      .from(reviews)
      .where(and(eq(reviews.userId, userId), sql`${reviews.rating} >= 4`));
    
    const positiveReviews = positiveResult?.count || 0;
    
    // Get negative reviews count (rating <= 2)
    const [negativeResult] = await db
      .select({ count: count() })
      .from(reviews)
      .where(and(eq(reviews.userId, userId), sql`${reviews.rating} <= 2`));
    
    const negativeReviews = negativeResult?.count || 0;
    
    // Get rating trend (difference in average rating between last 30 days and previous 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    
    const [recentAvg] = await db
      .select({ average: sql`AVG(${reviews.rating})` })
      .from(reviews)
      .where(
        and(
          eq(reviews.userId, userId),
          sql`${reviews.date} >= ${thirtyDaysAgo.toISOString()}`
        )
      );
    
    const [previousAvg] = await db
      .select({ average: sql`AVG(${reviews.rating})` })
      .from(reviews)
      .where(
        and(
          eq(reviews.userId, userId),
          sql`${reviews.date} >= ${sixtyDaysAgo.toISOString()}`,
          sql`${reviews.date} < ${thirtyDaysAgo.toISOString()}`
        )
      );
    
    const recentTrend = 
      (parseFloat(recentAvg.average as string) - parseFloat(previousAvg.average as string)) || 0;
    
    return {
      totalReviews,
      averageRating,
      positiveReviews,
      negativeReviews,
      recentTrend,
    };
  }
}