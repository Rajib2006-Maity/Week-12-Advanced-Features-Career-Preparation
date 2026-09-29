const request = require('supertest');
const createApp = require('../app');

// A minimal fake Socket.io instance so controllers that call req.io.to(...).emit(...) don't crash
const fakeIo = { to: () => ({ emit: () => {} }) };
const app = createApp(fakeIo);

const validUser = {
  name: 'Ada Lovelace',
  username: 'ada_lovelace',
  email: 'ada@example.com',
  password: 'SecurePass123'
};

describe('Auth API', () => {
  test('registers a new user and returns a token', async () => {
    const res = await request(app).post('/api/auth/register').send(validUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(validUser.email);
    expect(res.body.user.password).toBeUndefined();
  });

  test('rejects registration with a weak password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, email: 'weak@example.com', username: 'weakpass', password: '123' });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('rejects duplicate registration with the same email', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, username: 'someone_else' });

    expect(res.statusCode).toBe(409);
  });

  test('logs in with correct credentials', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: validUser.password });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('rejects login with incorrect password', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: 'WrongPassword1' });

    expect(res.statusCode).toBe(401);
  });

  test('blocks access to a protected route without a token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toBe(401);
  });

  test('allows access to a protected route with a valid token', async () => {
    const registerRes = await request(app).post('/api/auth/register').send(validUser);
    const token = registerRes.body.token;

    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe(validUser.email);
  });
});
