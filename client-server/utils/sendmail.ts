import { supaclient } from '@/lib/supabase';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.MAIL_PORT || '587'),
    secure: false, 
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false
    }
});


export async function sendEmergencyNotifications(caseId: string): Promise<void> {
    try {
      // Fetch the case details to include in the notification
      const { data: caseData, error: caseError } = await supaclient
        .from('cases')
        .select('*')
        .eq('id', caseId)
        .single();
  
      if (caseError) {
        console.error('Error fetching case details:', caseError);
        return;
      }
  
      // Fetch all doctors from the profiles table
      const { data: doctors, error: doctorsError } = await supaclient
        .from('profiles')
        .select('email, name')
        .eq('role', 'doctor');
  
      if (doctorsError) {
        console.error('Error fetching doctors:', doctorsError);
        return;
      }
  
      if (!doctors || doctors.length === 0) {
        console.log('No doctors found to notify');
        return;
      }
  
      // Base URL for your application
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const caseUrl = `${baseUrl}/case?caseid=${caseId}`;
  
      // Send email to each doctor
      for (const doctor of doctors) {
        const mailOptions = {
          from: process.env.MAIL_FROM || 'notifications@snapaid.com',
          to: doctor.email,
          subject: '🚨 EMERGENCY: Immediate Attention Required',
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8f8f8;">
              <div style="background-color: #ff4d4d; color: white; padding: 10px 20px; border-radius: 5px;">
                <h2>🚨 EMERGENCY ALERT</h2>
              </div>
              <div style="background-color: white; padding: 20px; border-radius: 5px; margin-top: 10px;">
                <p>Dear Dr. ${doctor.name || 'Doctor'},</p>
                <p>A case has been identified as requiring <strong>EMERGENCY</strong> attention.</p>
                <p><strong>Case ID:</strong> ${caseId}</p>
                <p><strong>Created on:</strong> ${new Date(caseData.created_at).toLocaleString()}</p>
                <p><strong>Patient Input:</strong> ${caseData.input_text.substring(0, 100)}${caseData.input_text.length > 100 ? '...' : ''}</p>
                <p>Please review this case immediately.</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${caseUrl}" style="background-color: #ff4d4d; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    View Case Now
                  </a>
                </div>
                <p>This is an automated notification from the SnapAid Emergency Response System.</p>
              </div>
            </div>
          `
        };
  
        try {
          await transporter.sendMail(mailOptions);
          console.log(`Emergency notification sent to ${doctor.email}`);
        } catch (emailError) {
          console.error(`Failed to send notification to ${doctor.email}:`, emailError);
        }
      }
    } catch (error) {
      console.error('Error sending emergency notifications:', error);
    }
  }