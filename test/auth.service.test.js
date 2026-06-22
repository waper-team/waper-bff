import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import http from 'node:http';

let server;
let receivedPayload;

before(async () => {
    process.env.USE_MOCK = 'false';
    process.env.OFFLINE_MODE = 'true';
    process.env.BACKEND_URL = 'http://127.0.0.1:18081';

    server = http.createServer((request, response) => {
        if (request.method !== 'POST' || request.url !== '/api/public/auth/token') {
            response.writeHead(404).end();
            return;
        }

        let body = '';
        request.on('data', (chunk) => {
            body += chunk;
        });
        request.on('end', () => {
            receivedPayload = JSON.parse(body);
            response.writeHead(200, { 'content-type': 'application/json' });
            response.end(JSON.stringify({
                token: 'signed-token',
                expiresInSeconds: 3600,
                user: {
                    id: 'mongo-user-id',
                    email: 'student@waper.test',
                    name: 'Student',
                    role: 'STUDENT',
                },
            }));
        });
    });

    await new Promise((resolve) => server.listen(18081, '127.0.0.1', resolve));
});

after(async () => {
    await new Promise((resolve) => server.close(resolve));
});

test('loginService sends email credentials and returns the Spring contract', async () => {
    const { loginService } = await import('../src/services/auth.service.js');
    const result = await loginService('student@waper.test', 'Password123');

    assert.deepEqual(receivedPayload, {
        email: 'student@waper.test',
        password: 'Password123',
    });
    assert.equal(result.token, 'signed-token');
    assert.equal(result.expiresInSeconds, 3600);
    assert.equal(result.user.id, 'mongo-user-id');
});
