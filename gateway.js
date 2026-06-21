const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Security Headers Middleware
app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', "default-src 'self'; connect-src 'self' https://air-quality-api.open-meteo.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; script-src 'self' 'unsafe-inline'; frame-ancestors 'none';");
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
});

// Simple In-Memory Rate Limiter to prevent brute force attacks on API routes
const rateLimits = {};
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 100; // max requests per window
app.use('/api', (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const now = Date.now();
    
    if (!rateLimits[ip]) {
        rateLimits[ip] = [];
    }
    
    // Filter out requests older than the window
    rateLimits[ip] = rateLimits[ip].filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);
    
    if (rateLimits[ip].length >= RATE_LIMIT_MAX) {
        return res.status(429).json({ error: "Too many requests. Please try again later." });
    }
    
    rateLimits[ip].push(now);
    next();
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend dashboard assets
app.use(express.static(path.join(__dirname)));

// Import Microservices representing Cloud Run services
const userService = require('./services/user-service');
const carbonEngine = require('./services/carbon-engine');
const recommendationEngine = require('./services/recommendation-engine');
const predictionEngine = require('./services/prediction-engine');
const chatService = require('./services/chat-service');

// Route Registrations mapping to API Gateway Endpoints
app.use('/api/users', userService);
app.use('/api/carbon', carbonEngine);
app.use('/api/recommendations', recommendationEngine);
app.use('/api/prediction', predictionEngine);
app.use('/api/chat', chatService);

/**
 * [MARKING]: GATEWAY_STARTUP_HEALTH_CHECK
 * [DESCRIPTION]: Confirms routing structure and runs service binding listeners.
 * [PARAMS]: None
 * [RETURNS]: void
 */
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`[API-GATEWAY] =========================================`);
        console.log(`[API-GATEWAY] GreenMind AI Enterprise Architecture Server`);
        console.log(`[API-GATEWAY] API Gateway running at http://localhost:${PORT}`);
        console.log(`[API-GATEWAY] Bound services:`);
        console.log(`[API-GATEWAY]  - User Service (/api/users) -> Firestore`);
        console.log(`[API-GATEWAY]  - Carbon Engine (/api/carbon) -> Cloud Run`);
        console.log(`[API-GATEWAY]  - Recommendation AI (/api/recommendations) -> Cloud Run`);
        console.log(`[API-GATEWAY]  - Prediction Engine (/api/prediction) -> Cloud Run`);
        console.log(`[API-GATEWAY]  - Chat Service (/api/chat) -> Cloud Run`);
        console.log(`[API-GATEWAY] =========================================`);
    });
}

module.exports = app;

