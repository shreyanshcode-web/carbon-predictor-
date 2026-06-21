# GreenMind AI - Personal Carbon Intelligence Platform

GreenMind AI is an interactive, premium carbon tracking dashboard that creates a "Digital Twin" of a user's carbon footprint. It utilizes live geolocation and air quality telemetry, integrates with Google's Gemini 3.5 Flash API to generate structured sustainability recommendations, and runs a custom machine learning model on the backend for multi-variable emission forecasting.

---

## 🌟 How We Solved the Problem

To transition this platform from a static mockup to a live, production-ready, GCP-compatible application, we implemented the following technical solutions:

### 1. Backend Machine Learning Predictor (11-Feature Model)
We implemented a custom, zero-dependency **Multi-Variable Linear Regression Model** in pure JavaScript (`services/ml-predictor.js`). This avoids heavy Python/C++ binary compilation issues on Windows while supplying genuine, high-performance training.
* **Feature Vector (11 Parameters)**: Maps `[EV Status, Plant-Based Diet Days, Solar Capacity, Flight Hours, AC Temperature, Local AQI, PM2.5, Grid Emission Factor, Transit Days, Heating System Type, Waste Diversion Rate]`.
* **Normalization**: Applies **Z-score standardization** to feature values.
* **Optimization**: Trains using **Batch Gradient Descent** on startup over a synthetic dataset of 600 user records (converging to a Mean Squared Error of ~0.174).
* **Grid Emission Mapping**: Computes continuous local grid carbon intensity (kg CO₂/kWh) using the user's geographic coordinates.

### 2. Live Weather API & Browser Geolocation
* We integrated browser-based GPS coordinate detection (`navigator.geolocation`) on signup.
* We connected the backend to the free, no-API-key-required **Open-Meteo Air Quality API**. On profile loading or user signup, the app pulls live local Air Quality Index (AQI) and PM2.5 measurements, dynamically feeding them into the ML engine to refine the baseline carbon output.
* Displays a live color-coded AQI status badge in the header.

### 3. Google Gemini API Structured Recommendations
* We upgraded the recommendation engine (`services/recommendation-engine.js`) to interface with Google's `@google/generative-ai` SDK.
* It uses **Gemini 1.5 Flash** with strict schema enforcement (`responseMimeType: "application/json"` and `responseSchema`) to guarantee recommendations are returned as standard JSON arrays containing IDs, categories, impact statistics, and custom descriptions.
* Includes a **graceful fallback** to a rule-based advisor if no API key is configured.

### 4. Premium User Auth Overlay
* Created a sleek glassmorphism authentication modal in `index.html` that toggles between Login and Signup.
* Created `/login` and `/register` endpoints in `services/user-service.js` to manage user profiles in the Firestore mock database, unlocking the dashboard only when a user successfully authenticates.

---

## 🚀 Google Cloud & CI/CD Readiness

* **Dynamic API Paths**: Modified the frontend API base URL to resolve dynamically to `window.location.origin`, allowing it to communicate with the backend whether hosted on `localhost` or a GCP container.
* **Cloud Run Config**: Added a production-ready **[Dockerfile](Dockerfile)** and **[.dockerignore](.dockerignore)** to package the Node.js Express service.
* **Continuous Delivery**: Added **[.github/workflows/deploy.yml](.github/workflows/deploy.yml)** to enable automatic deployments to GCP Cloud Run via GitHub Actions on every push to the `main` branch.

---

## 🛠️ Quick Start

### Local Development
1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=3000
   ```
3. Start the local server:
   ```bash
   npm start
   ```
4. Open **`http://localhost:3000`** in your browser.

### Cloud Run Deployment
Deploy the container directly to GCP:
```bash
gcloud run deploy greenmind-ai --source .
```
