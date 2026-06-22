import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import http from 'node:http';

let server;
let receivedPayload;
let receivedAuthorization;

before(async () => {
    process.env.USE_MOCK = 'false';
    process.env.OFFLINE_MODE = 'true';
    process.env.BACKEND_URL = 'http://127.0.0.1:18082';

    server = http.createServer((request, response) => {
        if (request.method !== 'PUT' || request.url !== '/api/users/mongo-user-id') {
            response.writeHead(404).end();
            return;
        }

        let body = '';
        request.on('data', (chunk) => {
            body += chunk;
        });
        request.on('end', () => {
            receivedPayload = JSON.parse(body);
            receivedAuthorization = request.headers.authorization;
            response.writeHead(200, { 'content-type': 'application/json' });
            response.end(JSON.stringify({
                id: 'mongo-user-id',
                name: 'Updated Student',
                bio: receivedPayload.bio,
            }));
        });
    });

    await new Promise((resolve) => server.listen(18082, '127.0.0.1', resolve));
});

after(async () => {
    await new Promise((resolve) => server.close(resolve));
});

test('updateUser forwards profile changes to Spring in real mode', async () => {
    const { updateUser } = await import('../src/services/user.service.js');
    const result = await updateUser(
        'mongo-user-id',
        {
            name: 'Updated Student',
            bio: 'Updated bio',
        },
        'signed-token',
    );

    assert.deepEqual(receivedPayload, {
        name: 'Updated Student',
        bio: 'Updated bio',
    });
    assert.equal(result.id, 'mongo-user-id');
    assert.equal(result.bio, 'Updated bio');
    assert.equal(receivedAuthorization, 'Bearer signed-token');
});
