const express = require('express');
const router = express.Router();
const mlPredictor = require('./ml-predictor');

// IEA & IPCC Global Emission Factors Database coefficients
const CARBON_FACTORS = {
    mobility: {
        ice_car: 0.192,  // kg CO2 per km (IPCC average passenger vehicle)
        hybrid: 0.115,   // kg CO2 per km
        ev: 0.022,       // kg CO2 per km (average grid charging source)
        transit: 0.045,  // kg CO2 per passenger km (bus/metro)
        flight: 90.0     // kg CO2 per hour of flight
    },
    energy: {
        electricity_grid: 0.384, // kg CO2 per kWh (IEA average power generation)
        natural_gas: 0.202,     // kg CO2 per kWh thermal
        ac_per_degree_hour: 0.15 // kg CO2 hourly per degree below 25°C
    },
    food: {
        omnivore_day: 6.20,      // kg CO2 per day standard meat diet (IPCC)
        flexitarian_day: 3.80,   // kg CO2 per day reduced meat
        vegan_day: 1.90          // kg CO2 per day fully plant-based
    }
};

/**
 * Maps latitude/longitude to a realistic grid emission factor (kg CO2/kWh)
 */
function getGridEmissionFactor(lat, lng) {
    let factor = 0.384; // base average
    
    // Europe grid (cleaner)
    if (lat > 35 && lat < 70 && lng > -10 && lng < 30) {
        factor = 0.220;
    }
    // US Midwest / coal-heavy grid
    else if (lat > 30 && lat < 50 && lng > -95 && lng < -75) {
        factor = 0.480;
    }
    // US West Coast (cleaner hydro/solar mix)
    else if (lat > 32 && lat < 49 && lng > -125 && lng < -114) {
        factor = 0.280;
    }

    const wave = Math.sin(lat) * Math.cos(lng) * 0.04;
    return parseFloat((factor + wave).toFixed(3));
}

/**
 * [MARKING]: CLOUD_RUN_CARBON_ENGINE_CALCULATE
 * [DESCRIPTION]: Ingests activity parameters and applies emission database coefficients.
 * [PARAMS]: Express request body with mobility, energy, food, and waste activity levels
 * [RETURNS]: Calculated carbon metrics in kg and tons
 */
router.post('/calculate', (req, res) => {
    console.log("[CARBON-ENGINE] Ingesting activity vectors for ML evaluation.");
    const { 
        evStatus, 
        plantBasedDays, 
        solarCapacitykW, 
        flightHours, 
        acTempSetting, 
        baseProfile,
        plannerModifiers,
        latitude,
        longitude,
        aqi,
        pm2_5,
        transitDays,
        heatingType,
        wasteDivertedPercent
    } = req.body;

    // Default coordinates if not provided
    const lat = latitude !== undefined ? parseFloat(latitude) : 37.7749;
    const lng = longitude !== undefined ? parseFloat(longitude) : -122.4194;
    const currentAqi = aqi !== undefined ? parseFloat(aqi) : 50;
    const currentPm = pm2_5 !== undefined ? parseFloat(pm2_5) : 15;
    const gridEmissionFactor = getGridEmissionFactor(lat, lng);

    const currentTransitDays = transitDays !== undefined ? parseInt(transitDays) : 0;
    const currentHeatingType = heatingType !== undefined ? parseInt(heatingType) : 0;
    const currentWasteDivertedPercent = wasteDivertedPercent !== undefined ? parseFloat(wasteDivertedPercent) : 20;

    // Run custom Multi-Variable ML Predictor (11 features)
    const features = [
        evStatus,
        plantBasedDays,
        solarCapacitykW,
        flightHours,
        acTempSetting,
        currentAqi,
        currentPm,
        gridEmissionFactor,
        currentTransitDays,
        currentHeatingType,
        currentWasteDivertedPercent
    ];
    const predictedTotalTons = mlPredictor.predict(features);

    // Partition elements proportionally to preserve individual breakdown visuals
    // 1. Mobility Calculations
    let transportFactor = CARBON_FACTORS.mobility.ice_car;
    if (evStatus === 1) transportFactor = CARBON_FACTORS.mobility.hybrid;
    if (evStatus === 2) transportFactor = CARBON_FACTORS.mobility.ev;

    const travelDistance = Math.max(2000, 12000 - (currentTransitDays * 12 * 52));
    let mobilityCO2 = travelDistance * transportFactor;
    mobilityCO2 += (currentTransitDays * 12 * 52) * CARBON_FACTORS.mobility.transit;
    mobilityCO2 += flightHours * CARBON_FACTORS.mobility.flight;

    // 2. Home Energy Calculations
    let houseElectricity = 4200;
    let directGasHeatingCO2 = 0;
    if (currentHeatingType === 0) {
        directGasHeatingCO2 = 1200;
    } else if (currentHeatingType === 1) {
        houseElectricity += 2400;
    } else if (currentHeatingType === 2) {
        houseElectricity += 800;
    }
    let solarGeneration = solarCapacitykW * 1300;
    let netElectricity = Math.max(0, houseElectricity - solarGeneration);
    let energyCO2 = netElectricity * gridEmissionFactor + directGasHeatingCO2;

    if (acTempSetting < 25) {
        const coolingHours = 1200;
        const tempDiff = 25 - acTempSetting;
        energyCO2 += tempDiff * CARBON_FACTORS.energy.ac_per_degree_hour * coolingHours;
    }

    // 3. Food Calculations
    const veganDays = plantBasedDays;
    const meatDays = 7 - veganDays;
    const avgDailyFoodCO2 = ((veganDays * CARBON_FACTORS.food.vegan_day) + (meatDays * CARBON_FACTORS.food.omnivore_day)) / 7;
    const foodCO2 = avgDailyFoodCO2 * 365;

    // 4. Waste Calculations
    let wasteCO2 = Math.max(60.0, 450.0 * (1 - currentWasteDivertedPercent / 100));

    // Apply planner checklist savings if completed
    let plannedSavings = 0;
    if (plannerModifiers) {
        plannerModifiers.forEach(task => {
            if (task.completed) {
                plannedSavings += task.co2Saved * 52;
            }
        });
    }

    const netMobilityTons = parseFloat((mobilityCO2 / 1000).toFixed(2));
    const netEnergyTons = parseFloat((energyCO2 / 1000).toFixed(2));
    const netFoodTons = parseFloat((foodCO2 / 1000).toFixed(2));
    const netWasteTons = parseFloat((wasteCO2 / 1000).toFixed(2));

    let computedSum = netMobilityTons + netEnergyTons + netFoodTons + netWasteTons;
    if (computedSum === 0) computedSum = 1;

    // Scale components to sum up to ML predicted value
    const scale = predictedTotalTons / computedSum;
    const finalMobilityTons = parseFloat((netMobilityTons * scale).toFixed(2));
    const finalEnergyTons = parseFloat((netEnergyTons * scale).toFixed(2));
    const finalFoodTons = parseFloat((netFoodTons * scale).toFixed(2));
    const finalWasteTons = parseFloat((netWasteTons * scale).toFixed(2));

    const totalAnnualTons = predictedTotalTons;
    const targetAnnualTons = parseFloat(Math.max(0.5, (totalAnnualTons * 1000 - plannedSavings) / 1000).toFixed(2));

    res.json({
        mobilityTons: finalMobilityTons,
        energyTons: finalEnergyTons,
        foodTons: finalFoodTons,
        wasteTons: finalWasteTons,
        currentTotalTons: totalAnnualTons,
        targetTotalTons: targetAnnualTons,
        savingsKg: Math.round(Math.max(0, totalAnnualTons - targetAnnualTons) * 1000)
    });
});

module.exports = router;
