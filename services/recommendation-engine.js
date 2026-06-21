const express = require('express');
const router = express.Router();
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Local rule-based recommendations fallback if API Key is missing or request fails
function getLocalFallbackRecommendations(treeCanopyDensity, localTransportQuality, overallScore) {
    const recommendations = [];

    if (treeCanopyDensity && (treeCanopyDensity.toLowerCase().includes("low") || treeCanopyDensity.toLowerCase().includes("medium"))) {
        recommendations.push({
            id: "earth_canopy",
            category: "offset",
            title: "Increase Neighborhood Carbon Sinks",
            description: "Your local district has below 20% urban tree canopy. Planting 3 shade trees near your property will offset approximately 66 kg CO₂ annually and reduce summer AC cooling loads.",
            impact: "-66 kg CO₂/yr",
            difficulty: "Medium",
            agency: "Google Earth Engine Local Sink Advisor"
        });
    }

    if (localTransportQuality && localTransportQuality.toLowerCase().includes("high")) {
        recommendations.push({
            id: "maps_transit",
            category: "mobility",
            title: "Transition Mid-Week Commute to Subway",
            description: "Your route profile overlaps with dense metro services (200m distance). Shifting Wednesday commutes from ICE driving to subway cuts weekly travel footprint by 65%.",
            impact: "-210 kg CO₂/yr",
            difficulty: "Easy",
            agency: "Google Maps Route Planner Agent"
        });
    } else {
        recommendations.push({
            id: "maps_hybrid",
            category: "mobility",
            title: "Carpooling and Route Aggregation",
            description: "Local public transport coverage is low. Consider aggregating weekly grocery trips and carpooling to work to lower fuel demand.",
            impact: "-120 kg CO₂/yr",
            difficulty: "Easy",
            agency: "Google Maps Timeline Optimizer"
        });
    }

    if (overallScore < 70) {
        recommendations.push({
            id: "diet_reduction",
            category: "food",
            title: "Commit to Meat-Free Mondays",
            description: "Your Food score shows meat consumption as a key carbon driver. Replacing meat one day per week cuts food emissions by 15%.",
            impact: "-180 kg CO₂/yr",
            difficulty: "Easy",
            agency: "Consumption Intelligence Agent"
        });
    }

    return recommendations;
}

/**
 * [MARKING]: CLOUD_RUN_RECOMMENDATION_ENGINE_GET
 * [DESCRIPTION]: Resolves earth-aware recommendations matching location contexts from Earth Engine maps.
 * [PARAMS]: Express request query containing treeCanopy, transportQuality, and overallScore
 * [RETURNS]: Array of localized, tailored action cards
 */
router.post('/evaluate', async (req, res) => {
    console.log("[RECOMMENDATION-ENGINE] Evaluating Earth-Aware constraints for personal twin.");
    const { treeCanopyDensity, localTransportQuality, overallScore, latitude, longitude, aqi } = req.body;

    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) {
        console.log("[RECOMMENDATION-ENGINE] No Gemini API key found. Using local rule-based engine.");
        const fallback = getLocalFallbackRecommendations(treeCanopyDensity, localTransportQuality, overallScore);
        return res.json(fallback);
    }

    try {
        console.log("[RECOMMENDATION-ENGINE] Initializing Gemini Structured API query.");
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: "You are an expert carbon reduction strategist. Generate exactly 3 highly personalized, context-aware, and actionable carbon reduction solutions for a user based on their geolocation, environmental AQI, tree density, transit access, and overall score.",
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            id: { type: "string", description: "Sebab-case unique id (e.g. food_compost, solar_battery)" },
                            category: { type: "string", description: "Must be one of: mobility, food, energy, offset" },
                            title: { type: "string", description: "Short actionable action name" },
                            description: { type: "string", description: "Detailed, specific explanation explaining the how and why" },
                            impact: { type: "string", description: "CO2 savings descriptor, e.g. -180 kg CO2/yr" },
                            difficulty: { type: "string", description: "Must be: Easy, Medium, or Hard" },
                            agency: { type: "string", description: "Emulating automated agency, e.g. Gemini Route Agent" }
                        },
                        required: ["id", "category", "title", "description", "impact", "difficulty", "agency"]
                    }
                }
            }
        });

        const prompt = `
        Evaluate carbon twin profile characteristics:
        - Lat/Lng: ${latitude || 37.7749}, ${longitude || -122.4194}
        - Local Air Quality Index (AQI): ${aqi || 50}
        - Tree Canopy Density: ${treeCanopyDensity || "Medium (15% coverage)"}
        - Public Transit Access: ${localTransportQuality || "High (Subway/Busses near 200m)"}
        - Current Digital Twin Carbon Score: ${overallScore || 60}/100 (where 100 is best)

        Suggest 3 targeted, location-aware carbon reduction steps. Present them strictly conforming to the response JSON schema.
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const recommendations = JSON.parse(responseText);

        console.log("[RECOMMENDATION-ENGINE] Successfully generated structured recommendations via Gemini API.");
        res.json(recommendations);
    } catch (error) {
        console.error("[RECOMMENDATION-ENGINE] Gemini API error: ", error.message);
        console.log("[RECOMMENDATION-ENGINE] Falling back to local rule-based recommendations.");
        const fallback = getLocalFallbackRecommendations(treeCanopyDensity, localTransportQuality, overallScore);
        res.json(fallback);
    }
});

module.exports = router;
