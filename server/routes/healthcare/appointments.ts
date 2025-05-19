import { Router } from 'express';
import { getTodayAppointments, markReviewRequestSent, getReviewRequestStats, pollAppointmentUpdates } from '../../services/ehr-service';

const router = Router();

/**
 * GET /api/appointments/today
 * Fetch today's appointments from DrChrono and Jane App
 */
router.get('/today', async (req, res) => {
  try {
    const userId = req.user!.id;
    const appointments = await getTodayAppointments(userId);
    
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching today\'s appointments:', error);
    res.status(500).json({ message: 'Failed to fetch appointments', error: error.message });
  }
});

/**
 * POST /api/reviews/send
 * Send a review request to a patient
 */
router.post('/send', async (req, res) => {
  try {
    const { patientId, platform = 'google' } = req.body;
    
    if (!patientId) {
      return res.status(400).json({ message: 'Patient ID is required' });
    }
    
    const updatedPatient = await markReviewRequestSent(patientId, platform);
    
    // In a real implementation, this would trigger sending an email or SMS
    // For now, we'll just mark it as sent in the database
    
    res.json({ 
      success: true, 
      message: `Review request sent to ${updatedPatient.name} for platform: ${platform}`,
      patient: updatedPatient
    });
  } catch (error) {
    console.error('Error sending review request:', error);
    res.status(500).json({ message: 'Failed to send review request', error: error.message });
  }
});

/**
 * GET /api/reviews/stats
 * Get statistics about review requests and completions
 */
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user!.id;
    const stats = await getReviewRequestStats(userId);
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching review stats:', error);
    res.status(500).json({ message: 'Failed to fetch review statistics', error: error.message });
  }
});

/**
 * POST /api/appointments/poll
 * Manually trigger appointment status polling
 */
router.post('/poll', async (req, res) => {
  try {
    const userId = req.user!.id;
    await pollAppointmentUpdates(userId);
    
    res.json({ success: true, message: 'Appointment polling completed' });
  } catch (error) {
    console.error('Error polling appointments:', error);
    res.status(500).json({ message: 'Failed to poll appointments', error: error.message });
  }
});

export default router;