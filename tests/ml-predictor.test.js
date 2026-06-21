const test = require('node:test');
const assert = require('node:assert');
const mlPredictor = require('../services/ml-predictor');

test('ML Predictor Unit Tests', async (t) => {
    
    await t.test('Model Convergence and Training Structure', () => {
        assert.strictEqual(mlPredictor.isTrained, true, 'Model should be trained upon startup instantiation');
        assert.strictEqual(mlPredictor.weights.length, 11, 'Model should train on exactly 11 features');
        assert.strictEqual(typeof mlPredictor.bias, 'number', 'Model bias should be a numeric threshold');
    });

    await t.test('Z-Score Normalization parameters fit and scale correctly', () => {
        assert.strictEqual(mlPredictor.means.length, 11, 'Should compute mean values for 11 features');
        assert.strictEqual(mlPredictor.stds.length, 11, 'Should compute standard deviation values for 11 features');

        const testVector = [1, 3, 5, 10, 24, 72, 22, 0.5, 3, 2, 50];
        const scaled = mlPredictor.scaleFeatures(testVector);
        assert.strictEqual(scaled.length, 11, 'Scaled output vector must contain 11 scaled features');

        // Check normalization bounds
        for (let i = 0; i < scaled.length; i++) {
            assert.ok(!isNaN(scaled[i]), `Feature index ${i} should be a valid number`);
        }
    });

    await t.test('ML Emissions predictions behave consistently', () => {
        // High carbon input features
        const highCarbonFeatures = [
            0,   // evStatus = ICE
            0,   // plantBasedDays = Omnivore
            0,   // solarCapacitykW = None
            60,  // flightHours = Max
            18,  // acTempSetting = Very Low AC
            200, // localAqi = High Pollution
            90,  // pm2_5 = High Pollution
            0.8, // gridEmissionFactor = Dirty Grid
            0,   // transitDays = Direct Commute
            0,   // heatingType = Gas Furnace
            0    // wasteDivertedPercent = Landfill
        ];

        // Low carbon input features
        const lowCarbonFeatures = [
            2,   // evStatus = Full EV
            7,   // plantBasedDays = 100% Vegan
            10,  // solarCapacitykW = 10kW system
            0,   // flightHours = No flights
            28,  // acTempSetting = High AC setpoint
            10,  // localAqi = Clean Air
            4,   // pm2_5 = Clean Air
            0.1, // gridEmissionFactor = Renewable Grid
            7,   // transitDays = Public Transit Daily
            2,   // heatingType = Heat Pump
            100  // wasteDivertedPercent = 100% Zero-Waste
        ];

        const highResult = mlPredictor.predict(highCarbonFeatures);
        const lowResult = mlPredictor.predict(lowCarbonFeatures);

        assert.ok(highResult > lowResult, 'Dirty high carbon lifecycle predictions must score higher than clean low carbon lifecycles');
        assert.ok(lowResult > 0, 'Emissions scores should have a positive non-zero floor');
    });
});
