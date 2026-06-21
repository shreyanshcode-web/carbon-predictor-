/**
 * GreenMind AI - Application Logic, Interactive UI Orchestrator, & API Coordinator
 * Theme: Carbon Intelligence Platform Orchestrator
 */

// ==========================================================================
// Application State
// ==========================================================================
const appState = {
    currentProfile: 'sarah',
    timeScaleDays: 30,
    apiBase: window.location.origin + '/api',
    isServerOnline: false,
    currentUser: null,
    userLocation: {
        latitude: 37.7749,
        longitude: -122.4194,
        city: 'San Francisco'
    },
    aqi: 50,
    pm2_5: 15,
    
    // Core Modifiers from What-If Simulator
    whatIf: {
        evStatus: 0, // 0 = ICE, 1 = Hybrid, 2 = Full EV
        plantBasedDays: 0, // 0 to 7 days
        solarCapacitykW: 0, // 0 to 10 kW
        flightHours: 15, // 0 to 60 hours
        acTempSetting: 24, // 18 to 30 deg C
        transitDays: 0, // 0 to 7 days
        heatingType: 0, // 0: Gas Furnace, 1: Electric, 2: Heat Pump
        wasteDivertedPercent: 20 // 0 to 100 percent
    },

    // Carbon Planner Progress
    plannerTasks: [
        { id: 'commute', title: 'Smart Commuting', desc: 'Replace 2 weekday commutes with public transport', impact: '-18 kg CO2/wk', co2Saved: 18, completed: false, category: 'mobility' },
        { id: 'diet', title: 'Meat Reduction', desc: 'Replace 3 beef/pork meals with plant-based alternatives', impact: '-12 kg CO2/wk', co2Saved: 12, completed: false, category: 'food' },
        { id: 'ac', title: 'Thermostat Setback', desc: 'Set AC to 25°C instead of 22°C', impact: '-8 kg CO2/wk', co2Saved: 8, completed: false, category: 'energy' },
        { id: 'solar', title: 'Renewable Power Shift', desc: 'Use energy during peak solar production hours', impact: '-15 kg CO2/wk', co2Saved: 15, completed: false, category: 'energy' }
    ],

    // Unlocked Achievements/Badges
    unlockedBadges: [],

    // Base Profile fallback structures (used if server is offline)
    profiles: {
        sarah: {
            name: "Sarah",
            type: "Urban Commuter",
            treeCanopyDensity: "Medium (15% coverage)",
            localTransportQuality: "High (Subway/Busses near 200m)",
            baseMetrics: {
                mobility_score: 72,
                energy_score: 81,
                food_score: 65,
                waste_score: 54
            },
            history: {
                mobility: [
                    { name: 'Commute to Office', distance: '12 km', mode: 'ICE Vehicle', co2: '2.30' },
                    { name: 'Grocery Run', distance: '3 km', mode: 'ICE Vehicle', co2: '0.58' },
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
            name: "David",
            type: "Suburban Homeowner",
            treeCanopyDensity: "High (35% coverage)",
            localTransportQuality: "Low (Car-dependent, no subway)",
            baseMetrics: {
                mobility_score: 42,
                energy_score: 48,
                food_score: 45,
                waste_score: 38
            },
            history: {
                mobility: [
                    { name: 'Commute to Office', distance: '35 km', mode: 'ICE SUV', co2: '8.40' },
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
            name: "Elena",
            type: "Off-grid Enthusiast",
            treeCanopyDensity: "Dense (55% coverage)",
            localTransportQuality: "Medium (Bike lanes present)",
            baseMetrics: {
                mobility_score: 95,
                energy_score: 94,
                food_score: 90,
                waste_score: 88
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
    }
};

// Canvas Particle Engine Variables for Confetti
let confettiActive = false;
const confettiParticles = [];
const confettiColors = ['#10b981', '#34d399', '#67e8f9', '#facc15', '#f87171', '#a78bfa'];

// ==========================================================================
// Function Implementations (With Markings)
// ==========================================================================

/**
 * [MARKING]: APP_INIT_SERVICE
 * [DESCRIPTION]: Initializes application nodes, sets up server health checking, binds events, and prints telemetry triggers.
 * [PARAMS]: None
 * [RETURNS]: void
 */
function initApp() {
    console.log("[TELEMETRY - APP_INIT_SERVICE] Triggering GreenMind AI Platform bootstrap.");
    logTelemetry('system', 'GreenMind AI Platform bootstrap initiated.');
    setupEventListeners();
    setupConfettiCanvas();
    checkServerHealth().then(() => {
        loadProfile(appState.currentProfile);
    });
}

/**
 * [MARKING]: API_HEALTH_CHECK
 * [DESCRIPTION]: Sends lightweight request to gateway to determine if API is reachable. Sets fallback mode if offline.
 * [PARAMS]: None
 * [RETURNS]: Promise<void>
 */
async function checkServerHealth() {
    logTelemetry('gateway', 'Initiating connection test to local API Gateway...');
    try {
        const response = await fetch(`${appState.apiBase}/users/sarah`);
        if (response.ok) {
            appState.isServerOnline = true;
            logTelemetry('gateway', 'Connection established. Routing API Gateway active.');
            document.querySelector(".connection-status .status-text").textContent = "GCP Cloud Run Services Linked";
            document.querySelector(".connection-status .status-dot").className = "status-dot online";
        }
    } catch (e) {
        appState.isServerOnline = false;
        logTelemetry('system', 'Microservice API Gateway offline. Local execution engine activated.');
        document.querySelector(".connection-status .status-text").textContent = "Standalone Offline Mode";
        document.querySelector(".connection-status .status-dot").className = "status-dot";
    }
}

/**
 * [MARKING]: CLOUD_RUN_TELEMETRY_LOG
 * [DESCRIPTION]: Prints real-time microservices log statements into the terminal UI element.
 * [PARAMS]: {string} service - Service identity, {string} msg - Log content
 * [RETURNS]: void
 */
function logTelemetry(service, msg) {
    const consoleBody = document.getElementById("telemetryConsole");
    if (!consoleBody) return;

    const line = document.createElement("div");
    line.className = `console-line ${service}`;
    
    const timestamp = new Date().toLocaleTimeString();
    line.textContent = `[${timestamp}] [GCP-${service.toUpperCase()}] ${msg}`;
    
    consoleBody.appendChild(line);
    
    // Maintain maximum 40 log lines to keep layout clean
    while (consoleBody.childNodes.length > 40) {
        consoleBody.removeChild(consoleBody.firstChild);
    }
    
    // Auto-scroll console
    consoleBody.scrollTop = consoleBody.scrollHeight;
}

/**
 * [MARKING]: CANVAS_CONFETTI_SETUP
 * [DESCRIPTION]: Resolves canvas dimensions and binds window resizing listeners.
 * [PARAMS]: None
 * [RETURNS]: void
 */
function setupConfettiCanvas() {
    const canvas = document.getElementById("confettiCanvas");
    if (!canvas) return;

    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
}

/**
 * [MARKING]: CANVAS_CONFETTI_EXPLOSION
 * [DESCRIPTION]: Instantiates 100 particles at the viewport center and triggers the animation render loop.
 * [PARAMS]: None
 * [RETURNS]: void
 */
function runConfettiExplosion() {
    const canvas = document.getElementById("confettiCanvas");
    if (!canvas) return;

    console.log("[TELEMETRY - CANVAS_CONFETTI_EXPLOSION] Triggering accomplishment confetti particle burst.");
    
    // Spawn particles
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    for (let i = 0; i < 90; i++) {
        confettiParticles.push({
            x: centerX,
            y: centerY,
            vx: (Math.random() - 0.5) * 15,
            vy: (Math.random() - 0.5) * 15 - 5,
            size: Math.random() * 8 + 6,
            color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 10,
            alpha: 1.0
        });
    }

    if (!confettiActive) {
        confettiActive = true;
        requestAnimationFrame(confettiLoop);
    }
}

/**
 * [MARKING]: CANVAS_CONFETTI_TICKER
 * [DESCRIPTION]: Animation frame loop that updates physics vectors (gravity, air friction) and draws particles.
 * [PARAMS]: None
 * [RETURNS]: void
 */
function confettiLoop() {
    const canvas = document.getElementById("confettiCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = confettiParticles.length - 1; i >= 0; i--) {
        const p = confettiParticles[i];
        
        // Physics logic
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25; // gravity
        p.vx *= 0.98; // drag
        p.rotation += p.rotationSpeed;
        p.alpha -= 0.012; // fade

        // Render particle
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();

        // Cleanup out-of-screen or faded particles
        if (p.alpha <= 0 || p.y > canvas.height) {
            confettiParticles.splice(i, 1);
        }
    }

    if (confettiParticles.length > 0) {
        requestAnimationFrame(confettiLoop);
    } else {
        confettiActive = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

/**
 * [MARKING]: TRANSACTION_INGESTION_SIMULATOR
 * [DESCRIPTION]: Generates a random banking expense (UPI/card), auto-classifies carbon parameters, and appends to data.
 * [PARAMS]: None
 * [RETURNS]: void
 */
function simulateTransaction() {
    console.log("[TELEMETRY - TRANSACTION_INGESTION_SIMULATOR] Generating mock banking transaction trigger.");
    
    const txnPool = [
        { merchant: 'Uber Pool Ride', amount: '$14.20', category: 'transport', co2: '1.4' },
        { merchant: 'Starbucks Coffee', amount: '$6.50', category: 'food', co2: '0.4' },
        { merchant: 'McDonalds Drive', amount: '$18.80', category: 'food', co2: '3.8' },
        { merchant: 'Airbnb Booking', amount: '$145.00', category: 'shopping', co2: '12.6' },
        { merchant: 'PG&E Smart Meter Grid', amount: '$85.00', category: 'utilities', co2: '24.1' },
        { merchant: 'Local Farmer Co-op', amount: '$32.00', category: 'food', co2: '0.1' },
        { merchant: 'Shell Gasoline Fuel', amount: '$52.00', category: 'transport', co2: '22.8' }
    ];

    const randomTx = txnPool[Math.floor(Math.random() * txnPool.length)];
    const profile = appState.profiles[appState.currentProfile];
    
    // Ingest transaction
    profile.history.transactions.unshift(randomTx); // push to top

    logTelemetry('gateway', `POST /api/consumption/transactions - 201 Created.`);
    logTelemetry('engine', `Transaction classified: ${randomTx.merchant} -> [Category: ${randomTx.category.toUpperCase()}]. Computed: +${randomTx.co2} kg CO₂.`);
    
    triggerToast("Expense Auto-Classified", `${randomTx.merchant} (${randomTx.amount}) generated +${randomTx.co2} kg CO₂ footprint.`, "💳");
    
    updateDashboard();
}

/**
 * [MARKING]: EVENT_LISTENER_COORDINATOR
 * [DESCRIPTION]: Connects interactive browser inputs (sliders, profile selects, check boxes, forms) to state updators.
 * [PARAMS]: None
 * [RETURNS]: void
 */
function setupEventListeners() {
    console.log("[TELEMETRY - EVENT_LISTENER_COORDINATOR] Connecting interface event triggers.");
    
    // Auth Toggles & Handlers
    const toSignupBtn = document.getElementById("toSignupBtn");
    const toLoginBtn = document.getElementById("toLoginBtn");
    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");
    const detectBtn = document.getElementById("detectLocationBtn");
    const logoutBtn = document.getElementById("logoutBtn");

    if (toSignupBtn) {
        toSignupBtn.addEventListener("click", (e) => {
            e.preventDefault();
            loginForm.classList.add("hidden");
            signupForm.classList.remove("hidden");
        });
    }

    if (toLoginBtn) {
        toLoginBtn.addEventListener("click", (e) => {
            e.preventDefault();
            signupForm.classList.add("hidden");
            loginForm.classList.remove("hidden");
        });
    }

    if (loginForm) loginForm.addEventListener("submit", handleAuthLogin);
    if (signupForm) signupForm.addEventListener("submit", handleAuthSignup);
    if (detectBtn) detectBtn.addEventListener("click", detectUserLocation);
    if (logoutBtn) logoutBtn.addEventListener("click", logoutUser);

    // Profile Switcher
    const profileSelect = document.getElementById("profileSelect");
    if (profileSelect) {
        profileSelect.addEventListener("change", (e) => {
            loadProfile(e.target.value);
        });
    }

    // Forecast Timescale Buttons
    const timescaleButtons = document.querySelectorAll(".time-btn");
    timescaleButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            timescaleButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            appState.timeScaleDays = parseInt(btn.dataset.days);
            logTelemetry('gateway', `POST /api/prediction/forecast?timescale=${appState.timeScaleDays}`);
            updateDashboard();
        });
    });

    // What-If Sliders
    const evSlider = document.getElementById("simEvSlider");
    const dietSlider = document.getElementById("simDietSlider");
    const solarSlider = document.getElementById("simSolarSlider");
    const flightSlider = document.getElementById("simFlightSlider");
    const transitSlider = document.getElementById("simTransitSlider");
    const heatingSlider = document.getElementById("simHeatingSlider");
    const wasteSlider = document.getElementById("simWasteSlider");
    
    if (evSlider) evSlider.addEventListener("input", updateSimulationValues);
    if (dietSlider) dietSlider.addEventListener("input", updateSimulationValues);
    if (solarSlider) solarSlider.addEventListener("input", updateSimulationValues);
    if (flightSlider) flightSlider.addEventListener("input", updateSimulationValues);
    if (transitSlider) transitSlider.addEventListener("input", updateSimulationValues);
    if (heatingSlider) heatingSlider.addEventListener("input", updateSimulationValues);
    if (wasteSlider) wasteSlider.addEventListener("input", updateSimulationValues);

    // AC Thermostat Slider (Home Energy Agent)
    const thermostatSlider = document.getElementById("thermostatSlider");
    if (thermostatSlider) {
        thermostatSlider.addEventListener("input", (e) => {
            appState.whatIf.acTempSetting = parseInt(e.target.value);
            const valLabel = document.getElementById("thermostatVal");
            if (valLabel) valLabel.textContent = `${appState.whatIf.acTempSetting}°C`;
            logTelemetry('engine', `Appliance-Agent: AC Thermostat set to ${appState.whatIf.acTempSetting}°C. Model recalibrated.`);
            updateDashboard();
        });
    }

    // Smart Meter Toggles
    const batteryToggle = document.getElementById("solarBatteryToggle");
    const peakToggle = document.getElementById("peakShiftToggle");
    if (batteryToggle) {
        batteryToggle.addEventListener("change", () => {
            logTelemetry('engine', `Home-Energy-Agent: Battery Solar Storage toggle changed to: ${batteryToggle.checked}`);
            updateDashboard();
        });
    }
    if (peakToggle) {
        peakToggle.addEventListener("change", () => {
            logTelemetry('engine', `Home-Energy-Agent: Load shifting toggle changed to: ${peakToggle.checked}`);
            updateDashboard();
        });
    }

    // Transaction Ingest simulator button
    const simTxBtn = document.getElementById("simulateTxBtn");
    if (simTxBtn) {
        simTxBtn.addEventListener("click", simulateTransaction);
    }

    // Chat Form Submit
    const chatForm = document.getElementById("chatForm");
    if (chatForm) {
        chatForm.addEventListener("submit", handleChatSubmit);
    }

    // Quick suggestion chat buttons
    const suggestButtons = document.querySelectorAll(".suggest-btn");
    suggestButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            const query = btn.dataset.query;
            const chatInput = document.getElementById("chatInput");
            if (chatInput) {
                chatInput.value = query;
                chatForm.dispatchEvent(new Event("submit", { cancelable: true }));
            }
        });
    });
}

/**
 * [MARKING]: PROFILE_MANAGER
 * [DESCRIPTION]: Loads a preset user profile from User Service (or fallback data store if offline), and resets sliders.
 * [PARAMS]: {string} profileId - Key identifying the profile
 * [RETURNS]: void
 */
async function loadProfile(profileId) {
    console.log(`[TELEMETRY - PROFILE_MANAGER] Loading profile structure: ${profileId}`);
    appState.currentProfile = profileId;
    
    let lat = 37.7749;
    let lng = -122.4194;
    let city = "San Francisco";

    // Default preset values representing specific profiles
    if (profileId === 'sarah') {
        appState.whatIf.evStatus = 0;
        appState.whatIf.plantBasedDays = 1;
        appState.whatIf.solarCapacitykW = 0;
        appState.whatIf.flightHours = 12;
        appState.whatIf.acTempSetting = 23;
        appState.whatIf.transitDays = 2;
        appState.whatIf.heatingType = 0;
        appState.whatIf.wasteDivertedPercent = 30;
        lat = 37.7749; lng = -122.4194; city = "San Francisco";
    } else if (profileId === 'david') {
        appState.whatIf.evStatus = 0;
        appState.whatIf.plantBasedDays = 0;
        appState.whatIf.solarCapacitykW = 0;
        appState.whatIf.flightHours = 25;
        appState.whatIf.acTempSetting = 21;
        appState.whatIf.transitDays = 0;
        appState.whatIf.heatingType = 0;
        appState.whatIf.wasteDivertedPercent = 15;
        lat = 41.8781; lng = -87.6298; city = "Chicago";
    } else if (profileId === 'elena') {
        appState.whatIf.evStatus = 2;
        appState.whatIf.plantBasedDays = 6;
        appState.whatIf.solarCapacitykW = 8;
        appState.whatIf.flightHours = 0;
        appState.whatIf.acTempSetting = 26;
        appState.whatIf.transitDays = 5;
        appState.whatIf.heatingType = 2;
        appState.whatIf.wasteDivertedPercent = 85;
        lat = 59.9139; lng = 10.7522; city = "Oslo";
    } else if (appState.currentUser && appState.currentUser.id === profileId) {
        // Custom registered user
        const u = appState.currentUser;
        lat = u.latitude;
        lng = u.longitude;
        city = u.city;
        
        // Use custom values
        appState.whatIf.evStatus = u.digitalTwin.mobility_score >= 80 ? 2 : (u.digitalTwin.mobility_score >= 60 ? 1 : 0);
        appState.whatIf.plantBasedDays = Math.round((u.digitalTwin.food_score - 55) / 4.5);
        appState.whatIf.solarCapacitykW = Math.round((u.digitalTwin.energy_score - 65) / 3.5);
        appState.whatIf.transitDays = 3;
        appState.whatIf.heatingType = 2;
        appState.whatIf.wasteDivertedPercent = 50;
    }

    // Fetch Air Quality index dynamically
    await fetchAirQuality(lat, lng, city);

    // Reset Planner tasks status
    appState.plannerTasks.forEach(task => task.completed = false);

    // Update Slider elements in DOM
    const evSlider = document.getElementById("simEvSlider");
    const dietSlider = document.getElementById("simDietSlider");
    const solarSlider = document.getElementById("simSolarSlider");
    const flightSlider = document.getElementById("simFlightSlider");
    const acSlider = document.getElementById("thermostatSlider");
    const transitSlider = document.getElementById("simTransitSlider");
    const heatingSlider = document.getElementById("simHeatingSlider");
    const wasteSlider = document.getElementById("simWasteSlider");

    if (evSlider) evSlider.value = appState.whatIf.evStatus;
    if (dietSlider) dietSlider.value = appState.whatIf.plantBasedDays;
    if (solarSlider) solarSlider.value = appState.whatIf.solarCapacitykW;
    if (flightSlider) flightSlider.value = appState.whatIf.flightHours;
    if (acSlider) acSlider.value = appState.whatIf.acTempSetting;
    if (transitSlider) transitSlider.value = appState.whatIf.transitDays;
    if (heatingSlider) heatingSlider.value = appState.whatIf.heatingType;
    if (wasteSlider) wasteSlider.value = appState.whatIf.wasteDivertedPercent;

    const acValLabel = document.getElementById("thermostatVal");
    if (acValLabel) acValLabel.textContent = `${appState.whatIf.acTempSetting}°C`;

    // Sync HTML select dropdown if updated externally
    const select = document.getElementById("profileSelect");
    if (select) select.value = profileId;

    updateSimulationLabels();

    // Query backend API if online
    if (appState.isServerOnline) {
        logTelemetry('gateway', `GET /api/users/${profileId} - Request forwarded to User Service.`);
        try {
            const response = await fetch(`${appState.apiBase}/users/${profileId}`);
            if (response.ok) {
                const profileObj = await response.json();
                logTelemetry('users', `Firestore DB matched document. Returning Twin parameters.`);
                triggerToast("Sync Successful", `Fetched ${profileObj.name}'s digital twin from Firestore.`, "👤");
            }
        } catch (e) {
            logTelemetry('error', `Failed loading profile from User Service API.`);
        }
    } else {
        const profileObj = appState.profiles[profileId];
        logTelemetry('system', `Loaded profile context for ${profileObj.name} locally.`);
        triggerToast("Twin Switched", `Loaded ${profileObj.name}'s local digital twin details.`, "👤");
    }

    updateDashboard();
}

/**
 * [MARKING]: WHAT_IF_COORDINATOR
 * [DESCRIPTION]: Reads slider and toggle nodes, maps parameters to the state model, and initiates dashboard update.
 * [PARAMS]: None
 * [RETURNS]: void
 */
function updateSimulationValues() {
    const evSlider = document.getElementById("simEvSlider");
    const dietSlider = document.getElementById("simDietSlider");
    const solarSlider = document.getElementById("simSolarSlider");
    const flightSlider = document.getElementById("simFlightSlider");
    const transitSlider = document.getElementById("simTransitSlider");
    const heatingSlider = document.getElementById("simHeatingSlider");
    const wasteSlider = document.getElementById("simWasteSlider");

    if (evSlider) appState.whatIf.evStatus = parseInt(evSlider.value);
    if (dietSlider) appState.whatIf.plantBasedDays = parseInt(dietSlider.value);
    if (solarSlider) appState.whatIf.solarCapacitykW = parseInt(solarSlider.value);
    if (flightSlider) appState.whatIf.flightHours = parseInt(flightSlider.value);
    if (transitSlider) appState.whatIf.transitDays = parseInt(transitSlider.value);
    if (heatingSlider) appState.whatIf.heatingType = parseInt(heatingSlider.value);
    if (wasteSlider) appState.whatIf.wasteDivertedPercent = parseInt(wasteSlider.value);

    updateSimulationLabels();
    updateDashboard();
}

/**
 * [MARKING]: UX_LABEL_SYNC
 * [DESCRIPTION]: Formats raw integer simulation configurations to user-friendly text badges in the What-If card.
 * [PARAMS]: None
 * [RETURNS]: void
 */
function updateSimulationLabels() {
    const evVal = document.getElementById("simEvVal");
    const dietVal = document.getElementById("simDietVal");
    const solarVal = document.getElementById("simSolarVal");
    const flightVal = document.getElementById("simFlightVal");
    const transitVal = document.getElementById("simTransitVal");
    const heatingVal = document.getElementById("simHeatingVal");
    const wasteVal = document.getElementById("simWasteVal");

    if (evVal) {
        const evLabels = ["No EV (Gasoline)", "Hybrid Engine", "Full EV Mode"];
        evVal.textContent = evLabels[appState.whatIf.evStatus];
    }
    if (dietVal) {
        dietVal.textContent = `${appState.whatIf.plantBasedDays} days/wk`;
    }
    if (solarVal) {
        solarVal.textContent = appState.whatIf.solarCapacitykW > 0 ? `${appState.whatIf.solarCapacitykW} kW System` : "None";
    }
    if (flightVal) {
        flightVal.textContent = `${appState.whatIf.flightHours} Hours/yr`;
    }
    if (transitVal) {
        transitVal.textContent = appState.whatIf.transitDays > 0 ? `${appState.whatIf.transitDays} days/wk` : "None";
    }
    if (heatingVal) {
        const types = ["Gas Furnace", "Electric Baseboard", "Electric Heat Pump"];
        heatingVal.textContent = types[appState.whatIf.heatingType];
    }
    if (wasteVal) {
        wasteVal.textContent = `${appState.whatIf.wasteDivertedPercent}%`;
    }
}

/**
 * [MARKING]: REDUCTION_PLAN_CONTROLLER
 * [DESCRIPTION]: Toggles a task in the carbon reduction plan checklist and updates digital twin metrics.
 * [PARAMS]: {string} taskId - Key string matching the task entry ID
 * [RETURNS]: void
 */
function togglePlannerTask(taskId) {
    const task = appState.plannerTasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        logTelemetry('gateway', `POST /api/users/${appState.currentProfile}/twin - Updating task state.`);
        
        if (task.completed) {
            triggerToast("Plan Action Applied", `You saved ${task.co2Saved} kg carbon this week!`, "🌱");
            runConfettiExplosion();
        }
        
        updateDashboard();
        checkAndUnlockBadges();
    }
}

/**
 * [MARKING]: CARBON_CALCULATION_ENGINE_CLIENT
 * [DESCRIPTION]: Client-side fallback implementation of emission formula calculations (used if server is offline).
 * [PARAMS]: None
 * [RETURNS]: {Object} calculated scores and values
 */
function calculateTwinScoresLocal() {
    const profile = appState.profiles[appState.currentProfile];
    
    // Mobility
    let baseMobilityScore = profile.baseMetrics.mobility_score;
    let mobilityModifier = 0;
    if (appState.whatIf.evStatus === 1) mobilityModifier += 15;
    if (appState.whatIf.evStatus === 2) mobilityModifier += 35;
    const flightExcess = Math.max(0, appState.whatIf.flightHours - 10);
    mobilityModifier -= (flightExcess * 0.8);
    let finalMobilityScore = Math.max(10, Math.min(99, Math.round(baseMobilityScore + mobilityModifier)));

    // Energy
    let baseEnergyScore = profile.baseMetrics.energy_score;
    let energyModifier = 0;
    energyModifier += (appState.whatIf.solarCapacitykW * 3.5);
    const acDiff = appState.whatIf.acTempSetting - 22;
    energyModifier += (acDiff * 2.5);

    const solarBattery = document.getElementById("solarBatteryToggle")?.checked;
    const peakShift = document.getElementById("peakShiftToggle")?.checked;
    if (solarBattery) energyModifier += 6;
    if (peakShift) energyModifier += 5;
    let finalEnergyScore = Math.max(10, Math.min(99, Math.round(baseEnergyScore + energyModifier)));

    // Food
    let baseFoodScore = profile.baseMetrics.food_score;
    let foodModifier = (appState.whatIf.plantBasedDays * 4.5);
    let finalFoodScore = Math.max(10, Math.min(99, Math.round(baseFoodScore + foodModifier)));

    // Waste
    let finalWasteScore = profile.baseMetrics.waste_score;

    // Apply Planner Checklists
    appState.plannerTasks.forEach(task => {
        if (task.completed) {
            if (task.category === 'mobility') finalMobilityScore = Math.min(99, finalMobilityScore + 4);
            if (task.category === 'energy') finalEnergyScore = Math.min(99, finalEnergyScore + 4);
            if (task.category === 'food') finalFoodScore = Math.min(99, finalFoodScore + 4);
        }
    });

    let overallScore = Math.round(
        (finalMobilityScore * 0.35) + 
        (finalEnergyScore * 0.35) + 
        (finalFoodScore * 0.20) + 
        (finalWasteScore * 0.10)
    );

    let currentTonsYear = 5.5 - (overallScore - 30) * 0.057;
    currentTonsYear = Math.max(0.6, parseFloat(currentTonsYear.toFixed(2)));
    
    // Ingest transaction additions if present
    let extraCO2 = 0;
    profile.history.transactions.forEach(tx => {
        if (tx.co2) extraCO2 += parseFloat(tx.co2);
    });
    currentTonsYear += (extraCO2 * 52) / 1000;
    currentTonsYear = parseFloat(Math.min(12.0, currentTonsYear).toFixed(2));

    let targetTonsYear = currentTonsYear * 0.72;
    targetTonsYear = Math.max(0.5, parseFloat(targetTonsYear.toFixed(2)));

    return {
        mobility: finalMobilityScore,
        energy: finalEnergyScore,
        food: finalFoodScore,
        waste: finalWasteScore,
        overall: overallScore,
        currentTons: currentTonsYear,
        targetTons: targetTonsYear
    };
}

/**
 * [MARKING]: DIGITAL_TWIN_RENDERER
 * [DESCRIPTION]: Updates visual components of the Digital Twin section, including sub-scores and overall score ring.
 * [PARAMS]: {Object} scores - Struct containing scores
 * [RETURNS]: void
 */
function renderDigitalTwin(scores) {
    const overallRing = document.getElementById("overallScoreRing");
    const overallValLabel = document.getElementById("overallScoreVal");
    
    if (overallRing && overallValLabel) {
        overallValLabel.textContent = scores.overall;
        const offset = 314.16 - (scores.overall / 100) * 314.16;
        overallRing.style.strokeDashoffset = offset;
        
        if (scores.overall < 50) {
            overallRing.style.stroke = "var(--color-red)";
        } else if (scores.overall < 75) {
            overallRing.style.stroke = "var(--color-yellow)";
        } else {
            overallRing.style.stroke = "var(--color-emerald)";
        }
    }

    const mVal = document.getElementById("mobilityScoreVal");
    const mBar = document.getElementById("mobilityScoreBar");
    if (mVal && mBar) {
        mVal.textContent = `${scores.mobility}%`;
        mBar.style.width = `${scores.mobility}%`;
    }

    const eVal = document.getElementById("energyScoreVal");
    const eBar = document.getElementById("energyScoreBar");
    if (eVal && eBar) {
        eVal.textContent = `${scores.energy}%`;
        eBar.style.width = `${scores.energy}%`;
    }

    const fVal = document.getElementById("foodScoreVal");
    const fBar = document.getElementById("foodScoreBar");
    if (fVal && fBar) {
        fVal.textContent = `${scores.food}%`;
        fBar.style.width = `${scores.food}%`;
    }

    const wVal = document.getElementById("wasteScoreVal");
    const wBar = document.getElementById("wasteScoreBar");
    if (wVal && wBar) {
        wVal.textContent = `${scores.waste}%`;
        wBar.style.width = `${scores.waste}%`;
    }

    const descList = document.getElementById("twinDescriptionList");
    if (descList) {
        const profile = appState.profiles[appState.currentProfile];
        descList.innerHTML = `
            <li><span>📍</span> <strong>Locality:</strong> ${profile.type}</li>
            <li><span>🌳</span> <strong>Canopy Density:</strong> ${profile.treeCanopyDensity}</li>
            <li><span>🚇</span> <strong>Public Transit Access:</strong> ${profile.localTransportQuality}</li>
            <li><span>☀️</span> <strong>Solar Potential:</strong> Good (Year-round solar yield)</li>
        `;
    }
}

/**
 * [MARKING]: VERTEX_FORECAST_CHART_RENDERER
 * [DESCRIPTION]: Draws forecast coordinate paths. Speaks to Prediction Engine API if online.
 * [PARAMS]: {Object} scores - Current computed stats
 * [RETURNS]: void
 */
async function renderPredictionChart(scores) {
    const days = appState.timeScaleDays;
    const currentValLabel = document.getElementById("forecastCurrentVal");
    const targetValLabel = document.getElementById("forecastTargetVal");
    const savingsValLabel = document.getElementById("forecastSavingsVal");

    if (currentValLabel) currentValLabel.textContent = `${scores.currentTons} tons`;
    if (targetValLabel) targetValLabel.textContent = `${scores.targetTons} tons`;
    if (savingsValLabel) {
        const savingsKg = Math.round((scores.currentTons - scores.targetTons) * 1000);
        savingsValLabel.textContent = `-${savingsKg} kg saved`;
    }

    const chart = document.getElementById("forecastChart");
    const pointsGroup = document.getElementById("chartPoints");
    const xLabelsGroup = document.getElementById("chartXLabels");
    const yLabelsGroup = document.getElementById("chartYLabels");
    if (!chart || !pointsGroup || !xLabelsGroup || !yLabelsGroup) return;

    pointsGroup.innerHTML = '';
    xLabelsGroup.innerHTML = '';
    yLabelsGroup.innerHTML = '';

    let timeLabels = [];
    let currentCoords = [];
    let targetCoords = [];
    let maxVal = Math.ceil(scores.currentTons * 1.2);
    const startX = 40;
    const endX = 580;
    const widthX = endX - startX;

    if (appState.isServerOnline) {
        try {
            const res = await fetch(`${appState.apiBase}/prediction/forecast`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentTons: scores.currentTons,
                    targetTons: scores.targetTons,
                    days: days
                })
            });
            if (res.ok) {
                const data = await res.json();
                timeLabels = data.timeLabels;
                maxVal = data.maxVal;
                currentCoords = data.currentCoords;
                targetCoords = data.targetCoords;
            }
        } catch (e) {
            logTelemetry('error', 'Prediction service unreachable. Drawing client fallback graph.');
        }
    }

    // Client-side fallback plotting if offline
    if (timeLabels.length === 0) {
        let intervals = 5;
        if (days === 30) {
            timeLabels = ["Day 1", "Day 7", "Day 15", "Day 22", "Day 30"];
            intervals = 5;
        } else if (days === 90) {
            timeLabels = ["Month 1", "Month 2", "Month 3"];
            intervals = 3;
        } else {
            timeLabels = ["Q1", "Q2", "Q3", "Q4"];
            intervals = 4;
        }

        for (let i = 0; i < intervals; i++) {
            const x = startX + (i / (intervals - 1)) * widthX;
            let currentFactor = 1.0 + Math.sin(i * 1.1) * 0.08 + (i * 0.02);
            let targetFactor = 1.0 - (i * 0.08) + Math.cos(i * 1.5) * 0.04;

            const cy = 170 - ((scores.currentTons * currentFactor) / maxVal) * 150;
            const ty = 170 - ((scores.targetTons * targetFactor) / maxVal) * 150;

            currentCoords.push({ x, y: Math.min(170, Math.max(20, cy)) });
            targetCoords.push({ x, y: Math.min(170, Math.max(20, ty)) });
        }
    }

    // Plot Labels & Grid
    timeLabels.forEach((label, idx) => {
        const xPos = startX + (idx / (timeLabels.length - 1)) * widthX;
        const textNode = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textNode.setAttribute("x", xPos);
        textNode.setAttribute("y", 200);
        textNode.setAttribute("text-anchor", "middle");
        textNode.textContent = label;
        xLabelsGroup.appendChild(textNode);
    });

    const stepVal = maxVal / 4;
    for (let i = 0; i <= 4; i++) {
        const yPos = 170 - (i / 4) * 150;
        const textNode = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textNode.setAttribute("x", 25);
        textNode.setAttribute("y", yPos + 3);
        textNode.setAttribute("text-anchor", "end");
        textNode.textContent = `${(stepVal * i).toFixed(1)}t`;
        yLabelsGroup.appendChild(textNode);
    }

    const createPathD = (coords) => coords.map((c, idx) => `${idx === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
    const currentD = createPathD(currentCoords);
    const targetD = createPathD(targetCoords);

    document.getElementById("currentPath").setAttribute("d", currentD);
    document.getElementById("targetPath").setAttribute("d", targetD);

    document.getElementById("currentArea").setAttribute("d", `${currentD} L ${currentCoords[currentCoords.length-1].x} 170 L ${currentCoords[0].x} 170 Z`);
    document.getElementById("targetArea").setAttribute("d", `${targetD} L ${targetCoords[targetCoords.length-1].x} 170 L ${targetCoords[0].x} 170 Z`);

    // Render interactive data dots
    currentCoords.forEach(c => {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", c.x);
        circle.setAttribute("cy", c.y);
        circle.setAttribute("r", 4);
        circle.setAttribute("fill", "#ef4444");
        circle.setAttribute("stroke", "#0f172a");
        circle.setAttribute("stroke-width", 1.5);
        pointsGroup.appendChild(circle);
    });

    targetCoords.forEach(c => {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", c.x);
        circle.setAttribute("cy", c.y);
        circle.setAttribute("r", 4);
        circle.setAttribute("fill", "#10b981");
        circle.setAttribute("stroke", "#0f172a");
        circle.setAttribute("stroke-width", 1.5);
        pointsGroup.appendChild(circle);
    });
}

/**
 * [MARKING]: MOBILITY_LOGS_RENDERER
 * [DESCRIPTION]: Renders the table of travel entries for the active digital twin profile and binds row selectors.
 * [PARAMS]: None
 * [RETURNS]: void
 */
function populateMobilityLogs() {
    const logBody = document.getElementById("mobilityLogBody");
    if (!logBody) return;

    const profile = appState.profiles[appState.currentProfile];
    logBody.innerHTML = '';

    profile.history.mobility.forEach((item, idx) => {
        const tr = document.createElement("tr");
        tr.style.cursor = "pointer";
        tr.innerHTML = `
            <td><strong>${item.name}</strong></td>
            <td>${item.distance}</td>
            <td><span class="badge badge-accent">${item.mode}</span></td>
            <td><strong>${item.co2} kg</strong></td>
        `;
        
        tr.addEventListener("click", () => {
            selectMobilityRoute(item);
            document.querySelectorAll(".data-table tbody tr").forEach(row => row.classList.remove("selected-row"));
            tr.classList.add("selected-row");
        });

        logBody.appendChild(tr);
    });

    if (profile.history.mobility.length > 0) {
        selectMobilityRoute(profile.history.mobility[0]);
    }
}

/**
 * [MARKING]: INTERACTIVE_MAP_ROUTE_SELECTOR
 * [DESCRIPTION]: Modifies SVG paths on the map UI dynamically when travel records are selected.
 * [PARAMS]: {Object} routeItem - Struct describing the clicked route
 * [RETURNS]: void
 */
function selectMobilityRoute(routeItem) {
    const routeCardTitle = document.getElementById("routeCardTitle");
    const routeCardDetails = document.getElementById("routeCardDetails");
    const routeCardCarbon = document.getElementById("routeCardCarbon");
    const mapRoutePath = document.getElementById("mapRoutePath");
    const mapRoutePathAnim = document.getElementById("mapRoutePathAnim");
    
    if (!routeCardTitle || !routeCardDetails || !routeCardCarbon || !mapRoutePath || !mapRoutePathAnim) return;

    routeCardTitle.textContent = routeItem.name;
    routeCardDetails.textContent = `Distance: ${routeItem.distance} | Mode: ${routeItem.mode}`;
    routeCardCarbon.innerHTML = `<span>Emissions:</span> <strong>${routeItem.co2} kg CO₂</strong>`;

    let pathString = "M 50 130 L 100 130 L 100 50 L 210 50 L 210 90"; 
    if (routeItem.name.includes("Grocery")) {
        pathString = "M 50 130 L 100 130 L 100 150 L 150 150"; 
    } else if (routeItem.name.includes("Weekend") || routeItem.name.includes("Rail")) {
        pathString = "M 50 130 L 250 130 L 250 30 L 100 30";
    } else if (routeItem.name.includes("Gym") || routeItem.name.includes("visit")) {
        pathString = "M 50 130 L 50 40 L 150 40";
    }

    mapRoutePath.setAttribute("d", pathString);
    mapRoutePathAnim.setAttribute("d", pathString);
    
    logTelemetry('gateway', `GET /api/mobility/route - Drawing path vector for: "${routeItem.name}"`);
}

/**
 * [MARKING]: TRANSACTIONS_LEDGER_RENDERER
 * [DESCRIPTION]: Feeds automated transaction logs into the Consumption Agent table.
 * [PARAMS]: None
 * [RETURNS]: void
 */
function populateTransactions() {
    const list = document.getElementById("transactionList");
    if (!list) return;

    const profile = appState.profiles[appState.currentProfile];
    list.innerHTML = '';

    profile.history.transactions.forEach(tx => {
        const row = document.createElement("div");
        row.className = "tx-row";
        
        const badgeClass = `cat-${tx.category}`;
        
        row.innerHTML = `
            <div class="tx-details">
                <span class="tx-merchant">${tx.merchant}</span>
                <div class="tx-meta">
                    <span>${tx.amount}</span>
                    <span class="tx-category ${badgeClass}">${tx.category}</span>
                </div>
            </div>
            <span class="tx-carbon">${tx.co2} kg CO₂</span>
        `;
        list.appendChild(row);
    });
}

/**
 * [MARKING]: ENERGY_INTELLIGENCE_UPDATOR
 * [DESCRIPTION]: Adjusts dials and figures inside the Home Energy Agent panel.
 * [PARAMS]: None
 * [RETURNS]: void
 */
function updateEnergyAgent() {
    const solarGaugeRing = document.getElementById("solarGaugeRing");
    const solarVal = document.getElementById("solarGaugeVal");
    const solarSub = document.getElementById("solarGaugeSub");
    
    const loadGaugeRing = document.getElementById("loadGaugeRing");
    const loadVal = document.getElementById("loadGaugeVal");
    const loadSub = document.getElementById("loadGaugeSub");

    if (!solarGaugeRing || !solarVal || !loadGaugeRing || !loadVal) return;

    const hasSolar = appState.whatIf.solarCapacitykW > 0;
    const solarCapacity = appState.whatIf.solarCapacitykW;
    
    let solarKW = hasSolar ? (solarCapacity * 0.45).toFixed(1) : 0.0;
    solarVal.textContent = `${solarKW} kW`;
    
    let solarOffsetPercent = Math.min(100, Math.round((solarKW / 4.5) * 100));
    let dashoffsetSolar = 251.2 - (solarOffsetPercent / 100) * 251.2;
    solarGaugeRing.style.strokeDashoffset = dashoffsetSolar;
    if (solarSub) solarSub.textContent = hasSolar ? `Generating ${solarOffsetPercent}% load offset` : "No Solar production";

    let baseLoad = 1.0;
    if (appState.whatIf.acTempSetting < 22) baseLoad += 0.8;
    if (appState.whatIf.acTempSetting > 25) baseLoad -= 0.3;
    
    loadVal.textContent = `${baseLoad.toFixed(1)} kW`;
    let loadPercent = Math.min(100, Math.round((baseLoad / 2.5) * 100));
    let dashoffsetLoad = 251.2 - (loadPercent / 100) * 251.2;
    loadGaugeRing.style.strokeDashoffset = dashoffsetLoad;

    if (loadSub) {
        let gridNet = baseLoad - solarKW;
        if (gridNet < 0) {
            loadSub.textContent = `Grid Offset: +${Math.abs(gridNet).toFixed(1)} kW`;
            loadSub.className = "gauge-sub negative";
        } else {
            loadSub.textContent = `Grid Draw: ${gridNet.toFixed(1)} kW`;
            loadSub.className = "gauge-sub";
        }
    }
}

/**
 * [MARKING]: REDUCTION_PLANNER_VIEW
 * [DESCRIPTION]: Renders checkboxes for the carbon reduction goals and queries local/remote recommendations.
 * [PARAMS]: None
 * [RETURNS]: void
 */
async function renderPlanner() {
    const container = document.getElementById("plannerChecklist");
    if (!container) return;

    container.innerHTML = '';
    let activeTasks = [...appState.plannerTasks];

    if (appState.isServerOnline) {
        try {
            const profile = appState.profiles[appState.currentProfile];
            const currentScores = calculateTwinScoresLocal();
            const res = await fetch(`${appState.apiBase}/recommendations/evaluate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    treeCanopyDensity: profile.treeCanopyDensity,
                    localTransportQuality: profile.localTransportQuality,
                    overallScore: currentScores.overall,
                    latitude: appState.userLocation.latitude,
                    longitude: appState.userLocation.longitude,
                    aqi: appState.aqi
                })
            });
            if (res.ok) {
                const apiRecs = await res.json();
                apiRecs.forEach((rec, idx) => {
                    const exists = activeTasks.find(t => t.id === rec.id);
                    if (!exists) {
                        activeTasks.push({
                            id: rec.id,
                            title: rec.title,
                            desc: rec.description,
                            impact: `-${rec.impact}`,
                            co2Saved: parseInt(rec.impact),
                            completed: false,
                            category: rec.category
                        });
                    }
                });
            }
        } catch (e) {
            console.error(e);
        }
    }

    activeTasks.forEach(task => {
        const item = document.createElement("div");
        item.className = `planner-item ${task.completed ? 'completed' : ''}`;
        
        item.addEventListener("click", () => {
            const mainTask = appState.plannerTasks.find(t => t.id === task.id);
            if (mainTask) {
                togglePlannerTask(task.id);
            } else {
                task.completed = !task.completed;
                if (task.completed) {
                    triggerToast("Earth Action Applied", `You started: ${task.title}!`, "🌳");
                    runConfettiExplosion();
                }
                item.classList.toggle("completed");
                updateDashboard();
            }
        });

        item.innerHTML = `
            <div class="planner-checkbox">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            </div>
            <div class="planner-info">
                <span class="planner-title">${task.title}</span>
                <p class="planner-desc">${task.desc}</p>
            </div>
            <span class="planner-impact">${task.impact}</span>
        `;
        container.appendChild(item);
    });
}

/**
 * [MARKING]: GAMIFIED_LEADERBOARD_RENDERER
 * [DESCRIPTION]: Compiles mock list representing users social circle, highlighting active user rank.
 * [PARAMS]: None
 * [RETURNS]: void
 */
function renderLeaderboard() {
    const list = document.getElementById("leaderboardList");
    if (!list) return;

    list.innerHTML = '';
    const activeTwinScore = calculateTwinScoresLocal().overall;

    const users = [
        { name: "Elena (Off-grid)", score: 94, currentUser: false },
        { name: "Alex Commutes", score: 78, currentUser: false },
        { name: `${appState.profiles[appState.currentProfile].name} (You)`, score: activeTwinScore, currentUser: true },
        { name: "Rachel Green", score: 60, currentUser: false },
        { name: "Tom Fuel", score: 45, currentUser: false }
    ];

    users.sort((a,b) => b.score - a.score);

    users.forEach((u, idx) => {
        const li = document.createElement("li");
        li.className = `leaderboard-item ${u.currentUser ? 'current-user' : ''}`;
        li.innerHTML = `
            <div class="user-rank-name">
                <span class="rank-num">#${idx + 1}</span>
                <span>${u.name}</span>
            </div>
            <span class="leaderboard-score">${u.score} pts</span>
        `;
        list.appendChild(li);
    });
}

/**
 * [MARKING]: TOAST_ALERTS_CONTROLLER
 * [DESCRIPTION]: Triggers dynamic screen notification alert popups (e.g. for badges or systems status).
 * [PARAMS]: {string} title, {string} desc, {string} icon
 * [RETURNS]: void
 */
function triggerToast(title, desc, icon) {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <div class="toast-content">
            <h4>${title}</h4>
            <p>${desc}</p>
        </div>
    `;

    container.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 4200);
}

/**
 * [MARKING]: ACHIEVEMENT_MONITOR_SERVICE
 * [DESCRIPTION]: Audits scores and planner checklist tasks to trigger gamification badges.
 * [PARAMS]: None
 * [RETURNS]: void
 */
function checkAndUnlockBadges() {
    const currentScores = calculateTwinScoresLocal();
    const badgesToRender = [
        { id: 'traveler', name: 'Eco Traveler', desc: 'Mobility score > 80%', icon: '🚀', constraint: () => currentScores.mobility >= 80 },
        { id: 'commuter', name: 'Green Commuter', desc: 'Smart Commuting checked', icon: '🚇', constraint: () => appState.plannerTasks.find(t=>t.id==='commute').completed },
        { id: 'saver', name: 'Energy Saver', desc: 'Energy score > 85%', icon: '💡', constraint: () => currentScores.energy >= 85 }
    ];

    const badgesGrid = document.getElementById("badgesGrid");
    if (!badgesGrid) return;

    badgesGrid.innerHTML = '';

    badgesToRender.forEach(badge => {
        const isUnlocked = badge.constraint();
        const card = document.createElement("div");
        card.className = `badge-card ${isUnlocked ? 'unlocked' : ''}`;
        card.innerHTML = `
            <span class="badge-icon">${badge.icon}</span>
            <span class="badge-name">${badge.name}</span>
            <span class="badge-desc">${badge.desc}</span>
        `;
        badgesGrid.appendChild(card);

        if (isUnlocked && !appState.unlockedBadges.includes(badge.id)) {
            appState.unlockedBadges.push(badge.id);
            triggerToast("Badge Unlocked!", `Congrats on earning the ${badge.name} badge!`, badge.icon);
            runConfettiExplosion();
        }
    });
}

/**
 * [MARKING]: CHAT_INTERFACE_CONTROLLER
 * [DESCRIPTION]: Sends queries to Gemini Chat Service, appends chat logs, and handles load indicators.
 * [PARAMS]: {Event} event - Submission event
 * [RETURNS]: void
 */
async function handleChatSubmit(event) {
    event.preventDefault();
    const input = document.getElementById("chatInput");
    const output = document.getElementById("chatOutput");
    if (!input || !output || !input.value.trim()) return;

    const query = input.value.trim();
    input.value = '';

    // Append User Bubble
    const userBubble = document.createElement("div");
    userBubble.className = "chat-bubble user-bubble";
    userBubble.innerHTML = `<p>${query}</p>`;
    output.appendChild(userBubble);
    output.scrollTop = output.scrollHeight;

    // Loading indicator
    const loadingBubble = document.createElement("div");
    loadingBubble.className = "chat-bubble system-bubble";
    loadingBubble.innerHTML = `<p><em>Gemini is analyzing your Digital Twin...</em></p>`;
    output.appendChild(loadingBubble);
    output.scrollTop = output.scrollHeight;

    let reply = "";

    if (appState.isServerOnline) {
        logTelemetry('gateway', `POST /api/chat/query - Forwarding chat parameters.`);
        try {
            const currentScores = calculateTwinScoresLocal();
            const profile = appState.profiles[appState.currentProfile];
            const response = await fetch(`${appState.apiBase}/chat/query`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: query,
                    scores: {
                        currentTons: currentScores.currentTons,
                        mobility: currentScores.mobility,
                        energy: currentScores.energy,
                        food: currentScores.food
                    },
                    profile: {
                        treeCanopyDensity: profile.treeCanopyDensity,
                        localTransportQuality: profile.localTransportQuality
                    }
                })
            });
            if (response.ok) {
                const data = await response.json();
                reply = data.reply;
                logTelemetry('chat', 'Gemini Reasoning response generated.');
            }
        } catch (e) {
            logTelemetry('error', 'Chat service failed. Reverting to local engine responses.');
        }
    }

    if (!reply) {
        reply = getGeminiChatResponse(query);
        logTelemetry('system', 'Simulated Gemini Chat response calculated locally.');
    }

    setTimeout(() => {
        loadingBubble.remove();
        const aiBubble = document.createElement("div");
        aiBubble.className = "chat-bubble system-bubble";
        aiBubble.innerHTML = `<p>${reply.replace(/\n/g, '<br>')}</p>`;
        output.appendChild(aiBubble);
        output.scrollTop = output.scrollHeight;
    }, 800);
}

/**
 * [MARKING]: GEMINI_AI_REASONING_ENGINE_LOCAL
 * [DESCRIPTION]: Client-side backup calculator representing local language models.
 * [PARAMS]: {string} query - Prompt string
 * [RETURNS]: {string} Markdown text reply
 */
function getGeminiChatResponse(query) {
    const scores = calculateTwinScoresLocal();
    const profile = appState.profiles[appState.currentProfile];
    const qLower = query.toLowerCase();

    if (qLower.includes("high") || qLower.includes("why")) {
        let reasons = [];
        if (scores.mobility < 65) reasons.push("low mobility score due to gasoline SUV travel");
        if (scores.energy < 60) reasons.push("heating/cooling grids loading draw");
        if (appState.whatIf.flightHours > 20) reasons.push(`excessive flights: ${appState.whatIf.flightHours} hours/yr`);
        if (reasons.length === 0) reasons.push("no obvious issues! Good score!");
        return `Your current carbon output is **${scores.currentTons} tons/yr**. Primary carbon drivers:\n\n* ` + reasons.join('\n* ');
    } else if (qLower.includes("ev") || qLower.includes("car")) {
        return `Switching to a **Full EV** will reduce footprint by **${(scores.currentTons * 0.25).toFixed(2)} tons/yr** and increase Mobility Score to 95%.`;
    } else if (qLower.includes("tree") || qLower.includes("earth") || qLower.includes("density")) {
        return `**GCP Earth Engine Analysis:** local canopy coverage is **${profile.treeCanopyDensity}**. Plant 3 trees to absorb 66 kg CO₂ annually.`;
    } else {
        return `Analyzing Digital Twin... current overall score: ${scores.overall} pts. Switch profiles or complete goals to see predictions slide down.`;
    }
}

/**
 * [MARKING]: MAIN_DASHBOARD_ORCHESTRATOR
 * [DESCRIPTION]: Core synchronization loop. Updates scores, visual gauges, forecasts, agents, planners, and leaderboards.
 * [PARAMS]: None
 * [RETURNS]: void
 */
async function updateDashboard() {
    console.log("[TELEMETRY - MAIN_DASHBOARD_ORCHESTRATOR] Dashboard refresh cycle starting.");
    
    let scores = calculateTwinScoresLocal();

    if (appState.isServerOnline) {
        logTelemetry('gateway', `POST /api/carbon/calculate - Synchronizing twin state...`);
        try {
            const profile = appState.profiles[appState.currentProfile];
            const response = await fetch(`${appState.apiBase}/carbon/calculate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    evStatus: appState.whatIf.evStatus,
                    plantBasedDays: appState.whatIf.plantBasedDays,
                    solarCapacitykW: appState.whatIf.solarCapacitykW,
                    flightHours: appState.whatIf.flightHours,
                    acTempSetting: appState.whatIf.acTempSetting,
                    baseProfile: profile,
                    plannerModifiers: appState.plannerTasks,
                    latitude: appState.userLocation.latitude,
                    longitude: appState.userLocation.longitude,
                    aqi: appState.aqi,
                    pm2_5: appState.pm2_5,
                    transitDays: appState.whatIf.transitDays,
                    heatingType: appState.whatIf.heatingType,
                    wasteDivertedPercent: appState.whatIf.wasteDivertedPercent
                })
            });
            if (response.ok) {
                const data = await response.json();
                scores.currentTons = data.currentTotalTons;
                scores.targetTons = data.targetTotalTons;
                logTelemetry('engine', `Carbon calculations computed: Current=${data.currentTotalTons}t, Target=${data.targetTotalTons}t.`);
            }
        } catch (e) {
            logTelemetry('error', 'Failed posting to carbon-engine service.');
        }
    } else {
        logTelemetry('system', `Computed local scores: overall=${scores.overall}, Mobility=${scores.mobility}%, Energy=${scores.energy}%, Food=${scores.food}%.`);
    }
    
    renderDigitalTwin(scores);
    renderPredictionChart(scores);
    
    populateMobilityLogs();
    populateTransactions();
    updateEnergyAgent();
    
    renderPlanner();
    renderLeaderboard();
    checkAndUnlockBadges();
}

// ==========================================================================
// Agent Tabs Switcher Implementation
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    initApp();

    const tabButtons = document.querySelectorAll(".tab-btn");
    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            tabButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const activeTab = btn.dataset.tab;
            const tabPanels = document.querySelectorAll(".tab-panel");
            tabPanels.forEach(panel => {
                panel.classList.remove("active");
                if (panel.id === `tab-${activeTab}`) {
                    panel.classList.add("active");
                }
            });
            logTelemetry('gateway', `GET /api/dashboard/tab/${activeTab} - Tab loaded.`);
        });
    });
});

async function fetchAirQuality(lat, lng, city) {
    console.log(`[WEATHER-API] Fetching air quality index for coordinates: ${lat}, ${lng} (${city})`);
    logTelemetry('gateway', `GET /v1/air-quality?latitude=${lat.toFixed(4)}&longitude=${lng.toFixed(4)} - Weather API fetch.`);
    
    try {
        const res = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=us_aqi,pm2_5`);
        if (res.ok) {
            const data = await res.json();
            const current = data.current;
            appState.aqi = current.us_aqi;
            appState.pm2_5 = current.pm2_5;
            
            appState.userLocation.latitude = lat;
            appState.userLocation.longitude = lng;
            appState.userLocation.city = city;
            
            // Update UI element
            const displayEl = document.getElementById("aqiDisplay");
            if (displayEl) {
                displayEl.textContent = `${appState.aqi} AQI (${city})`;
                
                // Color coding based on AQI values
                let className = "status-badge-good";
                if (appState.aqi > 100) className = "status-badge-unhealthy";
                else if (appState.aqi > 50) className = "status-badge-moderate";
                
                displayEl.className = `telemetry-val ${className}`;
            }
            
            logTelemetry('gateway', `Air quality telemetry updated: ${appState.aqi} AQI, ${appState.pm2_5} ug/m3 PM2.5`);
            triggerToast("Location Weather Synced", `Air quality in ${city} is ${appState.aqi} AQI.`, "🌍");
        }
    } catch (e) {
        console.error("Failed to fetch air quality:", e);
        logTelemetry('error', `Failed to contact Air Quality API. Reverting to base estimates.`);
    }
}

async function handleAuthLogin(e) {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    
    logTelemetry('gateway', `POST /api/users/login - Requesting session for user: ${email}`);
    
    try {
        const res = await fetch(`${appState.apiBase}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        if (res.ok) {
            const profile = await res.json();
            appState.currentUser = profile;
            appState.profiles[profile.id] = profile; // Save to local state
            
            // Sync current profile
            appState.currentProfile = profile.id;
            
            // Update UI elements
            document.getElementById("authOverlay").classList.remove("active");
            document.getElementById("currentUserDisplay").textContent = profile.name;
            document.getElementById("userSessionControl").style.display = "flex";
            document.getElementById("profileSelectorWrapper").style.display = "none";
            
            logTelemetry('users', `Authentication successful. Digital twin session active: ${profile.name}`);
            triggerToast("Welcome Back!", `Successfully logged in as ${profile.name}.`, "🔑");
            
            // Auto load their profile
            await loadProfile(profile.id);
        } else {
            const err = await res.json();
            triggerToast("Authentication Failed", err.error || "Invalid credentials", "❌");
        }
    } catch (e) {
        console.error(e);
        triggerToast("Server Connection Offline", "Could not connect to authentication gateway", "🔌");
    }
}

async function handleAuthSignup(e) {
    e.preventDefault();
    const name = document.getElementById("signupName").value;
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;
    const type = document.getElementById("signupProfileType").value;
    const city = document.getElementById("signupCity").value;
    const latitude = appState.userLocation.latitude;
    const longitude = appState.userLocation.longitude;
    
    logTelemetry('gateway', `POST /api/users/register - Creating user profile for: ${email}`);
    
    try {
        const res = await fetch(`${appState.apiBase}/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name, email, password, type, city, latitude, longitude
            })
        });
        
        if (res.ok) {
            const profile = await res.json();
            appState.currentUser = profile;
            appState.profiles[profile.id] = profile;
            appState.currentProfile = profile.id;
            
            // Update UI
            document.getElementById("authOverlay").classList.remove("active");
            document.getElementById("currentUserDisplay").textContent = profile.name;
            document.getElementById("userSessionControl").style.display = "flex";
            document.getElementById("profileSelectorWrapper").style.display = "none";
            
            logTelemetry('users', `Digital twin successfully generated for new user: ${profile.name}`);
            triggerToast("Twin Created!", `Welcome to GreenMind AI, ${profile.name}!`, "🌱");
            runConfettiExplosion();
            
            await loadProfile(profile.id);
        } else {
            const err = await res.json();
            triggerToast("Registration Failed", err.error || "User already exists", "❌");
        }
    } catch (e) {
        console.error(e);
        triggerToast("Server Connection Offline", "Could not connect to user registry service", "🔌");
    }
}

function detectUserLocation() {
    const btn = document.getElementById("detectLocationBtn");
    btn.textContent = "⌛";
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            appState.userLocation.latitude = lat;
            appState.userLocation.longitude = lng;
            
            // Fill city input dynamically with coordinates
            document.getElementById("signupCity").value = `${lat.toFixed(3)}, ${lng.toFixed(3)}`;
            btn.textContent = "✅";
            triggerToast("Location Found", `Detected coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`, "📍");
            
            // Fetch air quality instantly
            await fetchAirQuality(lat, lng, "Detected Coordinate");
        }, (error) => {
            btn.textContent = "📍";
            triggerToast("Location Blocked", "Could not fetch GPS coordinates. Please type city name.", "⚠️");
        });
    } else {
        btn.textContent = "❌";
        triggerToast("Unavailable", "Geolocation not supported by this browser.", "⚠️");
    }
}

function logoutUser() {
    appState.currentUser = null;
    document.getElementById("authOverlay").classList.add("active");
    document.getElementById("userSessionControl").style.display = "none";
    document.getElementById("profileSelectorWrapper").style.display = "flex";
    
    // Clear forms
    document.getElementById("loginForm").reset();
    document.getElementById("signupForm").reset();
    
    logTelemetry('users', 'Session terminated. User logged out.');
    triggerToast("Logged Out", "Successfully ended session.", "🔓");
}
