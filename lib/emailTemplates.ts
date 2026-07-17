export const generateVerificationEmailHtml = (otp: string): string => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify your PlaySphere account</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        background-color: #f9f9f9;
        margin: 0;
        padding: 0;
      }
      .container {
        max-w-width: 600px;
        margin: 40px auto;
        background-color: #ffffff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        border: 1px solid #eaeaea;
      }
      .header {
        background-color: #000000;
        padding: 24px;
        text-align: center;
      }
      .header h1 {
        color: #ffffff;
        margin: 0;
        font-size: 24px;
        font-weight: 800;
        letter-spacing: -0.5px;
      }
      .header h1 span {
        color: #22C55E; /* Tailwind lime-500 */
      }
      .content {
        padding: 32px 24px;
        color: #333333;
        line-height: 1.6;
      }
      .content h2 {
        font-size: 20px;
        margin-top: 0;
        color: #111111;
      }
      .otp-container {
        background-color: #f4f4f5;
        border-radius: 8px;
        padding: 24px;
        text-align: center;
        margin: 24px 0;
        border: 1px dashed #d4d4d8;
      }
      .otp-code {
        font-size: 32px;
        font-weight: 700;
        letter-spacing: 6px;
        color: #000000;
        margin: 0;
      }
      .warning {
        font-size: 13px;
        color: #71717a;
        margin-top: 24px;
      }
      .footer {
        background-color: #fafafa;
        padding: 24px;
        text-align: center;
        border-top: 1px solid #eaeaea;
        font-size: 12px;
        color: #a1a1aa;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Play<span>Sphere</span></h1>
      </div>
      <div class="content">
        <h2>Welcome to PlaySphere!</h2>
        <p>Thank you for registering. To complete your secure account setup, please use the verification code below.</p>
        
        <div class="otp-container">
          <p class="otp-code">${otp}</p>
        </div>
        
        <p><strong>This code expires in exactly 5 minutes.</strong></p>
        <p>Never ask the user to share this code. Our staff will never ask for your password or OTP.</p>
        
        <p class="warning">
          If you didn't attempt to register for a PlaySphere account, you can safely ignore this email.
        </p>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} PlaySphere Inc. All rights reserved.<br>
        Support: support@playsphere.space
      </div>
    </div>
  </body>
  </html>
  `;
};

export const generatePasswordResetEmailHtml = (resetLink: string): string => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset your PlaySphere password</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        background-color: #f9f9f9;
        margin: 0;
        padding: 0;
      }
      .container {
        max-w-width: 600px;
        margin: 40px auto;
        background-color: #ffffff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        border: 1px solid #eaeaea;
      }
      .header {
        background-color: #000000;
        padding: 24px;
        text-align: center;
      }
      .header h1 {
        color: #ffffff;
        margin: 0;
        font-size: 24px;
        font-weight: 800;
        letter-spacing: -0.5px;
      }
      .header h1 span {
        color: #22C55E;
      }
      .content {
        padding: 32px 24px;
        color: #333333;
        line-height: 1.6;
      }
      .content h2 {
        font-size: 20px;
        margin-top: 0;
        color: #111111;
      }
      .btn-container {
        text-align: center;
        margin: 32px 0;
      }
      .btn {
        background-color: #22C55E;
        color: #000000;
        font-weight: bold;
        text-decoration: none;
        padding: 16px 32px;
        border-radius: 8px;
        display: inline-block;
      }
      .warning {
        font-size: 13px;
        color: #71717a;
        margin-top: 24px;
      }
      .footer {
        background-color: #fafafa;
        padding: 24px;
        text-align: center;
        border-top: 1px solid #eaeaea;
        font-size: 12px;
        color: #a1a1aa;
      }
      .break-all {
        word-break: break-all;
        font-size: 12px;
        color: #888;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Play<span>Sphere</span></h1>
      </div>
      <div class="content">
        <h2>Reset Your Password</h2>
        <p>We received a request to reset the password for your PlaySphere account. Click the button below to choose a new password.</p>
        
        <div class="btn-container">
          <a href="${resetLink}" class="btn">Reset Password</a>
        </div>
        
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p class="break-all">${resetLink}</p>
        
        <p class="warning">
          If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
        </p>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} PlaySphere Inc. All rights reserved.<br>
        Support: support@playsphere.space
      </div>
    </div>
  </body>
  </html>
  `;
};
