/**
 * GreenMind AI - Machine Learning Prediction Engine
 * Custom Multi-Variable Linear Regression with Z-Score Normalization
 * Trained via Batch Gradient Descent on 11 lifestyle + environmental features.
 */

class CarbonPredictorML {
    constructor() {
        this.weights = [];
        this.bias = 0.0;
        this.means = [];
        this.stds = [];
        this.isTrained = false;
    }

    /**
     * Generates a synthetic dataset for training.
     * Incorporates 11 lifestyle choices, AQI, PM2.5, regional grid emissions, transit, heating, and waste diversion.
     */
    generateSyntheticData() {
        const dataset = [];
        for (let i = 0; i < 600; i++) {
            // Feature Ranges
            const evStatus = Math.floor(Math.random() * 3); // 0: ICE, 1: Hybrid, 2: EV
            const plantBasedDays = Math.floor(Math.random() * 8); // 0 to 7 days
            const solarCapacitykW = Math.random() * 10; // 0 to 10 kW
            const flightHours = Math.random() * 60; // 0 to 60 hours/yr
            const acTempSetting = 18 + Math.random() * 12; // 18 to 30 C
            const localAqi = Math.random() * 200; // 0 to 200 AQI
            const pm2_5 = localAqi * 0.4 + Math.random() * 15; // PM2.5 correlated to AQI
            const gridEmissionFactor = 0.15 + Math.random() * 0.65; // 0.15 to 0.8 kg CO2/kWh
            
            // New Parameters
            const transitDays = Math.floor(Math.random() * 8); // 0 to 7 days/wk
            const heatingType = Math.floor(Math.random() * 3); // 0: Gas Furnace, 1: Electric Baseboard, 2: Heat Pump
            const wasteDivertedPercent = Math.random() * 100; // 0% to 100%

            // Ground truth calculation based on IEA/IPCC baseline coefficients + environmental factors
            let carbonTons = 0.0;
            
            // 1. Mobility (replaces driving commutes with public transit savings)
            let transportFactor = 0.192; // ICE average
            if (evStatus === 1) transportFactor = 0.115;
            if (evStatus === 2) transportFactor = 0.022;
            
            let annualDriveDistance = Math.max(2000, 12000 - (transitDays * 12 * 52)); // replaces drive distance
            let mobilityCO2 = annualDriveDistance * transportFactor;
            
            // Add public transit emissions for replaced commutes (approx 0.045 kg/km)
            let transitDistance = transitDays * 12 * 52;
            mobilityCO2 += transitDistance * 0.045;
            mobilityCO2 += flightHours * 90.0; // flight hours
            carbonTons += mobilityCO2 / 1000;

            // 2. Home Energy (affected by heating types and solar)
            let houseElectricity = 4200; // 4200 kWh/yr baseline
            
            // Add heating type electric load or direct gas emissions
            let directGasHeatingCO2 = 0;
            if (heatingType === 0) {
                // Gas furnace: direct fossil fuel thermal emissions
                directGasHeatingCO2 = 1200; 
            } else if (heatingType === 1) {
                // Electric Baseboard (less efficient): draws ~2400 kWh electricity
                houseElectricity += 2400;
            } else if (heatingType === 2) {
                // Heat Pump (3x more efficient): draws only ~800 kWh electricity
                houseElectricity += 800;
            }

            let solarOffset = solarCapacitykW * 1300;
            let netElectricity = Math.max(0, houseElectricity - solarOffset);
            let energyCO2 = netElectricity * gridEmissionFactor + directGasHeatingCO2;

            // AC cooling correction
            if (acTempSetting < 25) {
                const coolingHours = 1200;
                const tempDiff = 25 - acTempSetting;
                energyCO2 += tempDiff * 0.15 * coolingHours;
            }
            carbonTons += energyCO2 / 1000;

            // 3. Food
            const veganDays = plantBasedDays;
            const meatDays = 7 - veganDays;
            const avgDailyFoodCO2 = ((veganDays * 1.90) + (meatDays * 6.20)) / 7;
            carbonTons += (avgDailyFoodCO2 * 365) / 1000;

            // 4. Waste & Environmental AQI Penalty
            // Diverting waste reduces the baseline 450 kg CO2/yr
            let wasteCO2 = Math.max(60.0, 450.0 * (1 - wasteDivertedPercent / 100));
            
            // High local AQI adds standard ambient overhead (more HVAC scrubbing, air purifiers, etc.)
            let environmentalOverhead = (localAqi * 0.003) + (pm2_5 * 0.005);
            carbonTons += (wasteCO2 / 1000) + environmentalOverhead;

            // Add normal noise
            const noise = (Math.random() - 0.5) * 0.15;
            carbonTons = Math.max(0.3, carbonTons + noise);

            dataset.push({
                features: [
                    evStatus,
                    plantBasedDays,
                    solarCapacitykW,
                    flightHours,
                    acTempSetting,
                    localAqi,
                    pm2_5,
                    gridEmissionFactor,
                    transitDays,
                    heatingType,
                    wasteDivertedPercent
                ],
                target: carbonTons
            });
        }
        return dataset;
    }

    /**
     * Standardizes features using Z-score normalization.
     */
    fitAndTransform(dataset) {
        const numSamples = dataset.length;
        const numFeatures = dataset[0].features.length;

        // Initialize means and stds
        this.means = new Array(numFeatures).fill(0);
        this.stds = new Array(numFeatures).fill(0);

        // Compute means
        for (let j = 0; j < numFeatures; j++) {
            let sum = 0;
            for (let i = 0; i < numSamples; i++) {
                sum += dataset[i].features[j];
            }
            this.means[j] = sum / numSamples;
        }

        // Compute standard deviations
        for (let j = 0; j < numFeatures; j++) {
            let varianceSum = 0;
            for (let i = 0; i < numSamples; i++) {
                varianceSum += Math.pow(dataset[i].features[j] - this.means[j], 2);
            }
            this.stds[j] = Math.sqrt(varianceSum / numSamples) || 1.0;
        }

        // Transform features
        const scaledFeatures = [];
        const targets = [];
        for (let i = 0; i < numSamples; i++) {
            const scaled = dataset[i].features.map((val, idx) => (val - this.means[idx]) / this.stds[idx]);
            scaledFeatures.push(scaled);
            targets.push(dataset[i].target);
        }

        return { scaledFeatures, targets };
    }

    /**
     * Scale a single feature vector based on fitted parameters.
     */
    scaleFeatures(features) {
        return features.map((val, idx) => (val - this.means[idx]) / this.stds[idx]);
    }

    /**
     * Trains the model using Batch Gradient Descent.
     */
    train(epochs = 1200, lr = 0.03) {
        console.log("[ML-ENGINE] Commencing expanded 11-feature training synthesis...");
        const dataset = this.generateSyntheticData();
        const { scaledFeatures, targets } = this.fitAndTransform(dataset);

        const numSamples = scaledFeatures.length;
        const numFeatures = scaledFeatures[0].length;

        // Initialize weights and bias
        this.weights = new Array(numFeatures).fill(0).map(() => Math.random() * 0.1 - 0.05);
        this.bias = 0.0;

        console.log("[ML-ENGINE] Initiating Batch Gradient Descent training for 11 features...");

        for (let epoch = 1; epoch <= epochs; epoch++) {
            let totalLoss = 0.0;
            const weightGradients = new Array(numFeatures).fill(0);
            let biasGradient = 0.0;

            for (let i = 0; i < numSamples; i++) {
                const xi = scaledFeatures[i];
                const yi = targets[i];

                let prediction = this.bias;
                for (let j = 0; j < numFeatures; j++) {
                    prediction += this.weights[j] * xi[j];
                }

                const error = prediction - yi;
                totalLoss += Math.pow(error, 2);

                for (let j = 0; j < numFeatures; j++) {
                    weightGradients[j] += error * xi[j];
                }
                biasGradient += error;
            }

            for (let j = 0; j < numFeatures; j++) {
                this.weights[j] -= lr * (weightGradients[j] / numSamples);
            }
            this.bias -= lr * (biasGradient / numSamples);

            const mse = totalLoss / (2 * numSamples);
            if (epoch % 300 === 0 || epoch === epochs) {
                console.log(`[ML-ENGINE] Epoch ${epoch}/${epochs} - MSE: ${mse.toFixed(5)}`);
            }
        }

        this.isTrained = true;
        console.log("[ML-ENGINE] Expanded model trained successfully.");
        console.log(`[ML-ENGINE] Weights: [${this.weights.map(w => w.toFixed(4)).join(', ')}]`);
        console.log(`[ML-ENGINE] Bias: ${this.bias.toFixed(4)}`);
    }

    /**
     * Predict carbon emissions for a given set of raw features.
     */
    predict(rawFeatures) {
        if (!this.isTrained) {
            this.train();
        }

        const scaled = this.scaleFeatures(rawFeatures);
        let prediction = this.bias;
        for (let j = 0; j < scaled.length; j++) {
            prediction += this.weights[j] * scaled[j];
        }
        return parseFloat(Math.max(0.1, prediction).toFixed(2));
    }
}

// Singleton pattern export
const predictorInstance = new CarbonPredictorML();
predictorInstance.train();

module.exports = predictorInstance;
