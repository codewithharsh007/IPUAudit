import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `IPU Trinity <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log('Email sent successfully to:', to);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Email Templates
export const emailTemplates = {
  otp: (otp) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6; 
          color: #1f2937;
          margin: 0;
          padding: 0;
          background-color: #f3f4f6;
        }
        .wrapper {
          background-color: #f3f4f6;
          padding: 40px 20px;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header { 
          background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
          color: white; 
          padding: 40px 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .content { 
          padding: 40px 30px;
        }
        .content h2 {
          color: #1f2937;
          font-size: 22px;
          margin-top: 0;
          margin-bottom: 20px;
        }
        .otp-container {
          background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%);
          border: 2px dashed #4F46E5;
          border-radius: 10px;
          padding: 30px;
          text-align: center;
          margin: 30px 0;
        }
        .otp { 
          font-size: 40px; 
          font-weight: bold; 
          color: #4F46E5;
          letter-spacing: 8px;
          font-family: 'Courier New', monospace;
        }
        .otp-label {
          color: #6B7280;
          font-size: 14px;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .note {
          background-color: #FEF3C7;
          border-left: 4px solid #F59E0B;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .note p {
          margin: 0;
          color: #92400E;
          font-size: 14px;
        }
        .footer { 
          text-align: center; 
          padding: 30px;
          background-color: #F9FAFB;
          color: #6B7280;
          font-size: 13px;
          border-top: 1px solid #E5E7EB;
        }
        .footer p {
          margin: 5px 0;
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <h1>🎓 IPU Trinity</h1>
          </div>
          <div class="content">
            <h2>Email Verification</h2>
            <p>Thank you for registering with IPU Trinity. To complete your registration, please use the verification code below:</p>
            
            <div class="otp-container">
              <div class="otp-label">Your Verification Code</div>
              <div class="otp">${otp}</div>
            </div>
            
            <div class="note">
              <p><strong>⏱️ Important:</strong> This code is valid for 10 minutes only. Do not share this code with anyone.</p>
            </div>
            
            <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
              If you didn't request this verification code, please ignore this email or contact support if you have concerns.
            </p>
          </div>
          <div class="footer">
            <p><strong>IPU Trinity</strong></p>
            <p>&copy; ${new Date().getFullYear()} IPU Trinity. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `,

  collegeRegistrationRequest: (collegeData) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6; 
          color: #1f2937;
          margin: 0;
          padding: 0;
          background-color: #f3f4f6;
        }
        .wrapper {
          background-color: #f3f4f6;
          padding: 40px 20px;
        }
        .container { 
          max-width: 650px; 
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header { 
          background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
          color: white; 
          padding: 40px 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 26px;
          font-weight: 600;
        }
        .content { 
          padding: 40px 30px;
        }
        .info-section {
          background-color: #F9FAFB;
          border-radius: 8px;
          padding: 25px;
          margin: 25px 0;
        }
        .info-row { 
          display: flex;
          margin: 12px 0;
          padding: 8px 0;
          border-bottom: 1px solid #E5E7EB;
        }
        .info-row:last-child {
          border-bottom: none;
        }
        .label { 
          font-weight: 600;
          color: #3B82F6;
          min-width: 160px;
          flex-shrink: 0;
        }
        .value {
          color: #374151;
          flex-grow: 1;
        }
        .programs {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .program-badge {
          background-color: #DBEAFE;
          color: #1E40AF;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
        }
        .alert {
          background-color: #EFF6FF;
          border-left: 4px solid #3B82F6;
          padding: 15px;
          margin: 25px 0;
          border-radius: 4px;
        }
        .footer { 
          text-align: center; 
          padding: 30px;
          background-color: #F9FAFB;
          color: #6B7280;
          font-size: 13px;
          border-top: 1px solid #E5E7EB;
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <h1>📋 New College Registration Request</h1>
          </div>
          <div class="content">
            <p style="font-size: 16px; margin-bottom: 25px;">
              A new college has submitted a registration request and is awaiting your approval.
            </p>
            
            <div class="info-section">
              <h3 style="margin-top: 0; color: #1f2937;">College Information</h3>
              
              <div class="info-row">
                <span class="label">College Name:</span>
                <span class="value"><strong>${collegeData.collegeName}</strong></span>
              </div>
              
              <div class="info-row">
                <span class="label">Email:</span>
                <span class="value">${collegeData.email}</span>
              </div>
              
              <div class="info-row">
                <span class="label">Director Name:</span>
                <span class="value">${collegeData.directorName}</span>
              </div>
              
              <div class="info-row">
                <span class="label">Director Mobile:</span>
                <span class="value">${collegeData.directorMobile}</span>
              </div>
              
              <div class="info-row">
                <span class="label">Institute Phone:</span>
                <span class="value">${collegeData.instituteTelephone || 'N/A'}</span>
              </div>
              
              <div class="info-row">
                <span class="label">Address:</span>
                <span class="value">${collegeData.address}</span>
              </div>
              
              <div class="info-row">
                <span class="label">Established:</span>
                <span class="value">${collegeData.establishmentYear}</span>
              </div>
              
              <div class="info-row">
                <span class="label">Website:</span>
                <span class="value"><a href="${collegeData.website}" style="color: #3B82F6; text-decoration: none;">${collegeData.website}</a></span>
              </div>
              
              <div class="info-row">
                <span class="label">Programs Offered:</span>
                <div class="programs">
                  ${collegeData.programs.map(program => `<span class="program-badge">${program}</span>`).join('')}
                </div>
              </div>
            </div>
            
            <div class="alert">
              <p style="margin: 0; color: #1E40AF;">
                <strong>⚡ Action Required:</strong> Please log in to the admin dashboard to review and process this registration request.
              </p>
            </div>
          </div>
          <div class="footer">
            <p><strong>IPU Trinity Admin Portal</strong></p>
            <p>&copy; ${new Date().getFullYear()} IPU Trinity. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `,

  collegeApproved: (collegeName, email, collegeCode) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6; 
          color: #1f2937;
          margin: 0;
          padding: 0;
          background-color: #f3f4f6;
        }
        .wrapper {
          background-color: #f3f4f6;
          padding: 40px 20px;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header { 
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          color: white; 
          padding: 40px 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .success-icon {
          font-size: 64px;
          margin-bottom: 15px;
        }
        .content { 
          padding: 40px 30px;
        }
        .credentials { 
          background: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%);
          padding: 25px;
          margin: 25px 0;
          border-left: 4px solid #10B981;
          border-radius: 8px;
        }
        .credentials h3 {
          margin-top: 0;
          color: #065F46;
        }
        .credential-item {
          margin: 12px 0;
          color: #047857;
        }
        .credential-item strong {
          color: #064E3B;
        }
        .next-steps {
          background-color: #EFF6FF;
          border: 2px solid #3B82F6;
          border-radius: 8px;
          padding: 20px;
          margin: 25px 0;
        }
        .next-steps h3 {
          margin-top: 0;
          color: #1E40AF;
        }
        .next-steps ul {
          margin: 10px 0;
          padding-left: 20px;
        }
        .next-steps li {
          margin: 8px 0;
          color: #1E3A8A;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          color: white;
          padding: 14px 28px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          margin: 20px 0;
        }
        .footer { 
          text-align: center; 
          padding: 30px;
          background-color: #F9FAFB;
          color: #6B7280;
          font-size: 13px;
          border-top: 1px solid #E5E7EB;
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <div class="success-icon">🎉</div>
            <h1>Registration Approved!</h1>
          </div>
          <div class="content">
            <p style="font-size: 18px; color: #059669; font-weight: 600;">
              Congratulations, ${collegeName}!
            </p>
            <p>
              Your college registration has been successfully approved by IPU Trinity administration. 
              You can now access your college dashboard and start managing your institution's profile.
            </p>
            
            <div class="credentials">
              <h3>🔐 Your Login Credentials</h3>
              <div class="credential-item">
                <strong>Email:</strong> ${email}
              </div>
              ${collegeCode ? `
                <div class="credential-item">
                  <strong>College Code:</strong> ${collegeCode}
                </div>
              ` : ''}
              <div class="credential-item">
                <strong>Password:</strong> Use the password you created during registration
              </div>
            </div>
            
            <div class="next-steps">
              <h3>📝 Next Steps</h3>
              <ul>
                <li>Log in to your dashboard using your credentials</li>
                <li>Complete your college profile information</li>
                <li>Update your programs and course details</li>
                <li>Start managing student registrations</li>
              </ul>
            </div>
            
            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" class="button">
                Access Dashboard →
              </a>
            </div>
            
            <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
              If you have any questions or need assistance, please don't hesitate to contact our support team.
            </p>
          </div>
          <div class="footer">
            <p><strong>IPU Trinity</strong></p>
            <p>&copy; ${new Date().getFullYear()} IPU Trinity. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `,

  collegeRejected: (collegeName, reason) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6; 
          color: #1f2937;
          margin: 0;
          padding: 0;
          background-color: #f3f4f6;
        }
        .wrapper {
          background-color: #f3f4f6;
          padding: 40px 20px;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header { 
          background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
          color: white; 
          padding: 40px 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 26px;
          font-weight: 600;
        }
        .content { 
          padding: 40px 30px;
        }
        .reason-box {
          background-color: #FEF2F2;
          border-left: 4px solid #EF4444;
          padding: 20px;
          margin: 25px 0;
          border-radius: 4px;
        }
        .reason-box h3 {
          margin-top: 0;
          color: #DC2626;
        }
        .reason-box p {
          margin-bottom: 0;
          color: #991B1B;
          line-height: 1.6;
        }
        .info-box {
          background-color: #FEF3C7;
          border: 1px solid #FCD34D;
          border-radius: 8px;
          padding: 20px;
          margin: 25px 0;
        }
        .info-box h3 {
          margin-top: 0;
          color: #92400E;
        }
        .info-box ul {
          margin: 10px 0;
          padding-left: 20px;
        }
        .info-box li {
          margin: 8px 0;
          color: #78350F;
        }
        .footer { 
          text-align: center; 
          padding: 30px;
          background-color: #F9FAFB;
          color: #6B7280;
          font-size: 13px;
          border-top: 1px solid #E5E7EB;
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <h1>Registration Status Update</h1>
          </div>
          <div class="content">
            <p>Dear <strong>${collegeName}</strong>,</p>
            <p>
              Thank you for your interest in registering with IPU Trinity. After careful review, 
              we regret to inform you that your registration request could not be approved at this time.
            </p>
            
            ${reason && reason !== 'No reason provided' ? `
              <div class="reason-box">
                <h3>📋 Reason for Rejection</h3>
                <p>${reason}</p>
              </div>
            ` : ''}
            
            <div class="info-box">
              <h3>💡 What You Can Do Next</h3>
              <ul>
                <li>Review the feedback provided above</li>
                <li>Address any issues or concerns mentioned</li>
                <li>Contact our support team for clarification</li>
                <li>Reapply with updated information when ready</li>
              </ul>
            </div>
            
            <p style="margin-top: 30px;">
              We understand this may be disappointing. If you have any questions or would like 
              to discuss this decision, please don't hesitate to reach out to our administration team.
            </p>
            
            <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
              <strong>Contact Support:</strong><br>
              Email: ${process.env.ADMIN_EMAIL || 'admin@iputrinity.edu'}<br>
              We're here to help you through this process.
            </p>
          </div>
          <div class="footer">
            <p><strong>IPU Trinity</strong></p>
            <p>&copy; ${new Date().getFullYear()} IPU Trinity. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `,

  passwordChanged: (name) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6; 
          color: #1f2937;
          margin: 0;
          padding: 0;
          background-color: #f3f4f6;
        }
        .wrapper {
          background-color: #f3f4f6;
          padding: 40px 20px;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header { 
          background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
          color: white; 
          padding: 40px 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 26px;
          font-weight: 600;
        }
        .content { 
          padding: 40px 30px;
        }
        .success-box {
          background-color: #D1FAE5;
          border-left: 4px solid #10B981;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .alert { 
          background-color: #FEF3C7;
          border-left: 4px solid #F59E0B;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .alert p {
          margin: 0;
          color: #92400E;
        }
        .info-row {
          margin: 10px 0;
          color: #6B7280;
          font-size: 14px;
        }
        .footer { 
          text-align: center; 
          padding: 30px;
          background-color: #F9FAFB;
          color: #6B7280;
          font-size: 13px;
          border-top: 1px solid #E5E7EB;
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <h1>🔒 Password Changed</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${name}</strong>,</p>
            
            <div class="success-box">
              <p style="margin: 0; color: #065F46;">
                ✅ Your password has been successfully changed.
              </p>
            </div>
            
            <p>This email confirms that your account password was recently updated.</p>
            
            <div class="info-row">
              <strong>Change Date:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'short' })}
            </div>
            
            <div class="alert">
              <p><strong>🔔 Security Alert:</strong></p>
              <p style="margin-top: 8px;">
                If you did not make this change, please contact our support team immediately 
                and secure your account. Your account security is our top priority.
              </p>
            </div>
            
            <p style="margin-top: 30px; color: #6B7280; font-size: 14px;">
              If you have any questions or concerns about your account security, 
              please contact us at ${process.env.ADMIN_EMAIL || 'support@iputrinity.edu'}
            </p>
          </div>
          <div class="footer">
            <p><strong>IPU Trinity</strong></p>
            <p>&copy; ${new Date().getFullYear()} IPU Trinity. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `,
};
