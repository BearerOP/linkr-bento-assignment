// tests/auth.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');

// Disable automatic connection in server.js when testing
jest.mock('../config/db', () => jest.fn());

beforeAll(async () => {
  // Connect to test database
  await mongoose.connect('mongodb://localhost:27017/linktree-test', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

beforeEach(async () => {
  // Clear users collection before each test
  await User.deleteMany({});
});

afterAll(async () => {
  // Close connection after all tests
  await mongoose.connection.close();
});

describe('Authentication API', () => {
  // Test registration
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.success).toBe(true);
  });

  // Test login
  it('should login an existing user', async () => {
    // First register a user
    await request(app)
      .post('/api/register')
      .send({
        username: 'logintest',
        email: 'login@example.com',
        password: 'password123',
      });
      
    // Then try to login
    const res = await request(app)
      .post('/api/login')
      .send({
        email: 'login@example.com',
        password: 'password123',
      });
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.success).toBe(true);
  });

  // Test invalid login
  it('should reject invalid credentials', async () => {
    // First register a user
    await request(app)
      .post('/api/register')
      .send({
        username: 'invalidtest',
        email: 'invalid@example.com',
        password: 'password123',
      });
      
    // Then try to login with wrong password
    const res = await request(app)
      .post('/api/login')
      .send({
        email: 'invalid@example.com',
        password: 'wrongpassword',
      });
    
    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toBe(false);
  });
});