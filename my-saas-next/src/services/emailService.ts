// src/services/emailService.ts
// Centralized Email Service using Resend

import { inngest } from '@/lib/inngest/client';

const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';

export const EmailService = {
  /**
   * Helper queue function
   */
  async queueEmail(to: string, subject: string, html: string, text?: string) {
    await inngest.send({
      name: "email/send",
      data: {
        to,
        subject,
        html,
        from: fromEmail
      }
    });
    return { success: true, queued: true };
  },

  /**
   * Send welcome email after registration
   */
  async sendWelcomeEmail(to: string, name: string, teamName?: string) {
    return this.queueEmail(
      to,
      '🎉 Selamat Datang di Business Operating System!',
      this.getWelcomeEmailTemplate(name, teamName)
    );
  },

  /**
   * Send verification email
   */
  async sendVerificationEmail(to: string, name: string, token: string) {
    const verifyUrl = `${appUrl}/auth/verify-email?token=${token}`;
    return this.queueEmail(
      to,
      '🔒 Verifikasi Email - Business Operating System',
      `
          <h1>Verifikasi Email Anda</h1>
          <p>Halo ${name},</p>
          <p>Silakan klik link berikut untuk memverifikasi email Anda:</p>
          <a href="${verifyUrl}">Verifikasi Email</a>
        `
    );
  },

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(to: string, name: string, resetToken: string) {
    const resetUrl = `${appUrl}/auth/reset-password?token=${resetToken}`;
    return this.queueEmail(
      to,
      '🔐 Reset Password - Business Operating System',
      this.getPasswordResetTemplate(name, resetUrl)
    );
  },

  /**
   * Send team invitation email
   */
  async sendInvitationEmail(to: string, inviterName: string, teamName: string, role: string, inviteToken: string) {
    const inviteUrl = `${appUrl}/auth/register-invite?token=${inviteToken}`;
    return this.queueEmail(
      to,
      `📬 Undangan untuk bergabung dengan ${teamName}`,
      this.getInvitationTemplate(inviterName, teamName, role, inviteUrl)
    );
  },

  /**
   * Send CEO Digest email
   */
  async sendCEODigestEmail(to: string, ownerName: string, digestContent: string, teamName: string) {
    return this.queueEmail(
      to,
      `📊 CEO Digest - ${new Date().toLocaleDateString('id-ID')}`,
      this.getCEODigestTemplate(ownerName, digestContent, teamName)
    );
  },

  /**
   * Send billing notification
   */
  async sendBillingNotification(to: string, name: string, subject: string, message: string) {
    return this.queueEmail(
      to,
      `💳 ${subject}`,
      this.getBillingTemplate(name, message)
    );
  },

  // ==================== EMAIL TEMPLATES ====================

  getWelcomeEmailTemplate(name: string, teamName?: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to BOS</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Selamat Datang!</h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
    <h2 style="color: #333; margin-top: 0;">Halo ${name}!</h2>
    
    <p>Selamat datang di <strong>Business Operating System</strong>${teamName ? ` untuk <strong>${teamName}</strong>` : ''}.</p>
    
    <p>Anda sekarang memiliki akses ke:</p>
    
    <ul style="background: #f8f9fa; padding: 20px; border-radius: 8px; list-style: none; margin: 20px 0;">
      <li style="margin: 10px 0;">🤖 <strong>AI Assistant</strong> dengan RAG Knowledge Base</li>
      <li style="margin: 10px 0;">📊 <strong>CEO Digest</strong> - Ringkasan bisnis harian</li>
      <li style="margin: 10px 0;">🔒 <strong>Multi-tenancy</strong> yang aman</li>
      <li style="margin: 10px 0;">💳 <strong>Billing otomatis</strong> dan transparan</li>
    </ul>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${appUrl}/dashboard" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Mulai Sekarang</a>
    </div>
    
    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
    
    <p style="color: #666; font-size: 14px; margin: 0;">Butuh bantuan? Hubungi kami atau baca <a href="${appUrl}/docs" style="color: #667eea;">dokumentasi</a>.</p>
  </div>
</body>
</html>
    `.trim();
  },

  getPasswordResetTemplate(name: string, resetUrl: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Password</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-radius: 10px;">
    <h2 style="color: #333; margin-top: 0;">🔐 Reset Password</h2>
    
    <p>Halo ${name},</p>
    
    <p>Anda meminta untuk reset password akun Business Operating System Anda.</p>
    
    <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <strong>⚠️ Perhatian:</strong> Link ini hanya berlaku selama <strong>1 jam</strong>.
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" style="background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Reset Password Sekarang</a>
    </div>
    
    <p style="color: #666; font-size: 14px;">Jika Anda tidak meminta reset password, abaikan email ini. Password Anda tetap aman.</p>
    
    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
    
    <p style="color: #999; font-size: 12px;">Atau copy paste link berikut ke browser Anda:<br><a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a></p>
  </div>
</body>
</html>
    `.trim();
  },

  getInvitationTemplate(inviterName: string, teamName: string, role: string, inviteUrl: string): string {
    const roleEmoji = role === 'ADMIN' ? '👑' : role === 'MANAGER' ? '🔧' : '👤';

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0;">
  <title>Team Invitation</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-radius: 10px;">
    <h2 style="color: #333; margin-top: 0;">📬 Undangan Tim</h2>
    
    <p>Halo!</p>
    
    <p><strong>${inviterName}</strong> mengundang Anda untuk bergabung dengan tim <strong>${teamName}</strong> di Business Operating System.</p>
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
      <p style="margin: 0; font-size: 18px;">Role Anda: ${roleEmoji} <strong>${role}</strong></p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${inviteUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Terima Undangan</a>
    </div>
    
    <p style="color: #666; font-size: 14px;">Undangan ini berlaku selama <strong>7 hari</strong>.</p>
  </div>
</body>
</html>
    `.trim();
  },

  getCEODigestTemplate(ownerName: string, digestContent: string, teamName: string): string {
    // Convert plain text digest to HTML (preserve WhatsApp-style formatting)
    const htmlContent = digestContent
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CEO Digest</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">📊 CEO Digest</h1>
    <p style="color: #e0e0e0; margin: 5px 0 0 0; font-size: 14px;">${teamName}</p>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
    <p>Halo ${ownerName},</p>
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; font-family: monospace; font-size: 14px; white-space: pre-wrap;">
${htmlContent}
    </div>
    
    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
    
    <p style="color: #999; font-size: 12px; font-style: italic;">Digest ini dibuat otomatis oleh BusinessOS AI berdasarkan data bisnis Anda.</p>
  </div>
</body>
</html>
    `.trim();
  },

  getBillingTemplate(name: string, message: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Billing Notification</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-radius: 10px;">
    <h2 style="color: #333; margin-top: 0;">💳 Notifikasi Billing</h2>
    
    <p>Halo ${name},</p>
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      ${message}
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${appUrl}/billing" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Lihat Detail Billing</a>
    </div>
  </div>
</body>
</html>
    `.trim();
  }
};
