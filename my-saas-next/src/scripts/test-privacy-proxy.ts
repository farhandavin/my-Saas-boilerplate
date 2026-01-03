import dotenv from 'dotenv';
dotenv.config();

async function main() {
    // Dynamic import to ensure env vars are loaded first
    const { PrivacyLayer } = await import('../lib/ai/privacy-layer');

    console.log('🕵️  Testing Privacy Layer...');

    const originalText = "Hello, my email is john.doe@example.com and my phone is 08123456789. Card: 4242-4242-4242-4242.";
    console.log(`\n📄 Original: "${originalText}"`);

    // 1. Mask
    console.log('\n🔒 Masking...');
    const { maskedText, mapId } = await PrivacyLayer.mask(originalText, 'test-team');
    console.log(`   Masked:   "${maskedText}"`);
    console.log(`   Map ID:   ${mapId}`);

    if (maskedText === originalText) {
        console.error('❌ PII was not masked!');
        process.exit(1);
    }

    // 2. Unmask
    console.log('\n🔓 Unmasking...');
    const unmaskedText = await PrivacyLayer.unmask(maskedText, mapId);
    console.log(`   Restored: "${unmaskedText}"`);

    if (unmaskedText !== originalText) {
        console.error('❌ De-masking failed. Text does not match original.');
        console.error(`   Expected: "${originalText}"`);
        console.error(`   Got:      "${unmaskedText}"`);
        process.exit(1);
    }

    console.log('\n✅ Privacy Layer verified successfully!');

    // Test DLP
    console.log('\n🧹 Testing DLP...');
    const sensitiveObj = {
        username: 'john',
        password: 'secret_password',
        token: 'jwt_token_123',
        publicData: 'ok'
    };
    const cleanObj = PrivacyLayer.stripSensitiveFields(sensitiveObj);
    console.log('   Original:', sensitiveObj);
    console.log('   Cleaned: ', cleanObj);

    if (cleanObj.password || cleanObj.token) {
        console.error('❌ DLP failed to strip sensitive fields');
        process.exit(1);
    }
    console.log('✅ DLP verified successfully!');
    process.exit(0);
}

main().catch(err => {
    console.error('Script Error:', err);
    process.exit(1);
});
