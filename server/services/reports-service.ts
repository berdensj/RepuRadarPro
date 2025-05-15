import { Review, Location, Metrics } from "@shared/schema";
import { storage } from "../storage";
import OpenAI from "openai";
import { analyzeReviewSentiment } from "../lib/openai";

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * ReportsService - Handles generation of various types of reports
 * Used for both on-demand reports and scheduled weekly/monthly summaries
 */
export class ReportsService {
  /**
   * Generate a weekly summary report for a user
   * @param userId The user ID to generate the report for
   */
  public async generateWeeklySummary(userId: number) {
    try {
      // Get user's reviews from the past week
      const today = new Date();
      const lastWeek = new Date(today);
      lastWeek.setDate(today.getDate() - 7);
      
      // Get the user's locations
      const locations = await storage.getLocations(userId);
      
      // Get reviews for the user
      const reviews = await storage.getReviewsByUserId(userId);
      
      // Filter reviews from the past week
      const recentReviews = reviews.filter(
        (review) => new Date(review.date) >= lastWeek
      );
      
      // Calculate metrics
      const metrics = await this.calculateReportMetrics(userId, recentReviews, locations);
      
      // Return the formatted report
      return this.formatWeeklySummaryReport(metrics, recentReviews, locations);
    } catch (error) {
      console.error("Error generating weekly summary:", error);
      throw new Error("Failed to generate weekly summary report");
    }
  }
  
  /**
   * Calculate metrics for a report based on reviews
   */
  private async calculateReportMetrics(userId: number, reviews: Review[], locations: Location[]) {
    // Initialize metrics object
    const metrics = {
      totalReviews: reviews.length,
      averageRating: 0,
      responseRate: 0,
      sentimentBreakdown: {
        positive: 0,
        neutral: 0,
        negative: 0,
      },
      topLocation: null as (Location | null),
      locationPerformance: [] as {location: Location, reviewCount: number, avgRating: number}[],
    };
    
    // Return empty metrics if no reviews
    if (reviews.length === 0) {
      return metrics;
    }
    
    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    metrics.averageRating = parseFloat((totalRating / reviews.length).toFixed(1));
    
    // Calculate response rate
    const respondedReviews = reviews.filter(review => !!review.response);
    metrics.responseRate = Math.round((respondedReviews.length / reviews.length) * 100);
    
    // Calculate sentiment breakdown
    const sentimentCounts = {
      positive: reviews.filter(review => review.sentiment === 'positive').length,
      neutral: reviews.filter(review => review.sentiment === 'neutral').length,
      negative: reviews.filter(review => review.sentiment === 'negative').length,
    };
    
    if (reviews.length > 0) {
      metrics.sentimentBreakdown = {
        positive: Math.round((sentimentCounts.positive / reviews.length) * 100),
        neutral: Math.round((sentimentCounts.neutral / reviews.length) * 100),
        negative: Math.round((sentimentCounts.negative / reviews.length) * 100),
      };
    }
    
    // Calculate metrics per location
    const locationStats = new Map<number, {reviewCount: number, totalRating: number, location: Location}>();
    
    // Initialize map with all locations
    locations.forEach(location => {
      locationStats.set(location.id, {
        reviewCount: 0,
        totalRating: 0,
        location,
      });
    });
    
    // Aggregate review data by location
    reviews.forEach(review => {
      if (review.locationId) {
        const stats = locationStats.get(review.locationId);
        if (stats) {
          stats.reviewCount++;
          stats.totalRating += review.rating;
        }
      }
    });
    
    // Convert to array and calculate averages
    metrics.locationPerformance = Array.from(locationStats.values())
      .filter(stats => stats.reviewCount > 0)
      .map(stats => ({
        location: stats.location,
        reviewCount: stats.reviewCount,
        avgRating: parseFloat((stats.totalRating / stats.reviewCount).toFixed(1))
      }))
      .sort((a, b) => b.avgRating - a.avgRating);
    
    // Determine top location
    if (metrics.locationPerformance.length > 0) {
      metrics.topLocation = metrics.locationPerformance[0].location;
    }
    
    return metrics;
  }
  
  /**
   * Format the weekly summary report into a JSON structure
   * This could be used to generate HTML emails or downloadable reports
   */
  private formatWeeklySummaryReport(metrics: any, recentReviews: Review[], locations: Location[]) {
    // Get top positive and negative reviews
    const sortedByRating = [...recentReviews].sort((a, b) => b.rating - a.rating);
    const topPositiveReview = sortedByRating.length > 0 ? sortedByRating[0] : null;
    const topNegativeReview = [...sortedByRating].reverse()[0] || null;
    
    // Format the report
    return {
      reportType: "weekly_summary",
      generatedAt: new Date().toISOString(),
      metrics: {
        totalReviews: metrics.totalReviews,
        averageRating: metrics.averageRating,
        responseRate: metrics.responseRate,
        sentimentBreakdown: metrics.sentimentBreakdown,
      },
      topPerformers: {
        location: metrics.topLocation ? {
          name: metrics.topLocation.name,
          rating: metrics.locationPerformance.find(l => l.location.id === metrics.topLocation?.id)?.avgRating || 0,
        } : null,
      },
      locationPerformance: metrics.locationPerformance.map((location: any) => ({
        name: location.location.name,
        reviewCount: location.reviewCount,
        avgRating: location.avgRating,
      })),
      highlightedReviews: {
        positive: topPositiveReview ? {
          reviewerName: topPositiveReview.reviewerName,
          platform: topPositiveReview.platform,
          rating: topPositiveReview.rating,
          reviewText: topPositiveReview.reviewText,
          sentiment: topPositiveReview.sentiment,
        } : null,
        negative: topNegativeReview ? {
          reviewerName: topNegativeReview.reviewerName,
          platform: topNegativeReview.platform,
          rating: topNegativeReview.rating,
          reviewText: topNegativeReview.reviewText,
          sentiment: topNegativeReview.sentiment,
        } : null,
      },
    };
  }
}

// Export a singleton instance
export const reportsService = new ReportsService();