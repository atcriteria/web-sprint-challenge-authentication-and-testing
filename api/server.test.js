const request = require('supertest');
const db = require('../data/dbConfig');
const server = require('./server');
const bcrypt = require('bcryptjs');
const data = require('./jokes/jokes-data');

const first = {username: "first", password: "password"};
const second = {username: "second", password: "Security1!"};

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
});
beforeEach(async () => {
  await db('users').truncate();
});
afterAll(async () => {
  await db.destroy();
});

// Write your tests here
test('sanity', () => {
  expect(true).toBe(true)
});

describe('server', () => {
  describe('[POST] /api/auth/register', () => {
    it('responds with status 201', async () => {
      const res = await request(server).post('/api/auth/register').send(first)
      expect(res.status).toBe(201)
    });
    it('responds with the newly created user', async () => {
      const res = await request(server).post('/api/auth/register').send(second);
      expect(res.body).toMatchObject({id: 1, username: second.username}) // cant match the entire object due to hashed password
    });
  });
  describe('[POST] /api/auth/login', () => {
    it('lets us login', async () => {
      // const hash = bcrypt.hashSync(first.password, 8)
      // let firstHashed = {username: "first", password: hash}
      // console.log(firstHashed)
      // await db('users').insert(firstHashed);
      await request(server).post('/api/auth/register').send(first); // not best practice but I couldn't get the hashing to work otherwise. Would kick back 'invalid credentials'
      const res = await request(server).post('/api/auth/login').send(first);
      expect(res.body).toMatchObject({message: "welcome, first"})
    });
    it('kicks us back on invalid credentials', async () => {
      const res = await await request(server).post('/api/auth/login').send(first);
      expect(res.body).toBe('invalid credentials')
    });
  });
  describe('[GET] /api/jokes', () => {
    it('sends us packing if we dont have a token', async () => {
      const res = await request(server).get('/api/jokes');
      expect(res.body).toBe("token required")
    });
    it('gives us what we want with a token', async() => {
      await request(server).post('/api/auth/register').send(first);
      const res = await request(server).post('/api/auth/login').send(first);
      const jokes = await request(server).get('/api/jokes').set('Authorization', res.body.token)
      expect(jokes.body).toMatchObject(data)
    })
  })
})
