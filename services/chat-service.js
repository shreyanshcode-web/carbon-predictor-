const express = require('express');
const router = express.Router();

/**
 * [MARKING]: CLOUD_RUN_CHAT_SERVICE_GENERATE
 * [DESCRIPTION]: Formulates context-aware sustainable responses simulating Vertex AI Gemini models.
 * [PARAMS]: Express request body with query, currentTons, mobilityScore, energyScore, foodScore, and profile name/characteristics
 * [RETURNS]: Chat string text response
 */
router.post('/query', (req, res) => {
    const { query, scores, profile } = req.body;
    console.log(`[CHAT-SERVICE] Gemini Chat processing prompt: "${query}"`);

    const qLower = query.toLowerCase();
    let reply = "";

    if (qLower.includes("high") || qLower.includes("why")) {
        let reasons = [];
        if (scores.mobility < 65) {
            reasons.push(`your mobility score is low (${scores.mobility}%). Daily gasoline commute distances account for a significant share.`);
        }
        if (scores.energy < 60) {
            reasons.push(`high grid draw and HVAC setpoints increase your daily energy footprint.`);
        }
        if (qLower.includes("flight") || scores.mobility < 50) {
            reasons.push(`annual air travel accounts for direct high-altitude radiative forcing.`);
        }
        if (reasons.length === 0) {
            reasons.push("your footprint is relatively low! To drop it further, consider offsets or installing solar battery modules.");
        }
        
        reply = `According to your Digital Twin logs, your carbon footprint is projected at **${scores.currentTons} tons CO₂/yr**. The primary contributors are:\n\n* ` + reasons.join('\n* ') + `\n\nI recommend reviewing the Carbon Reduction Planner to identify easy offsets.`;
    } 
    else if (qLower.includes("ev") || qLower.includes("car")) {
        const savings = (scores.currentTons * 0.25).toFixed(2);
        reply = `**What-If EV Simulation Result:** Switching your primary vehicle from an internal combustion engine (ICE) to a **Full Electric Vehicle (EV)** would increase your Mobility Score to **95%** and reduce your total annual footprint by approx **${savings} tons CO₂** (assuming standard regional grid charging mix).`;
    } 
    else if (qLower.includes("tree") || qLower.includes("earth") || qLower.includes("density") || qLower.includes("canopy")) {
        reply = `**Google Earth Engine Analysis:** Your district canopy coverage is: **${profile.treeCanopyDensity}**. Urban areas with lower tree canopy density experience increased microclimate temperatures (heat islands). Planting 3 native trees near your property offset approximately **66 kg CO₂** annually.`;
    } 
    else {
        reply = `I have analyzed your digital twin metrics: Mobility score is ${scores.mobility}%, Energy score is ${scores.energy}%, and Food score is ${scores.food}%. Your current total is **${scores.currentTons} tons CO₂/year**. Try adjusting the sliders in the What-If panel to see real-time impact forecasts.`;
    }

    res.json({ reply });
});

module.exports = router;
