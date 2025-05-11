import { storage } from '../storage';
import sgMail from '@sendgrid/mail';
import axios from 'axios';

// Set up SendGrid for email
const setupSendgrid = () => {
  if (!process.env.SENDGRID_API_KEY) {
    throw new Error('SENDGRID_API_KEY environment variable is not set');
  }
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
};

// Set up Twilio for SMS
const getTwilioClient = () => {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    throw new Error('Twilio credentials not set in environment variables');
  }
  
  return {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
  };
};

/**
 * Sends an email review request
 * 
 * @param to - Recipient email address
 * @param customerName - Customer name
 * @param businessName - Business name
 * @param reviewLink - Link to leave a review
 * @param template - Email template content
 * @returns Promise with send result
 */
export async function sendEmailReviewRequest(
  to: string,
  customerName: string,
  businessName: string,
  reviewLink: string,
  template: string
) {
  try {
    setupSendgrid();
    
    // Replace template variables
    const emailContent = template
      .replace(/{{customerName}}/g, customerName)
      .replace(/{{businessName}}/g, businessName)
      .replace(/{{reviewLink}}/g, reviewLink);
    
    const msg = {
      to,
      from: process.env.EMAIL_FROM || 'noreply@repuradar.com',
      subject: `We value your feedback - ${businessName}`,
      text: emailContent.replace(/<[^>]*>/g, ''), // Strip HTML for plain text
      html: emailContent,
    };
    
    const result = await sgMail.send(msg);
    return { success: true, result };
  } catch (error) {
    console.error('Error sending email review request:', error);
    return { success: false, error };
  }
}

/**
 * Sends an SMS review request
 * 
 * @param to - Recipient phone number
 * @param customerName - Customer name
 * @param businessName - Business name
 * @param reviewLink - Link to leave a review
 * @returns Promise with send result
 */
export async function sendSmsReviewRequest(
  to: string,
  customerName: string,
  businessName: string,
  reviewLink: string
) {
  try {
    const twilioClient = getTwilioClient();
    
    // Create simple SMS message
    const message = `Hi ${customerName}, thank you for choosing ${businessName}! We'd love to hear your feedback. Please leave a review at: ${reviewLink}`;
    
    // Make request to Twilio API
    const response = await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioClient.accountSid}/Messages.json`,
      new URLSearchParams({
        To: to,
        From: twilioClient.phoneNumber,
        Body: message,
      }),
      {
        auth: {
          username: twilioClient.accountSid,
          password: twilioClient.authToken,
        },
      }
    );
    
    return { success: true, result: response.data };
  } catch (error) {
    console.error('Error sending SMS review request:', error);
    return { success: false, error };
  }
}

/**
 * Processes a review request
 * 
 * @param requestId - ID of the review request to process
 * @returns Promise with processing result
 */
export async function processReviewRequest(requestId: number) {
  try {
    // Get request details
    const request = await storage.getReviewRequest(requestId);
    if (!request) {
      throw new Error(`Review request with ID ${requestId} not found`);
    }
    
    // Get user and location details
    const user = await storage.getUser(request.userId);
    if (!user) {
      throw new Error(`User with ID ${request.userId} not found`);
    }
    
    let locationName = user.fullName;
    let reviewLink = '';
    
    // Get location details if provided
    if (request.locationId) {
      const location = await storage.getLocation(request.locationId);
      if (location) {
        locationName = location.name;
        
        // Use Google Place ID if available
        if (location.googlePlaceId) {
          reviewLink = `https://search.google.com/local/writereview?placeid=${location.googlePlaceId}`;
        } else if (location.yelpBusinessId) {
          reviewLink = `https://www.yelp.com/writeareview/biz/${location.yelpBusinessId}`;
        }
      }
    }
    
    // Default review link if none set from location
    if (!reviewLink) {
      reviewLink = `https://www.google.com/search?q=${encodeURIComponent(locationName)}`;
    }
    
    // Get template if provided
    let templateContent = 
      `<p>Hi {{customerName}},</p>
       <p>Thank you for choosing {{businessName}}! We'd love to hear your feedback.</p>
       <p>Please take a moment to <a href="{{reviewLink}}">leave us a review</a>.</p>
       <p>We appreciate your time.</p>
       <p>Best regards,<br/>{{businessName}}</p>`;
    
    if (request.templateId) {
      const template = await storage.getReviewTemplate(request.templateId);
      if (template) {
        templateContent = template.content;
      }
    }
    
    let result;
    
    // Send based on contact info
    if (request.customerEmail) {
      result = await sendEmailReviewRequest(
        request.customerEmail,
        request.customerName,
        locationName,
        reviewLink,
        templateContent
      );
    } else if (request.customerPhone) {
      result = await sendSmsReviewRequest(
        request.customerPhone,
        request.customerName,
        locationName,
        reviewLink
      );
    } else {
      throw new Error('Review request lacks contact information (email or phone)');
    }
    
    // Update request status
    await storage.updateReviewRequest(requestId, {
      status: result.success ? 'sent' : 'failed',
      sentAt: result.success ? new Date() : undefined,
    });
    
    return { success: result.success, request, result };
  } catch (error) {
    console.error('Error processing review request:', error);
    
    // Update request status to failed
    try {
      await storage.updateReviewRequest(requestId, {
        status: 'failed',
      });
    } catch (updateError) {
      console.error('Error updating review request status:', updateError);
    }
    
    return { success: false, error };
  }
}