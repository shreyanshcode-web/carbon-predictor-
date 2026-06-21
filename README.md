# GreenMind AI - Personal Carbon Intelligence Platform

# What If Carbon Had a Notification?

Every day, our phones notify us about everything.

📧 New Email.
💬 New Message.
💰 Payment Received.
❤️ Someone liked your post.

But there is one thing we never get notified about:

🌍 The environmental cost of our actions.

What if every decision left a visible trace?

What if your morning commute, food delivery, streaming habits, electricity usage, and purchases collectively told a story?

Not a story about guilt.

A story about awareness.

---

# The Invisible Problem

Most people don't ignore sustainability because they don't care.

They ignore it because carbon emissions are invisible.

When you switch on an AC, book a cab, order food, or buy a product online, there is no immediate feedback loop.

You see the convenience.

You don't see the carbon.

And what remains invisible rarely changes behavior.

---

# Reimagining Carbon Awareness

Instead of building another carbon calculator, I designed a system that acts like a personal environmental co-pilot.

The platform continuously translates daily activities into understandable environmental impact.

Not:

"You emitted 8.7 kg of CO₂ today."

But:

"Taking the metro instead of a cab this week could reduce your monthly emissions by 18%."

The goal is not measurement.

The goal is behavior change.

---

# From Data to Decisions

The platform combines:

🛰️ Geospatial intelligence from Google Maps and Earth data

🤖 AI-powered recommendation systems

☁️ Cloud-native scalability using Google Cloud

📊 Personalized sustainability analytics

🎯 Action-oriented carbon reduction plans

Every interaction is designed to answer one simple question:

"What is the next best action I can take today?"

---

# The Carbon Mirror

Think of this platform as a mirror.

Not a mirror that reflects your appearance.

A mirror that reflects your environmental footprint.

For the first time, users can see the hidden consequences of everyday choices and discover practical alternatives that fit their lifestyle.

Because awareness creates understanding.

Understanding creates action.

And action creates impact.

---

# The Vision

The future of sustainability isn't about forcing people to care.

It's about making environmental impact impossible to ignore.

If social media can influence behavior,
if navigation apps can influence movement,
then technology can also influence sustainability.

One decision.

One recommendation.

One habit.

One ton of carbon at a time.

🌱 Building a future where every choice comes with environmental awareness.

---

## 🛠️ Technical Solution: How We Solved the Problem

GreenMind AI is an interactive, premium carbon tracking dashboard that creates a "Digital Twin" of a user's carbon footprint. It utilizes live geolocation and air quality telemetry, integrates with Google's Gemini 3.5 Flash API to generate structured sustainability recommendations, and runs a custom machine learning model on the backend for multi-variable emission forecasting.

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

## ⚙️ Quick Start

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
