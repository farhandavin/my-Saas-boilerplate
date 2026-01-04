
import fetch from 'node-fetch';

async function debugLogin() {
    const url = 'http://localhost:3000/api/auth/login';
    const payload = {
        email: 'testsprite@test.com',
        password: 'TestSprite123!'
    };

    console.log(`🚀 Testing Login: ${url}`);
    console.log(`📧 Email: ${payload.email}`);
    console.log(`🔑 Password: ${payload.password}`);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        console.log(`\n📡 Status: ${response.status} ${response.statusText}`);

        // Check cookies
        const cookies = response.headers.get('set-cookie');
        console.log(`🍪 Set-Cookie: ${cookies || 'NONE'}`);

        const data = await response.json();
        console.log(`\n📦 Response Body:`);
        console.log(JSON.stringify(data, null, 2));

    } catch (error) {
        console.error(`\n❌ Error:`, error);
    }
}

debugLogin();
