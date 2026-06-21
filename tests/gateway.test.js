process.env.NODE_ENV = 'test';
const test = require('node:test');
const assert = require('node:assert');

// Spin up a local instance using native Node fetch to keep dependencies completely clean!
const app = require('../gateway');
let server;
const PORT = 3010;

test.before(() => {
    server = app.listen(PORT);
});

test.after(() => {
    server.close();
});

test('API Integration Tests via Gateway', async (t) => {
    const baseUrl = `http://localhost:${PORT}`;
    const testEmail = `test_${Math.floor(Math.random() * 10000)}@greenmind.com`;
    let userKey = "";

    await t.test('Security Headers Validation', async () => {
        const res = await fetch(`${baseUrl}/api/users/sarah`);
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.headers.get('x-content-type-options'), 'nosniff');
        assert.strictEqual(res.headers.get('x-frame-options'), 'DENY');
        assert.strictEqual(res.headers.get('x-xss-protection'), '1; mode=block');
    });

    await t.test('Secure User Registration Endpoint with PBKDF2', async () => {
        const res = await fetch(`${baseUrl}/api/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test Cadet',
                email: testEmail,
                password: 'password123Secure',
                type: 'Urban Commuter',
                city: 'Chicago',
                latitude: 41.8781,
                longitude: -87.6298
            })
        });

        assert.strictEqual(res.status, 201, 'Should create new profile and return 201 status');
        const data = await res.json();
        assert.strictEqual(data.email, testEmail);
        assert.strictEqual(data.password, undefined, 'Sensitive password hashes should never be returned');
        userKey = data.id;
    });

    await t.test('Registration Input Validation boundaries', async () => {
        const res = await fetch(`${baseUrl}/api/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Shorty',
                email: 'bad_email',
                password: '123'
            })
        });

        assert.strictEqual(res.status, 400, 'Should reject invalid emails or passwords shorter than 6 chars');
    });

    await t.test('Secure Login validation', async () => {
        // Success case
        const successRes = await fetch(`${baseUrl}/api/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testEmail,
                password: 'password123Secure'
            })
        });
        assert.strictEqual(successRes.status, 200);
        const successData = await successRes.json();
        assert.strictEqual(successData.name, 'Test Cadet');

        // Failure case
        const failRes = await fetch(`${baseUrl}/api/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testEmail,
                password: 'wrong_password'
            })
        });
        assert.strictEqual(failRes.status, 401);
    });

    await t.test('Carbon Engine calculate boundary limits', async () => {
        const res = await fetch(`${baseUrl}/api/carbon/calculate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                evStatus: 2,
                plantBasedDays: 5,
                solarCapacitykW: 8,
                flightHours: 20,
                acTempSetting: 25,
                latitude: 41.8781,
                longitude: -87.6298,
                aqi: 50,
                pm2_5: 12,
                plannerModifiers: [],
                transitDays: 4,
                heatingType: 2,
                wasteDivertedPercent: 80
            })
        });

        assert.strictEqual(res.status, 200);
        const data = await res.json();
        assert.ok(data.currentTotalTons > 0, 'Total Carbon calculation must compute a positive double');
    });

    await t.test('Gemini Chat Response Router Fallback', async () => {
        const res = await fetch(`${baseUrl}/api/chat/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: 'Why was my footprint high this week?',
                scores: {
                    currentTons: 3.4,
                    mobility: 40,
                    energy: 55,
                    food: 80
                },
                profile: {
                    treeCanopyDensity: 'Medium (15% coverage)',
                    localTransportQuality: 'High'
                }
            })
        });

        assert.strictEqual(res.status, 200);
        const data = await res.json();
        assert.ok(data.reply.length > 0);
    });
});
