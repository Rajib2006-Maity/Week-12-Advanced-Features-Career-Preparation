const request = require('supertest');
const createApp = require('../app');

const fakeIo = { to: () => ({ emit: () => {} }) };
const app = createApp(fakeIo);

const registerAndLogin = async (overrides = {}) => {
  const user = {
    name: 'Grace Hopper',
    username: 'grace_hopper',
    email: 'grace@example.com',
    password: 'SecurePass123',
    ...overrides
  };
  const res = await request(app).post('/api/auth/register').send(user);
  return { token: res.body.token, user: res.body.user };
};

describe('Posts API', () => {
  test('rejects creating a post without authentication', async () => {
    const res = await request(app).post('/api/posts').send({ text: 'Hello world' });
    expect(res.statusCode).toBe(401);
  });

  test('creates a post when authenticated', async () => {
    const { token } = await registerAndLogin();
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ text: 'My first post!' });

    expect(res.statusCode).toBe(201);
    expect(res.body.post.text).toBe('My first post!');
  });

  test('rejects an empty post with no text or media', async () => {
    const { token } = await registerAndLogin();
    const res = await request(app).post('/api/posts').set('Authorization', `Bearer ${token}`).send({});
    expect(res.statusCode).toBe(400);
  });

  test('returns a paginated feed', async () => {
    const { token } = await registerAndLogin();
    for (let i = 0; i < 3; i += 1) {
      await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${token}`)
        .send({ text: `Post ${i}` });
    }

    const res = await request(app).get('/api/posts?page=1&limit=2').set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.posts.length).toBe(2);
    expect(res.body.totalPosts).toBe(3);
  });

  test('toggles a like on a post', async () => {
    const { token } = await registerAndLogin();
    const createRes = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ text: 'Like me' });
    const postId = createRes.body.post._id;

    const likeRes = await request(app)
      .put(`/api/posts/${postId}/like`)
      .set('Authorization', `Bearer ${token}`);
    expect(likeRes.body.liked).toBe(true);
    expect(likeRes.body.likesCount).toBe(1);

    const unlikeRes = await request(app)
      .put(`/api/posts/${postId}/like`)
      .set('Authorization', `Bearer ${token}`);
    expect(unlikeRes.body.liked).toBe(false);
    expect(unlikeRes.body.likesCount).toBe(0);
  });

  test('adds a comment to a post', async () => {
    const { token } = await registerAndLogin();
    const createRes = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ text: 'Comment on this' });
    const postId = createRes.body.post._id;

    const commentRes = await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send({ text: 'Nice post!' });

    expect(commentRes.statusCode).toBe(201);
    expect(commentRes.body.comments.length).toBe(1);
    expect(commentRes.body.comments[0].text).toBe('Nice post!');
  });

  test("prevents a user from deleting another user's post", async () => {
    const owner = await registerAndLogin();
    const intruder = await registerAndLogin({
      username: 'intruder',
      email: 'intruder@example.com'
    });

    const createRes = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ text: 'Not yours' });
    const postId = createRes.body.post._id;

    const deleteRes = await request(app)
      .delete(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${intruder.token}`);

    expect(deleteRes.statusCode).toBe(403);
  });
});
