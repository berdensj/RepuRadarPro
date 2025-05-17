import { storage } from "../storage";
import { 
  insertReviewInviteSchema, 
  insertHealthcareSettingsSchema, 
  type InsertReviewInvite, 
  type ReviewInvite, 
  type HealthcareSettings
} from "@shared/schema";
import { generateAIReply } from "../lib/openai";

/**
 * Sends a simulated review request to a patient
 * @param locationId The location ID where the patient was treated
 * @param patientName The patient's name
 * @param method The delivery method (email or sms)
 * @returns The created review invite record
 */
export async function sendReviewInvite(
  locationId: number, 
  patientName: string, 
  method: string = "email",
): Promise<ReviewInvite> {
  const location = await storage.getLocation(locationId);
  if (!location) {
    throw new Error("Location not found");
  }

  // Default initial status is "sent" since this is a simulation
  const insertData: InsertReviewInvite = {
    locationId,
    patientName,
    method,
    status: "sent",
    sentAt: new Date(),
    // simulated immediate delivery for demo purposes
    deliveredAt: new Date(),
  };

  // Create the review invitation record
  const invite = await storage.createReviewInvite(insertData);
  
  return invite;
}

/**
 * Simulates opening of a review invite, updating the status and timestamps
 * @param inviteId The ID of the review invite to update
 */
export async function simulateInviteOpened(inviteId: number): Promise<ReviewInvite> {
  return await storage.updateReviewInvite(inviteId, {
    status: "opened",
    openedAt: new Date(),
  });
}

/**
 * Simulates clicking of a review invite, updating the status and timestamps
 * @param inviteId The ID of the review invite to update
 */
export async function simulateInviteClicked(inviteId: number): Promise<ReviewInvite> {
  return await storage.updateReviewInvite(inviteId, {
    status: "clicked",
    clickedAt: new Date(),
  });
}

/**
 * Gets or creates healthcare settings for a user
 * @param userId The user ID
 * @returns The healthcare settings
 */
export async function getOrCreateHealthcareSettings(userId: number): Promise<HealthcareSettings> {
  // Check if settings already exist
  const existingSettings = await storage.getHealthcareSettingsByUserId(userId);
  if (existingSettings) {
    return existingSettings;
  }

  // Create new settings with defaults
  const newSettings: HealthcareSettings = await storage.createHealthcareSettings({
    userId,
    enableReviewAutomation: false,
    requestDelay: "immediately",
    usePatientTerminology: true,
    hipaaMode: true,
    updatedAt: new Date(),
  });

  return newSettings;
}

/**
 * Gets customized AI reply based on healthcare settings
 * @param reviewId The review ID to generate a reply for
 * @param userId The user ID to check healthcare settings
 * @returns The AI-generated reply text
 */
export async function getHealthcareAIReply(reviewId: number, userId: number): Promise<string> {
  const review = await storage.getReviewById(reviewId);
  if (!review) {
    throw new Error("Review not found");
  }
  
  const user = await storage.getUser(userId);
  if (!user) {
    throw new Error("User not found");
  }
  
  const isHealthcare = user.clientType && [
    "Medical Clinic", 
    "Dental Practice", 
    "MedSpa", 
    "Mental Health"
  ].includes(user.clientType);
  
  const settings = isHealthcare 
    ? await storage.getHealthcareSettingsByUserId(userId)
    : null;
  
  // Generate AI reply with healthcare-specific tone if applicable
  let tone = "professional";
  let additionalContext = "";
  
  if (isHealthcare && settings) {
    tone = "empathetic";
    additionalContext = "This is a healthcare practice. Use appropriate medical terminology and be HIPAA compliant. Never acknowledge specific treatments or conditions. Thank the patient for their trust and care. Keep the response general and focused on service quality and patient experience.";
    
    if (settings.usePatientTerminology) {
      additionalContext += " Use terms like 'patient' instead of 'customer' and 'visit' instead of 'purchase'.";
    }
  }
  
  // Get the AI reply with the appropriate context and tone
  const replyText = await generateAIReply(review, tone, additionalContext);
  
  return replyText;
}

/**
 * Updates healthcare settings for a user
 * @param userId The user ID
 * @param settings The settings data to update
 * @returns The updated healthcare settings
 */
export async function updateHealthcareSettings(
  userId: number, 
  settingsData: Partial<HealthcareSettings>
): Promise<HealthcareSettings> {
  const existingSettings = await storage.getHealthcareSettingsByUserId(userId);
  
  if (existingSettings) {
    return await storage.updateHealthcareSettings(existingSettings.id, {
      ...settingsData,
      updatedAt: new Date()
    });
  } else {
    // Create new settings if they don't exist
    return await storage.createHealthcareSettings({
      userId,
      ...settingsData,
      updatedAt: new Date()
    });
  }
}

/**
 * Gets review invite analytics for a location
 * @param locationId The location ID to get analytics for
 * @param days Number of days to include in report
 * @returns Analytics data including counts and rates
 */
export async function getReviewInviteAnalytics(locationId: number, days: number = 7) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const invites = await storage.getReviewInvitesByLocationId(locationId, startDate, endDate);
  
  // Calculate metrics
  const totalSent = invites.length;
  const opened = invites.filter(invite => invite.status === "opened" || invite.status === "clicked").length;
  const clicked = invites.filter(invite => invite.status === "clicked").length;
  
  const openRate = totalSent > 0 ? opened / totalSent : 0;
  const clickRate = totalSent > 0 ? clicked / totalSent : 0;
  const conversionRate = totalSent > 0 
    ? invites.filter(invite => invite.reviewId !== null).length / totalSent 
    : 0;
  
  return {
    totalSent,
    opened,
    clicked,
    openRate,
    clickRate,
    conversionRate,
    startDate,
    endDate
  };
}