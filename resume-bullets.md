# Resume Material — Connectly (Advanced Social Media Platform)

Use whichever bullets best match the role you're applying for. Swap in real
metrics (user counts, load-test numbers, Lighthouse scores) once you have
them from your own deployment — recruiters and hiring managers weight
concrete numbers far more than adjectives.

## One-line summary (for a resume header or LinkedIn "Featured" section)

> Connectly — a full-stack, real-time social platform (React, Node.js,
> Socket.io, MongoDB) with live chat, media uploads, and CI/CD deployment.
> [GitHub link] · [Live demo link]

## Resume bullet points

Pick 3–5 that reflect the work you personally did and can speak to in an
interview:

- Built a full-stack social media platform (React 18/Vite frontend, Node.js/
  Express backend, MongoDB) supporting posts, likes, comments, follows, and
  a paginated feed for [N] mock users.
- Implemented real-time chat and live notifications using Socket.io with
  JWT-authenticated WebSocket connections, reducing perceived latency to
  near-zero compared to a polling-based approach.
- Integrated Cloudinary for image and video uploads with server-side file
  type/size validation and streaming uploads, avoiding local disk storage.
- Hardened the API against common attack vectors: rate limiting on
  authentication routes, bcrypt password hashing, brute-force account
  lockout, NoSQL injection sanitization, and XSS input cleaning.
- Wrote a test suite (Jest/Supertest for the API, Vitest/React Testing
  Library for the UI) covering authentication, authorization, and core
  social features, integrated into a GitHub Actions CI pipeline.
- Improved frontend load performance through route-based code splitting,
  vendor chunk separation, and gzip-compressed production builds, cutting
  the initial JS payload to under 30KB gzipped.
- Containerized the full stack (frontend, backend, MongoDB) with Docker and
  Docker Compose, and automated linting, testing, and image builds via
  GitHub Actions.

## Suggested project description (for a portfolio site or resume "Projects" section)

> **Connectly — Real-Time Social Media Platform**
> A full-stack social platform built to practice production-grade patterns:
> real-time communication, secure authentication, cloud media storage, and
> automated testing/deployment. Users can post text/photos/videos, like and
> comment, follow other users, chat live, and receive instant notifications.
> The backend is a Node.js/Express REST API with a parallel Socket.io layer;
> the frontend is a code-split React SPA. The project includes an automated
> test suite and a GitHub Actions pipeline that lints, tests, and builds
> Docker images on every push.
>
> **Tech:** React, Vite, Node.js, Express, Socket.io, MongoDB, Cloudinary,
> JWT, Jest, Vitest, Docker, GitHub Actions.

## Interview talking points

Be ready to explain, in your own words:
- **Why Socket.io and not just polling?** Persistent WebSocket connections
  push events to clients instantly instead of the client repeatedly asking
  "anything new?" — better latency and lower server load at scale.
- **How does the JWT auth flow work end to end?** Register/login issues a
  signed token → stored client-side and sent as a Bearer header (and as an
  httpOnly cookie) → verified on every protected request and on the
  Socket.io handshake.
- **What would you change for real production traffic?** Move Socket.io to
  a Redis adapter for multi-instance scaling, add a CDN in front of the
  frontend, add server-side rendering or pre-rendering for public profile
  pages to improve SEO, and add structured logging/monitoring (e.g.
  Sentry, Prometheus).
- **What was the hardest bug?** (Answer this one yourself — pick a real
  moment from building or extending this project.)
