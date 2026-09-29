const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' }
});

// Stricter limiter for auth endpoints to slow down brute-force / credential stuffing
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Try again in 15 minutes.' }
});

// Bundles security middleware applied globally in server.js
const applySecurityMiddleware = (app) => {
  app.use(helmet());
  app.use(mongoSanitize()); // strips $ and . operators to prevent NoSQL injection
  app.use(xss()); // sanitizes user input from malicious HTML/JS
  app.use(hpp()); // prevents HTTP parameter pollution
  app.use('/api', apiLimiter);
};

module.exports = { applySecurityMiddleware, authLimiter };
