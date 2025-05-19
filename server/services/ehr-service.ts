import { db } from '../db';
import { patients, users, healthcareSettings } from '@shared/schema';
import { eq, and, isNull, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export interface Appointment {
  id: string;
  patient: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  ehrSource: 'drchrono' | 'janeapp';
  appointmentTime: Date;
  providerId: string;
  providerName: string;
  status: string;
  locationId?: number;
  metadata?: Record<string, any>;
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  ehrId: string;
  ehrSource: string;
  lastAppointment?: Date;
  reviewRequestSent?: Date;
  reviewCompleted?: boolean;
  rating?: number;
  locationId?: number;
  userId: number;
}

/**
 * Get appointments for a specific date range from DrChrono
 */
async function getDrChronoAppointments(userId: number, startDate: Date, endDate: Date): Promise<Appointment[]> {
  // In a real implementation, this would make API calls to DrChrono
  // For the prototype, we'll return sample data
  
  const userSettings = await getUserHealthcareSettings(userId);
  if (!userSettings?.drchronoEnabled) {
    return [];
  }
  
  const locationId = userSettings.primaryLocationId || undefined;
  
  // Get current time to determine if appointment is in the past
  const now = new Date();
  
  return [
    {
      id: uuidv4(),
      patient: {
        id: uuidv4(),
        name: 'John Smith',
        email: 'john.smith@example.com',
        phone: '555-123-4567'
      },
      ehrSource: 'drchrono',
      appointmentTime: new Date(now.getTime() - 60 * 60 * 1000), // 1 hour ago
      providerId: 'dr-1',
      providerName: 'Dr. James Johnson',
      status: 'Complete',
      locationId: locationId,
      metadata: {
        appointmentType: 'Follow-up',
        duration: 30,
        notes: 'Patient reported improvement with current treatment.'
      }
    },
    {
      id: uuidv4(),
      patient: {
        id: uuidv4(),
        name: 'Emily Davis',
        email: 'emily.davis@example.com',
        phone: '555-987-6543'
      },
      ehrSource: 'drchrono',
      appointmentTime: new Date(now.getTime() + 30 * 60 * 1000), // 30 minutes from now
      providerId: 'dr-2',
      providerName: 'Dr. Sarah Williams',
      status: 'Confirmed',
      locationId: locationId,
      metadata: {
        appointmentType: 'New Patient',
        duration: 45,
        notes: 'Initial consultation'
      }
    }
  ];
}

/**
 * Get appointments for a specific date range from Jane App
 */
async function getJaneAppAppointments(userId: number, startDate: Date, endDate: Date): Promise<Appointment[]> {
  // In a real implementation, this would make API calls to Jane App
  // For the prototype, we'll return sample data
  
  const userSettings = await getUserHealthcareSettings(userId);
  if (!userSettings?.janeappEnabled) {
    return [];
  }
  
  const locationId = userSettings.primaryLocationId || undefined;
  
  // Get current time to determine if appointment is in the past
  const now = new Date();
  
  return [
    {
      id: uuidv4(),
      patient: {
        id: uuidv4(),
        name: 'Michael Brown',
        email: 'michael.brown@example.com',
        phone: '555-222-3333'
      },
      ehrSource: 'janeapp',
      appointmentTime: new Date(now.getTime() - 30 * 60 * 1000), // 30 minutes ago
      providerId: 'dr-3',
      providerName: 'Dr. Robert Miller',
      status: 'Complete',
      locationId: locationId,
      metadata: {
        appointmentType: 'Physical Therapy',
        duration: 60,
        notes: 'Patient completed all exercises successfully.'
      }
    },
    {
      id: uuidv4(),
      patient: {
        id: uuidv4(),
        name: 'Jennifer Wilson',
        email: 'jennifer.wilson@example.com',
        phone: '555-444-5555'
      },
      ehrSource: 'janeapp',
      appointmentTime: new Date(now.getTime() + 60 * 60 * 1000), // 1 hour from now
      providerId: 'dr-4',
      providerName: 'Dr. Lisa Taylor',
      status: 'Confirmed',
      locationId: locationId,
      metadata: {
        appointmentType: 'Massage Therapy',
        duration: 45,
        notes: 'Focus on lower back pain'
      }
    }
  ];
}

/**
 * Get user's healthcare integration settings
 */
async function getUserHealthcareSettings(userId: number) {
  try {
    const [settings] = await db
      .select()
      .from(healthcareSettings)
      .where(eq(healthcareSettings.userId, userId));
    
    return settings;
  } catch (error) {
    console.error('Error fetching healthcare settings:', error);
    return null;
  }
}

/**
 * Get all appointments for today from all integrated EHR sources
 */
export async function getTodayAppointments(userId: number): Promise<Appointment[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Fetch appointments from all integrated EHR systems
  const [drChronoAppointments, janeAppAppointments] = await Promise.all([
    getDrChronoAppointments(userId, today, tomorrow),
    getJaneAppAppointments(userId, today, tomorrow)
  ]);
  
  // Combine appointments from all sources
  const allAppointments = [...drChronoAppointments, ...janeAppAppointments];
  
  // Store appointments in database for future reference
  await syncAppointmentsToDatabase(userId, allAppointments);
  
  return allAppointments;
}

/**
 * Store appointment and patient data in our database
 */
export async function syncAppointmentsToDatabase(userId: number, appointments: Appointment[]): Promise<void> {
  try {
    for (const appointment of appointments) {
      // Check if patient already exists
      const [existingPatient] = await db
        .select()
        .from(patients)
        .where(
          and(
            eq(patients.ehrId, appointment.patient.id),
            eq(patients.userId, userId)
          )
        );
      
      if (existingPatient) {
        // Update existing patient record
        await db
          .update(patients)
          .set({
            name: appointment.patient.name,
            email: appointment.patient.email,
            phone: appointment.patient.phone,
            lastAppointment: appointment.appointmentTime,
            locationId: appointment.locationId
          })
          .where(eq(patients.id, existingPatient.id));
      } else {
        // Create new patient record
        await db
          .insert(patients)
          .values({
            id: uuidv4(),
            name: appointment.patient.name,
            email: appointment.patient.email,
            phone: appointment.patient.phone,
            ehrId: appointment.patient.id,
            ehrSource: appointment.ehrSource,
            lastAppointment: appointment.appointmentTime,
            locationId: appointment.locationId,
            userId: userId
          });
      }
    }
  } catch (error) {
    console.error('Error syncing appointments to database:', error);
  }
}

/**
 * Find appointments that were completed but no review request has been sent yet
 */
export async function findCompletedAppointmentsWithoutReviewRequest(userId: number): Promise<Patient[]> {
  try {
    const results = await db
      .select()
      .from(patients)
      .where(
        and(
          eq(patients.userId, userId),
          sql`patients.last_appointment < NOW()`,
          isNull(patients.reviewRequestSent)
        )
      );
    
    return results;
  } catch (error) {
    console.error('Error finding completed appointments:', error);
    return [];
  }
}

/**
 * Mark patient as having a review request sent
 */
export async function markReviewRequestSent(patientId: string, platform: string): Promise<Patient> {
  try {
    const [updatedPatient] = await db
      .update(patients)
      .set({
        reviewRequestSent: new Date(),
        reviewPlatform: platform
      })
      .where(eq(patients.id, patientId))
      .returning();
    
    return updatedPatient;
  } catch (error) {
    console.error('Error marking review request sent:', error);
    throw new Error('Failed to update patient record');
  }
}

/**
 * Poll EHR systems for appointment status updates
 */
export async function pollAppointmentUpdates(userId: number): Promise<void> {
  try {
    // Get today's appointments to ensure we have the latest data
    await getTodayAppointments(userId);
    
    // Find patients who have completed appointments but no review request sent
    const patientsNeedingReviews = await findCompletedAppointmentsWithoutReviewRequest(userId);
    
    // In a real implementation, this would trigger sending review requests
    // For the prototype, we'll just log the patients that would receive requests
    console.log(`Found ${patientsNeedingReviews.length} patients needing review requests`);
    
    // For demo purposes, we'll mark the first patient as having received a review request
    if (patientsNeedingReviews.length > 0) {
      await markReviewRequestSent(patientsNeedingReviews[0].id, 'google');
    }
  } catch (error) {
    console.error('Error polling appointment updates:', error);
  }
}

/**
 * Get review request statistics for a user
 */
export async function getReviewRequestStats(userId: number): Promise<any> {
  try {
    const totalPatients = await db
      .select({ count: sql<number>`count(*)` })
      .from(patients)
      .where(eq(patients.userId, userId));
    
    const requestsSent = await db
      .select({ count: sql<number>`count(*)` })
      .from(patients)
      .where(
        and(
          eq(patients.userId, userId),
          sql`patients.review_request_sent IS NOT NULL`
        )
      );
    
    const reviewsCompleted = await db
      .select({ count: sql<number>`count(*)` })
      .from(patients)
      .where(
        and(
          eq(patients.userId, userId),
          eq(patients.reviewCompleted, true)
        )
      );
    
    const conversionRate = requestsSent[0].count > 0 
      ? (reviewsCompleted[0].count / requestsSent[0].count) * 100 
      : 0;
    
    return {
      totalPatients: totalPatients[0].count,
      requestsSent: requestsSent[0].count,
      reviewsCompleted: reviewsCompleted[0].count,
      conversionRate: Math.round(conversionRate * 10) / 10
    };
  } catch (error) {
    console.error('Error fetching review request stats:', error);
    return {
      totalPatients: 0,
      requestsSent: 0,
      reviewsCompleted: 0,
      conversionRate: 0
    };
  }
}

// Set up a scheduled job to poll appointments regularly
// For a real implementation, this would use a cron library
// For the prototype, we'll just demonstrate the concept
export function startAppointmentPolling() {
  // In a real implementation, this would run on a schedule using a job scheduler
  console.log('Starting appointment polling service');
  
  // Poll every active healthcare user's appointments
  async function pollAllUsers() {
    try {
      const healthcareUsers = await db
        .select({
          userId: healthcareSettings.userId
        })
        .from(healthcareSettings)
        .where(
          sql`healthcare_settings.drchrono_enabled = true OR healthcare_settings.janeapp_enabled = true`
        );
      
      for (const user of healthcareUsers) {
        await pollAppointmentUpdates(user.userId);
      }
    } catch (error) {
      console.error('Error in scheduled appointment polling:', error);
    }
  }
  
  // For demonstration purposes, we'll run this once at startup
  // In a real implementation, this would be scheduled to run periodically
  setTimeout(pollAllUsers, 10000); // Run 10 seconds after server starts
}