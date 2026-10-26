const request = require('supertest');
require('dotenv').config();
const app = require('../src/app');
const User = require('../src/models/User');
const { connectTestDB, closeTestDB, clearTestDB } = require('./setup');

beforeAll(async () => {
  await connectTestDB();
});
afterEach(async () => {
  await clearTestDB();
});
afterAll(async () => {
  await closeTestDB();
});

const registerAndLogin = async (email) => {
  const res = await request(app)
    .post('/api/v1/auth/register')
    .send({ name: 'User', email, password: 'test123' });
  return res.body.data.token;
};

describe('Companies', () => {
  test('rejects company creation without a token', async () => {
    const res = await request(app).post('/api/v1/companies').send({ name: 'Google' });
    expect(res.statusCode).toBe(401);
  });

  test('rejects company creation from a non-admin user', async () => {
    const token = await registerAndLogin('candidate@example.com');
    const res = await request(app)
      .post('/api/v1/companies')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Google' });
    expect(res.statusCode).toBe(403);
  });

  test('allows anyone to list companies without a token', async () => {
    const res = await request(app).get('/api/v1/companies');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('rejects company creation with an empty name, even from an admin', async () => {
    const token = await registerAndLogin('admin@example.com');
    await User.updateOne({ email: 'admin@example.com' }, { role: 'admin' });

    const res = await request(app)
      .post('/api/v1/companies')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.statusCode).toBe(400);
  });

  test('allows an admin to create a company', async () => {
    const token = await registerAndLogin('admin2@example.com');
    await User.updateOne({ email: 'admin2@example.com' }, { role: 'admin' });

    const res = await request(app)
      .post('/api/v1/companies')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Google' });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.name).toBe('Google');
  });
});