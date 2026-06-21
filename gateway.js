const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

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
