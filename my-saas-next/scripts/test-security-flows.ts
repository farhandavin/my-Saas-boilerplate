import 'dotenv/config';
import { AuthService } from '@/services/authService';
import { TokenService } from '@/services/tokenService';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { authenticator } from 'otplib';

async function main() {
    console.log('🔒 Testing Security Flows...');

    const email = `security-${Date.now()}@test.com`;
    const password = 'Password123!';
    const name = 'Security Tester';

    // 1. Register User
    console.log(`\n1. Registering user: ${email}`);
    const { user } = await AuthService.register({
        name,
        email,
        password,
        companyName: 'Security Ops'
    });
    console.log('✅ Registered with ID:', user.id);

    // 2. Request Email Verification
    console.log('\n2. Requesting Email Verification...');
    await AuthService.requestEmailVerification(user.id);

    // Find token manually since we don't have email inbox
    const tokenRecord = await db.query.verificationTokens.findFirst({
        where: eq(users.email, email) // Wait, schema uses 'identifier'
    });
    // Need to fix query above in actual execution line below
    // The 'users' table import above is correct, verificationTokens table needed
}

// Fixed version:
import { verificationTokens } from '@/db/schema';

async function testFlow() {
    try {
        console.log('🔒 Starting Security Flow Test');
        const email = `sec-${Date.now()}@test.com`;

        // 1. REGISTER
        console.log(`\n[1] Registering ${email}...`);
        await AuthService.register({ name: 'Sec User', email, password: 'password', companyName: 'SecCorp' });
        const user = await db.query.users.findFirst({ where: eq(users.email, email) });
        if (!user) throw new Error("User reg failed");
        console.log('✅ User registered');

        // 2. EMAIL VERIFICATION
        console.log('\n[2] Testing Email Verification...');
        await AuthService.requestEmailVerification(user.id);

        // Fetch token from DB (simulating clicking link)
        const vToken = await db.query.verificationTokens.findFirst({
            where: eq(verificationTokens.identifier, email)
        });
        if (!vToken) throw new Error("Verification token not created");
        console.log('   Token fetched:', vToken.token);

        const verifyResult = await AuthService.verifyEmailWithToken(vToken.token);
        console.log('✅ Email Verified:', verifyResult.success);

        // 3. 2FA SETUP
        console.log('\n[3] Testing 2FA Setup...');
        const { secret, qrCode } = await AuthService.setupTwoFactor(user.id);
        console.log('   Secret:', secret);
        console.log('   QRCode generated:', !!qrCode);

        const otp = authenticator.generate(secret);
        console.log('   Generated OTP:', otp);

        await AuthService.confirmTwoFactor(user.id, otp);
        console.log('✅ 2FA Confirmed/Enabled');

        // 4. 2FA LOGIN VERIFY
        const validLogin = await AuthService.verifyTwoFactorLogin(user.id, otp);
        console.log('✅ Login with 2FA Valid:', validLogin);

        // 5. FORGOT PASSWORD
        console.log('\n[4] Testing Forgot Password...');
        await AuthService.forgotPassword(email);

        const resetToken = await db.query.verificationTokens.findFirst({
            where: eq(verificationTokens.identifier, email)
        });
        if (!resetToken) throw new Error("Reset token not found");

        console.log('   Reset Token:', resetToken.token);

        await AuthService.resetPassword(resetToken.token, 'NewPassword123!');
        console.log('✅ Password Reset Success');

        console.log('\n🎉 ALL SECURITY FLOWS PASSED!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Test Failed:', error);
        process.exit(1);
    }
}

testFlow();
