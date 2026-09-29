# Tests

This project's automated tests live next to the code they test, which is the
standard convention for both the Node/Express and Vite/React toolchains used
here. This folder documents where everything is and how to run it.

## Backend — `backend/tests/`

Integration tests for the REST API, written with **Jest** and **Supertest**,
running against an in-memory MongoDB instance (`mongodb-memory-server`) so no
real database is needed to run them.

| File | Covers |
|---|---|
| `auth.test.js` | Registration, login, weak-password rejection, duplicate accounts, brute-force lockout, protected-route access |
| `post.test.js` | Post creation, validation, pagination, likes, comments, delete-permission checks |
| `setup.js` | Spins up/tears down the in-memory MongoDB instance for every test file |

Run them:
```bash
cd backend
npm install
npm test              # single run
npm run test:coverage # with a coverage report
```

## Frontend — `frontend/src/__tests__/`

Component tests written with **Vitest** and **React Testing Library**.

| File | Covers |
|---|---|
| `Login.test.jsx` | Form rendering, successful login call, error message on failure |
| `PostCard.test.jsx` | Rendering post content, optimistic like toggling, submitting a comment |

Run them:
```bash
cd frontend
npm install
npm test
```

## CI

Both suites run automatically on every push and pull request via
[`.github/workflows/ci-cd.yml`](../.github/workflows/ci-cd.yml), which also
builds the production frontend bundle and both Docker images before any
deploy step runs.

## Manual / exploratory testing

For real-time features that are easiest to verify by hand (Socket.io chat,
live notifications, typing indicators), open the app in two different
browser profiles (or one normal + one incognito window), log in as two
different users, and:
1. Follow each other from the Profile page.
2. Like/comment on a post from one account and confirm the notification bell
   updates instantly on the other account without a page refresh.
3. Open `/chat/:otherUserId` on both accounts and confirm messages and the
   typing indicator appear in real time.
