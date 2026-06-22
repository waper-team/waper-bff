import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import jwt from 'jsonwebtoken';

let server;
let baseUrl;

before(async () => {
    process.env.USE_MOCK = 'true';
    process.env.OFFLINE_MODE = 'true';

    const { buildApp } = await import('../src/app.js');
    server = buildApp().listen(0, '127.0.0.1');
    await new Promise((resolve) => server.once('listening', resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
    await new Promise((resolve) => server.close(resolve));
});

test('profile routes require a valid owner session', async () => {
    const userId = '6a26cdc0e953d58f42ac971e';
    const token = jwt.sign(
        { id: userId, role: 'STUDENT' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' },
    );
    const cookie = { cookie: `access_token=${token}` };

    const withoutSession = await fetch(`${baseUrl}/api/users/${userId}`);
    assert.equal(withoutSession.status, 401);

    const anotherProfile = await fetch(
        `${baseUrl}/api/users/6a26d0ccc73a2d96ea2e9cf4`,
        { headers: cookie },
    );
    assert.equal(anotherProfile.status, 403);

    const ownProfile = await fetch(`${baseUrl}/api/users/${userId}`, {
        headers: cookie,
    });
    assert.equal(ownProfile.status, 200);

    const logout = await fetch(`${baseUrl}/api/auth/logout`, {
        method: 'POST',
        headers: cookie,
    });
    assert.equal(logout.status, 200);

    const afterLogout = await fetch(`${baseUrl}/api/users/${userId}`, {
        headers: cookie,
    });
    assert.equal(afterLogout.status, 401);
});
