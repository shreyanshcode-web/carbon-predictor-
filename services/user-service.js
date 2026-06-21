const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// Password security helper using PBKDF2
function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
}

function verifyPassword(password, storedPassword) {
    if (!storedPassword || !storedPassword.includes(':')) return false;
    const [salt, originalHash] = storedPassword.split(':');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === originalHash;
}

// Pre-hashed default password "password123" for safety alignment
const defaultHashedPassword = hashPassword("password123");

// Mock Firestore Database Storage
const firestoreDb = {
    sarah: {
        id: "sarah",
        name: "Sarah",
        email: "sarah@greenmind.com",
        password: defaultHashedPassword,
        type: "Urban Commuter",
        treeCanopyDensity: "Medium (15% coverage)",
        localTransportQuality: "High (Subway/Busses near 200m)",
        digitalTwin: {
            mobility_score: 72,
            energy_score: 81,
            food_score: 65,
            waste_score: 54,
            overall_carbon_score: 68
        },
        history: {
            mobility: [
                { name: 'Commute to Office', distance: '12 km', mode: 'ICE Vehicle', co2: '2.30 kg' },
                { name: 'Grocery Run', distance: '3 km', mode: 'ICE Vehicle', co2: '0.58 kg' },
                { name: 'Weekend Outing', distance: '22 km', mode: 'ICE Vehicle', co2: '4.22' },
                { name: 'Gym Trip', distance: '5 km', mode: 'Walk', co2: '0.00' }
            ],
            transactions: [
                { merchant: 'Shell Gas Station', amount: '$45.00', category: 'transport', co2: '18.2' },
                { merchant: 'Whole Foods Market', amount: '$82.50', category: 'food', co2: '6.4' },
                { merchant: 'Uber Trip Pool', amount: '$18.20', category: 'transport', co2: '1.2' },
                { merchant: 'PG&E Electric Utility', amount: '$112.00', category: 'utilities', co2: '42.5' }
            ]
        }
    },
    david: {
        id: "david",
        name: "David",
        email: "david@greenmind.com",
        password: defaultHashedPassword,
        type: "Suburban Homeowner",
        treeCanopyDensity: "High (35% coverage)",
        localTransportQuality: "Low (Car-dependent, no subway)",
        digitalTwin: {
            mobility_score: 42,
            energy_score: 48,
            food_score: 45,
            waste_score: 38,
            overall_carbon_score: 43
        },
        history: {
            mobility: [
                { name: 'Commute to Office', distance: '35 km', mode: 'ICE SUV', co2: '8.40 kg' },
                { name: 'School Drop-off', distance: '8 km', mode: 'ICE SUV', co2: '1.92' },
                { name: 'Hardware Store Run', distance: '14 km', mode: 'ICE SUV', co2: '3.36' }
            ],
            transactions: [
                { merchant: 'Chevron Gas Station', amount: '$72.00', category: 'transport', co2: '32.1' },
                { merchant: 'Costco Wholesale', amount: '$240.00', category: 'food', co2: '28.6' },
                { merchant: 'Local Gas utility', amount: '$180.00', category: 'utilities', co2: '92.0' }
            ]
        }
    },
    elena: {
        id: "elena",
        name: "Elena",
        email: "elena@greenmind.com",
        password: defaultHashedPassword,
        type: "Off-grid Enthusiast",
        treeCanopyDensity: "Dense (55% coverage)",
        localTransportQuality: "Medium (Bike lanes present)",
        digitalTwin: {
            mobility_score: 95,
            energy_score: 94,
            food_score: 90,
            waste_score: 88,
            overall_carbon_score: 92
        },
        history: {
            mobility: [
                { name: 'Grocery Run', distance: '4 km', mode: 'Electric Bike', co2: '0.02' },
                { name: 'Friend visit', distance: '10 km', mode: 'Electric Bike', co2: '0.05' },
                { name: 'Intercity Rail travel', distance: '90 km', mode: 'Electric Train', co2: '0.45' }
            ],
            transactions: [
                { merchant: 'Local Farmer\'s Market', amount: '$38.00', category: 'food', co2: '0.2' },
                { merchant: 'REI Eco Gear', amount: '$95.00', category: 'shopping', co2: '1.8' },
                { merchant: 'Municipal Recycling Depot', amount: '$15.00', category: 'shopping', co2: '-5.0' }
            ]
        }
    }
};

/**
 * [MARKING]: CLOUD_RUN_USER_SERVICE_GET_PROFILE
 * [DESCRIPTION]: Retrieves profile and Digital Twin state from mock Firestore database.
 * [PARAMS]: Express request with profileId parameter
 * [RETURNS]: JSON object representing user state
 */
router.get('/:profileId', (req, res) => {
    const profileId = req.params.profileId;
    console.log(`[USER-SERVICE] Fetching profile data for user: ${profileId}`);
    const profile = firestoreDb[profileId];
    if (profile) {
        // Return without password hash for safety
        const safeProfile = { ...profile };
        delete safeProfile.password;
        res.json(safeProfile);
    } else {
        res.status(404).json({ error: "Profile not found" });
    }
});

/**
 * [MARKING]: CLOUD_RUN_USER_SERVICE_UPDATE_TWIN
 * [DESCRIPTION]: Modifies a user's digital twin scores in mock database.
 * [PARAMS]: Express request with body containing updated digitalTwin metrics
 * [RETURNS]: JSON updated profile object
 */
router.post('/:profileId/twin', (req, res) => {
    const profileId = req.params.profileId;
    const { mobility_score, energy_score, food_score, waste_score, overall_carbon_score } = req.body;
    
    console.log(`[USER-SERVICE] Syncing Digital Twin scores for user: ${profileId}`);
    const profile = firestoreDb[profileId];
    if (profile) {
        profile.digitalTwin = {
            mobility_score: mobility_score ?? profile.digitalTwin.mobility_score,
            energy_score: energy_score ?? profile.digitalTwin.energy_score,
            food_score: food_score ?? profile.digitalTwin.food_score,
            waste_score: waste_score ?? profile.digitalTwin.waste_score,
            overall_carbon_score: overall_carbon_score ?? profile.digitalTwin.overall_carbon_score
        };
        const safeProfile = { ...profile };
        delete safeProfile.password;
        res.json(safeProfile);
    } else {
        res.status(404).json({ error: "Profile not found" });
    }
});

/**
 * [NEW ENDPOINT]: User Registration
 */
router.post('/register', (req, res) => {
    const { name, email, password, type, city, latitude, longitude } = req.body;
    console.log(`[USER-SERVICE] Registering new user: ${email}`);
    
    if (!name || !email || !password) {
        return res.status(400).json({ error: "Name, email, and password are required" });
    }

    // Basic Input Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email address format" });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    const key = email.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    if (firestoreDb[key]) {
        return res.status(400).json({ error: "User already exists with this email" });
    }

    const newProfile = {
        id: key,
        name,
        email,
        password: hashPassword(password),
        type: type || "Urban Commuter",
        city: city || "San Francisco",
        latitude: latitude || 37.7749,
        longitude: longitude || -122.4194,
        treeCanopyDensity: "Medium (15% coverage)",
        localTransportQuality: "High (Subway/Busses near 200m)",
        digitalTwin: {
            mobility_score: 60,
            energy_score: 65,
            food_score: 55,
            waste_score: 50,
            overall_carbon_score: 58
        },
        history: {
            mobility: [
                { name: 'Commute to Office', distance: '12 km', mode: 'ICE Vehicle', co2: '2.30 kg' }
            ],
            transactions: [
                { merchant: 'Whole Foods Market', amount: '$82.50', category: 'food', co2: '6.4' }
            ]
        }
    };

    firestoreDb[key] = newProfile;
    
    const safeProfile = { ...newProfile };
    delete safeProfile.password;
    res.status(201).json(safeProfile);
});

/**
 * [NEW ENDPOINT]: User Login
 */
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    console.log(`[USER-SERVICE] Authenticating user: ${email}`);

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    const key = email.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const profile = firestoreDb[key];

    if (profile && verifyPassword(password, profile.password)) {
        const safeProfile = { ...profile };
        delete safeProfile.password;
        res.json(safeProfile);
    } else {
        res.status(401).json({ error: "Invalid email or password" });
    }
});

module.exports = router;

