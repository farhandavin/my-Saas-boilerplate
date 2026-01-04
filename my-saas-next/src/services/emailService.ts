// src/services/emailService.ts
// Centralized Email Service using Resend

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';

export const EmailService = {
  /**
   * Send welcome email after registration
   */
  async sendWelcomeEmail(to: string, name: string, teamName?: string) {
    try {
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: [to],
        subject: '🎉 Selamat Datang di Business Operating System!',
        html: this.getWelcomeEmailTemplate(name, teamName),
        text: `Halo ${name}!\n\nSelamat datang di Business Operating System${teamName ? ` untuk ${teamName}` : ''}.\n\nMulai explore fitur-fitur unggulan kami:\n- 🤖 AI Assistant dengan RAG Knowledge Base\n- 📊 CEO Digest harian\n- 🔒 Multi-tenancy yang aman\n- 💳 Billing otomatis\n\nLogin sekarang: ${appUrl}/auth`
      });

      if (error) {
        console.error('[EmailService] Welcome email error:', error);
        return { success: false, error };
      }

      console.log('[EmailService] Welcome email sent:', data?.id);
      return { success: true, messageId: data?.id };
    } catch (error) {
      console.error('[EmailService] Welcome email exception:', error);
      return { success: false, error };
    }
  },

  /**
   * Send verification email
   */
  async sendVerificationEmail(to: string, name: string, token: string) {
    const verifyUrl = `${appUrl}/auth/verify-email?token=${token}`;

    try {
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: [to],
        subject: '🔒 Verifikasi Email - Business Operating System',
        html: `
          <h1>Verifikasi Email Anda</h1>
          <p>Halo ${name},</p>
          <p>Silakan klik link berikut untuk memverifikasi email Anda:</p>
          <a href="${verifyUrl}">Verifikasi Email</a>
        `,
        text: `Halo ${name},\n\nSilakan verifikasi email Anda: ${verifyUrl}`
      });

      if (error) {
        console.error('[EmailService] Verification email error:', error);
        return { success: false, error };
      }
      return { success: true, messageId: data?.id };
    } catch (error) {
      console.error('[EmailService] Verification email exception:', error);
      return { success: false, error };
    }
  },

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(to: string, name: string, resetToken: string) {
    const resetUrl = `${appUrl}/auth/reset-password?token=${resetToken}`;

    try {
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: [to],
        subject: '🔐 Reset Password - Business Operating System',
        html: this.getPasswordResetTemplate(name, resetUrl),
        text: `Halo ${name},\n\nAnda meminta untuk reset password akun Anda.\n\nKlik link berikut untuk reset password (berlaku 1 jam):\n${resetUrl}\n\nJika Anda tidak meminta reset password, abaikan email ini.`
      });

      if (error) {
        console.error('[EmailService] Password reset email error:', error);
        return { success: false, error };
      }

      console.log('[EmailService] Password reset email sent:', data?.id);
      return { success: true, messageId: data?.id };
    } catch (error) {
      console.error('[EmailService] Password reset exception:', error);
      return { success: false, error };
    }
  },

  /**
   * Send team invitation email
   */
  async sendInvitationEmail(to: string, inviterName: string, teamName: string, role: string, inviteToken: string) {
    const inviteUrl = `${appUrl}/auth/register-invite?token=${inviteToken}`;

    try {
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: [to],
        subject: `📬 Undangan untuk bergabung dengan ${teamName}`,
        html: this.getInvitationTemplate(inviterName, teamName, role, inviteUrl),
        text: `Halo!\n\n${inviterName} mengundang Anda untuk bergabung dengan tim ${teamName} sebagai ${role}.\n\nKlik link berikut untuk menerima undangan:\n${inviteUrl}\n\nUndangan berlaku 7 hari.`
      });

      if (error) {
        console.error('[EmailService] Invitation email error:', error);
        return { success: false, error };
      }

      console.log('[EmailService] Invitation email sent:', data?.id);
      return { success: true, messageId: data?.id };
    } catch (error) {
      console.error('[EmailService] Invitation exception:', error);
      return { success: false, error };
    }
  },

  /**
   * Send CEO Digest email
   */
  async sendCEODigestEmail(to: string, ownerName: string, digestContent: string, teamName: string) {
    try {
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: [to],
        subject: `📊 CEO Digest - ${new Date().toLocaleDateString('id-ID')}`,
        html: this.getCEODigestTemplate(ownerName, digestContent, teamName),
        text: digestContent
      });

      if (error) {
        console.error('[EmailService] CEO Digest email error:', error);
        return { success: false, error };
      }

      console.log('[EmailService] CEO Digest email sent:', data?.id);
      return { success: true, messageId: data?.id };
    } catch (error) {
      console.error('[EmailService] CEO Digest exception:', error);
      return { success: false, error };
    }
  },

  /**
   * Send billing notification
   */
  async sendBillingNotification(to: string, name: string, subject: string, message: string) {
    try {
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: [to],
        subject: `💳 ${subject}`,
        html: this.getBillingTemplate(name, message),
        text: `Halo ${name},\n\n${message}`
      });

      if (error) {
        console.error('[EmailService] Billing notification error:', error);
        return { success: false, error };
      }

      console.log('[EmailService] Billing notification sent:', data?.id);
      return { success: true, messageId: data?.id };
    } catch (error) {
      console.error('[EmailService] Billing notification exception:', error);
      return { success: false, error };
    }
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
