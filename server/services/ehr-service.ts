// EHR integration service for DrChrono and Jane App
import axios from 'axios';
import { Patient, patients } from '@shared/schema';
import { db } from '../db';
import { eq, and, gte, lte } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid'; 

// Initialize EHR API clients
const drchronoClient = axios.create({
  baseURL: 'https://drchrono.com/api',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.DRCHRONO_API_TOKEN}`
  }
});

const janeAppClient = axios.create({
  baseURL: 'https://api.jane.app/v1',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.JANEAPP_API_TOKEN}`
  }
});

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

// Mock data for demonstration purposes, to be replaced with actual API calls
const mockAppointments: Appointment[] = [
  {
    id: '12345',
    patient: {
      id: 'p-12345',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '555-123-4567'
    },
    ehrSource: 'drchrono',
    appointmentTime: new Date(new Date().setHours(10, 0, 0, 0)), // Today at 10 AM
    providerId: 'dr-123',
    providerName: 'Dr. Peterson',
    status: 'completed',
    locationId: 4,
    metadata: {
      appointmentType: 'Consultation',
      notes: 'Initial consultation for skin treatment',
      duration: 30
    }
  },
  {
    id: '12346',
    patient: {
      id: 'p-12346',
      name: 'Michael Johnson',
      email: 'michael.johnson@example.com',
      phone: '555-234-5678'
    },
    ehrSource: 'drchrono',
    appointmentTime: new Date(new Date().setHours(11, 30, 0, 0)), // Today at 11:30 AM
    providerId: 'dr-456',
    providerName: 'Dr. Garcia',
    status: 'in_progress',
    locationId: 4,
    metadata: {
      appointmentType: 'Follow-up',
      notes: 'Follow-up visit for previous treatment',
      duration: 20
    }
  },
  {
    id: '12347',
    patient: {
      id: 'p-12347',
      name: 'Sarah Williams',
      email: 'sarah.williams@example.com',
      phone: '555-345-6789'
    },
    ehrSource: 'janeapp',
    appointmentTime: new Date(new Date().setHours(14, 0, 0, 0)), // Today at 2 PM
    providerId: 'dr-789',
    providerName: 'Dr. Thomas',
    status: 'scheduled',
    locationId: 5,
    metadata: {
      appointmentType: 'Treatment',
      notes: 'Scheduled treatment session',
      duration: 45
    }
  },
  {
    id: '12348',
    patient: {
      id: 'p-12348',
      name: 'Robert Brown',
      email: 'robert.brown@example.com',
      phone: '555-456-7890'
    },
    ehrSource: 'janeapp',
    appointmentTime: new Date(new Date().setHours(15, 30, 0, 0)), // Today at 3:30 PM
    providerId: 'dr-123',
    providerName: 'Dr. Peterson',
    status: 'completed',
    locationId: 5,
    metadata: {
      appointmentType: 'Evaluation',
      notes: 'Completed evaluation session',
      duration: 40
    }
  }
];

/**
 * Get appointments for a specific date range from DrChrono
 */
async function getDrChronoAppointments(userId: number, startDate: Date, endDate: Date): Promise<Appointment[]> {
  try {
    // In a real implementation, this would make an actual API call to DrChrono
    // const response = await drchronoClient.get('/appointments', {
    //   params: {
    //     date_range: `${startDate.toISOString()}/${endDate.toISOString()}`,
    //     status: 'Arrived,In Session,Complete'
    //   }
    // });
    
    // Filter mock data instead for demo purposes
    const filteredAppointments = mockAppointments.filter(apt => 
      apt.ehrSource === 'drchrono' && 
      apt.appointmentTime >= startDate && 
      apt.appointmentTime <= endDate
    );
    
    return filteredAppointments;
  } catch (error) {
    console.error('Error fetching DrChrono appointments:', error);
    throw error;
  }
}

/**
 * Get appointments for a specific date range from Jane App
 */
async function getJaneAppAppointments(userId: number, startDate: Date, endDate: Date): Promise<Appointment[]> {
  try {
    // In a real implementation, this would make an actual API call to Jane App
    // const response = await janeAppClient.get('/appointments', {
    //   params: {
    //     start_date: startDate.toISOString(),
    //     end_date: endDate.toISOString(),
    //     status: 'ARRIVED,IN_PROGRESS,COMPLETED'
    //   }
    // });
    
    // Filter mock data instead for demo purposes
    const filteredAppointments = mockAppointments.filter(apt => 
      apt.ehrSource === 'janeapp' && 
      apt.appointmentTime >= startDate && 
      apt.appointmentTime <= endDate
    );
    
    return filteredAppointments;
  } catch (error) {
    console.error('Error fetching Jane App appointments:', error);
    throw error;
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
  
  try {
    const [drchronoAppts, janeAppAppts] = await Promise.all([
      getDrChronoAppointments(userId, today, tomorrow),
      getJaneAppAppointments(userId, today, tomorrow)
    ]);
    
    return [...drchronoAppts, ...janeAppAppts];
  } catch (error) {
    console.error('Error fetching today\'s appointments:', error);
    throw error;
  }
}

/**
 * Store appointment and patient data in our database
 */
export async function syncAppointmentsToDatabase(userId: number, appointments: Appointment[]): Promise<void> {
  try {
    for (const appointment of appointments) {
      // Check if patient already exists in our database
      const existingPatients = await db.select().from(patients).where(
        and(
          eq(patients.externalId, appointment.patient.id),
          eq(patients.ehrSource, appointment.ehrSource)
        )
      );
      
      if (existingPatients.length === 0) {
        // Create new patient record
        await db.insert(patients).values({
          id: uuidv4(),
          userId: userId,
          locationId: appointment.locationId,
          name: appointment.patient.name,
          email: appointment.patient.email,
          phone: appointment.patient.phone,
          ehrSource: appointment.ehrSource,
          externalId: appointment.patient.id,
          appointmentTime: appointment.appointmentTime,
          appointmentCompleted: appointment.status === 'completed',
          metadata: appointment.metadata || {}
        });
      } else {
        // Update existing patient with latest appointment
        await db.update(patients)
          .set({
            appointmentTime: appointment.appointmentTime,
            appointmentCompleted: appointment.status === 'completed',
            locationId: appointment.locationId,
            metadata: appointment.metadata || {},
            updatedAt: new Date()
          })
          .where(eq(patients.id, existingPatients[0].id));
      }
    }
  } catch (error) {
    console.error('Error syncing appointments to database:', error);
    throw error;
  }
}

/**
 * Find appointments that were completed but no review request has been sent yet
 */
export async function findCompletedAppointmentsWithoutReviewRequest(userId: number): Promise<Patient[]> {
  try {
    const patientsToRequest = await db.select().from(patients).where(
      and(
        eq(patients.userId, userId),
        eq(patients.appointmentCompleted, true),
        eq(patients.reviewSent, false)
      )
    );
    
    return patientsToRequest;
  } catch (error) {
    console.error('Error finding completed appointments:', error);
    throw error;
  }
}

/**
 * Mark patient as having a review request sent
 */
export async function markReviewRequestSent(patientId: string, platform: string): Promise<Patient> {
  try {
    const [updatedPatient] = await db.update(patients)
      .set({
        reviewSent: true,
        reviewSentAt: new Date(),
        reviewPlatform: platform,
        updatedAt: new Date()
      })
      .where(eq(patients.id, patientId))
      .returning();
    
    return updatedPatient;
  } catch (error) {
    console.error('Error marking review request as sent:', error);
    throw error;
  }
}

/**
 * Poll EHR systems for appointment status updates
 */
export async function pollAppointmentUpdates(userId: number): Promise<void> {
  try {
    const appointments = await getTodayAppointments(userId);
    await syncAppointmentsToDatabase(userId, appointments);
    
    // Find completed appointments needing review requests
    const patientsToRequest = await findCompletedAppointmentsWithoutReviewRequest(userId);
    
    console.log(`Found ${patientsToRequest.length} patients needing review requests`);
    
    // In a real system, this would trigger the review request sending process
    // For now, just log that we found patients that need requests
    return;
  } catch (error) {
    console.error('Error polling for appointment updates:', error);
    throw error;
  }
}

/**
 * Get review request statistics for a user
 */
export async function getReviewRequestStats(userId: number): Promise<any> {
  try {
    // Get total patients
    const allPatients = await db.select().from(patients).where(eq(patients.userId, userId));
    
    // Get patients with sent review requests
    const sentRequests = allPatients.filter(p => p.reviewSent);
    
    // Get patients with completed reviews
    const completedReviews = allPatients.filter(p => p.reviewCompleted);
    
    // Calculate average rating
    const totalRating = completedReviews.reduce((sum, patient) => sum + (patient.rating || 0), 0);
    const averageRating = completedReviews.length > 0 ? totalRating / completedReviews.length : 0;
    
    // Count reviews by platform
    const reviewsByPlatform: Record<string, number> = {};
    for (const patient of completedReviews) {
      if (patient.reviewPlatform) {
        reviewsByPlatform[patient.reviewPlatform] = (reviewsByPlatform[patient.reviewPlatform] || 0) + 1;
      }
    }
    
    return {
      totalAppointments: allPatients.length,
      totalSent: sentRequests.length,
      totalCompleted: completedReviews.length,
      completionRate: sentRequests.length > 0 ? (completedReviews.length / sentRequests.length) * 100 : 0,
      averageRating,
      reviewsByPlatform
    };
  } catch (error) {
    console.error('Error getting review request stats:', error);
    throw error;
  }
}