// filepath: /Users/shubhamtiwari/Downloads/assembly-simulation-main/script_enhanced.js
// Assembly line configuration for a detailed automotive manufacturing process
const processInput = `
Supplier_Chassis to Frame_Assembly process_A
Supplier_Engine to Engine_Assembly process_B
Supplier_Body to Body_Stamping process_C
Supplier_Interior to Interior_Assembly process_D
Supplier_Electronics to Electronics_Assembly process_E
Supplier_Powertrain to Powertrain_Assembly process_F
Frame_Assembly to Body_Assembly process_G
Body_Stamping to Body_Welding process_H
Body_Welding to Paint_Prep process_I
Paint_Prep to Painting process_J
Painting to Body_QC process_K
Engine_Assembly to Powertrain_Assembly process_L
Powertrain_Assembly to Drivetrain_Testing process_M
Interior_Assembly to Trim_Assembly process_N
Electronics_Assembly to Electrical_Testing process_O
Body_QC to Final_Assembly process_P
Drivetrain_Testing to Final_Assembly process_Q
Trim_Assembly to Final_Assembly process_R
Electrical_Testing to Final_Assembly process_S
Final_Assembly to Quality_Inspection process_T
Quality_Inspection to Finishing process_U
Finishing to Vehicle_Testing process_V
Vehicle_Testing to Shipping process_W
`;

// Define basic rate constants for realistic manufacturing
const nodeRates = {
    "Supplier_Chassis": 0.1,
    "Supplier_Engine": 0.1,
    "Supplier_Body": 0.08,
    "Supplier_Interior": 0.09,
    "Supplier_Electronics": 0.12,
    "Supplier_Powertrain": 0.09,
    "Frame_Assembly": 0.07,
    "Body_Stamping": 0.08,
    "Body_Welding": 0.06,
    "Body_Assembly": 0.05,
    "Paint_Prep": 0.07,
    "Painting": 0.05,
    "Body_QC": 0.11,
    "Engine_Assembly": 0.08,
    "Powertrain_Assembly": 0.06,
    "Drivetrain_Testing": 0.09,
    "Interior_Assembly": 0.07,
    "Trim_Assembly": 0.08,
    "Electronics_Assembly": 0.1,
    "Electrical_Testing": 0.12,
    "Final_Assembly": 0.04,
    "Quality_Inspection": 0.1,
    "Finishing": 0.11,
    "Vehicle_Testing": 0.08,
    "Shipping": 0.15
};

// Import modular components
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded in script_enhanced.js");
    
    try {
        // Setup event handlers
        setupEventHandlers();
        
        // Add realistic red flags from automotive manufacturing
        function addRealisticRedFlags(customFlags = []) {
            const redFlagsContainer = document.getElementById('red-flags');
            if (!redFlagsContainer) return;
            
            redFlagsContainer.innerHTML = ''; // Clear existing flags
            
            const timeStr = new Date().toLocaleTimeString();
            
            // Get current threshold values
            const upperThresholdElement = document.getElementById('upperThresholdValue');
            const lowerThresholdElement = document.getElementById('lowerThresholdValue');
            
            const upperThreshold = upperThresholdElement ? parseFloat(upperThresholdElement.textContent) || 12.0 : 12.0;
            const lowerThreshold = lowerThresholdElement ? parseFloat(lowerThresholdElement.textContent) || 4.0 : 4.0;
            
            // Initialize flags with sync issues that are always present
            const flags = [
                {
                    message: "Final Assembly synchronization issue - Powertrain arriving 36s ahead of body",
                    time: timeStr,
                    severity: "error"
                },
                {
                    message: "Paint booth temperature deviation (82°C, threshold: 75°C)",
                    time: new Date(Date.now() - 120000).toLocaleTimeString(),
                    severity: "warning"
                }
            ];
            
            // Generate dynamic flags based on actual flow rates
            const types = ["chassis", "engine", "body", "interior"];
            types.forEach(type => {
                const rateElement = document.getElementById(`${type}-rate`);
                if (!rateElement) return;
                
                // Extract the current rate value from the display
                const rateText = rateElement.querySelector('span:first-child')?.textContent;
                if (!rateText) return;
                
                const rateValue = parseFloat(rateText) || 0;
                
                // Add flag if rate is outside thresholds
                if (rateValue > upperThreshold) {
                    flags.push({
                        message: `High flow rate for ${type}: ${rateValue.toFixed(1)} parts/min (threshold: ${upperThreshold.toFixed(1)})`,
                        time: timeStr,
                        severity: "error"
                    });
                } else if (rateValue < lowerThreshold && rateValue > 0) {
                    flags.push({
                        message: `Low flow rate for ${type}: ${rateValue.toFixed(1)} parts/min (threshold: ${lowerThreshold.toFixed(1)})`,
                        time: timeStr,
                        severity: "warning"
                    });
                }
            });
            
            // Add any custom flags passed in
            if (customFlags && customFlags.length > 0) {
                flags.push(...customFlags);
            }
            
            flags.forEach(flag => {
                const flagDiv = document.createElement('div');
                flagDiv.className = `red-flag ${flag.severity || ''}`;
                
                flagDiv.innerHTML = `
                    <span class="red-flag-message">${flag.message}</span>
                    <span class="red-flag-time">${flag.time}</span>
                `;
                
                redFlagsContainer.appendChild(flagDiv);
            });
            
            // Update counter
            const counter = document.querySelector('.red-flag-counter');
            if (counter) {
                counter.textContent = flags.length.toString();
            }
        }
        
        // Add detailed automotive manufacturing stats
        function addDetailedStats() {
            const metricsDiv = document.getElementById('metrics');
            if (!metricsDiv) return;
            
            metricsDiv.innerHTML = '<h3>Production Statistics</h3>';
            
            // Standard automotive metrics
            const metrics = [
                { name: "Vehicles Completed", value: 24 },
                { name: "Components Processed", value: 2184 },
                { name: "Avg Cycle Time", value: "23.5s" },
                { name: "Takt Time", value: "50.0s" },
                { name: "First Pass Yield", value: "95.2%" },
                { name: "Throughput", value: "2.55 vehicles/hr" }
            ];
            
            // Create metric items
            metrics.forEach(metric => {
                const item = document.createElement('div');
                item.className = 'metric-item';
                item.innerHTML = `<strong>${metric.name}</strong>: ${metric.value}`;
                metricsDiv.appendChild(item);
            });
            
            // Add full simulation statistics with automotive-specific metrics
            const fullStatsDiv = document.createElement('div');
            fullStatsDiv.className = 'full-metrics';
            fullStatsDiv.innerHTML = `
                <h4>Manufacturing Performance Metrics</h4>
                <div class="metric-item"><strong>avg cycle time</strong>: 50.00s</div>
                <div class="metric-item"><strong>first pass yield</strong>: 90.0%</div>
                <div class="metric-item"><strong>throughput</strong>: 72 vehicles/day</div>
                <div class="metric-item"><strong>MTBF</strong>: 150.00min</div>
                <div class="metric-item"><strong>MTTR</strong>: 5.2min</div>
                <div class="metric-item"><strong>avg downtime</strong>: 36min/shift</div>
                <div class="metric-item"><strong>capacity utilization</strong>: 94.2%</div>
                <div class="metric-item"><strong>labor productivity</strong>: 0.28 vehicles/labor-hour</div>
                <div class="metric-item"><strong>inventory turnover</strong>: 52.4 cycles/year</div>
                <div class="metric-item"><strong>defect rate</strong>: 0.8%</div>
                <div class="metric-item"><strong>rework rate</strong>: 3.5%</div>
                <div class="metric-item"><strong>energy consumption</strong>: 482 kWh/vehicle</div>
            `;
            metricsDiv.appendChild(fullStatsDiv);
            
            // Add automotive station throughput
            const stationStatsDiv = document.createElement('div');
            stationStatsDiv.className = 'station-stats';
            stationStatsDiv.innerHTML = `
                <h4>Station Throughput (units/hour)</h4>
                <div class="metric-item">
                    <div class="station-rate-item"><strong>Frame Assembly</strong>: 24.8</div>
                    <div class="station-rate-item"><strong>Body Stamping</strong>: 23.6</div>
                    <div class="station-rate-item"><strong>Body Welding</strong>: 22.4</div>
                    <div class="station-rate-item"><strong>Paint Prep</strong>: 22.0</div>
                    <div class="station-rate-item"><strong>Painting</strong>: 20.5</div>
                    <div class="station-rate-item"><strong>Engine Assembly</strong>: 27.2</div>
                    <div class="station-rate-item"><strong>Final Assembly</strong>: 21.6</div>
                    <div class="station-rate-item"><strong>Quality Testing</strong>: 25.9</div>
                </div>
            `;
            metricsDiv.appendChild(stationStatsDiv);
            
            // Add sync issues section
            const syncIssuesDiv = document.createElement('div');
            syncIssuesDiv.className = 'sync-issues';
            syncIssuesDiv.innerHTML = `
                <strong>Process Synchronization Issues</strong>: 
                <div class="sync-issue">
                    <em>Final Assembly Line</em> had 9 sync issues in the last hour
                    <div class="metric-details">
                        Components arriving out of sequence:<br>
                        • Powertrain arrived 36s before body at Station 4<br>
                        • Trim components delayed by 48s at Station 7<br>
                        • Electronics harnesses arrived early at Stations 2, 5<br>
                        <br>
                        JIT Delivery Tolerance: 5-30s
                        <br>Maximum observed deviation: 48s
                    </div>
                </div>
            `;
            metricsDiv.appendChild(syncIssuesDiv);
        }
        
        // Run simulation function - called when Run Simulation button is clicked
        function runSimulation() {
            console.log("Running enhanced simulation");
            
            // Update status badge
            const statusBadge = document.querySelector('.system-status-badge');
            if (statusBadge) {
                statusBadge.textContent = 'Active';
                statusBadge.classList.add('active');
            }
            
            // Start with a clean graph
            createAutomotiveVisualization();
            
            // Set up monitoring and stats
            addRealisticRedFlags();
            addDetailedStats();
            updateRfidIndicators();
            updateFlowRateMonitor();
            
            // Start periodic updates
            const monitoringInterval = setInterval(updateRfidIndicators, 3000);
            const flowRateInterval = setInterval(updateFlowRateMonitor, 1200);
            const redFlagsInterval = setInterval(addRealisticRedFlags, 45000);
            
            // Store intervals for later cleanup
            window.simulationIntervals = [monitoringInterval, flowRateInterval, redFlagsInterval];
        }
        
        // Set up event handlers 
        function setupEventHandlers() {
            // Simulation button
            const simulateBtn = document.getElementById('simulateBtn');
            if (simulateBtn) {
                simulateBtn.addEventListener('click', () => {
                    // First cleanup any existing animation
                    if (window.simulationIntervals) {
                        window.simulationIntervals.forEach(interval => clearInterval(interval));
                    }
                    
                    // Reset graph
                    const graph = document.getElementById('graph');
                    if (graph) {
                        const svg = graph.querySelector('svg');
                        if (svg) svg.remove();
                    }
                    
                    // Run new simulation
                    runSimulation();
                });
            }
            
            // Legend toggle
            const legendToggle = document.getElementById('legend-toggle');
            if (legendToggle) {
                legendToggle.addEventListener('click', () => {
                    const legendContent = document.querySelector('.legend-content');
                    if (legendContent) {
                        legendContent.classList.toggle('collapsed');
                        legendToggle.classList.toggle('collapsed');
                    }
                });
            }
            
            // Speed slider
            const speedSlider = document.getElementById('speedSlider');
            if (speedSlider) {
                speedSlider.addEventListener('input', (e) => {
                    const value = parseInt(e.target.value);
                    const speedValue = document.getElementById('speedValue');
                    if (speedValue) speedValue.textContent = `${value}x`;
                    
                    // Update animation speeds
                    window.simulationSpeed = value;
                });
            }
            
            // Setup threshold sliders
            setupThresholdSliders();
            
            // Function to setup threshold sliders and their event listeners
            function setupThresholdSliders() {
                const upperThresholdSlider = document.getElementById('upperThreshold');
                const lowerThresholdSlider = document.getElementById('lowerThreshold');
                
                if (upperThresholdSlider) {
                    upperThresholdSlider.addEventListener('input', (e) => {
                        const value = parseFloat(e.target.value);
                        const display = document.getElementById('upperThresholdValue');
                        if (display) display.textContent = value.toFixed(1);
                        
                        // Update flow rate display and red flags
                        updateFlowRateMonitor();
                        addRealisticRedFlags();
                        
                        // Visual feedback
                        upperThresholdSlider.style.boxShadow = '0 0 5px rgba(231, 76, 60, 0.7)';
                        setTimeout(() => upperThresholdSlider.style.boxShadow = '', 500);
                        
                        // Update threshold lines if available
                        if (typeof updateThresholdLines === 'function') {
                            updateThresholdLines();
                        }
                    });
                }
                
                if (lowerThresholdSlider) {
                    lowerThresholdSlider.addEventListener('input', (e) => {
                        const value = parseFloat(e.target.value);
                        const display = document.getElementById('lowerThresholdValue');
                        if (display) display.textContent = value.toFixed(1);
                        
                        // Update flow rate display and red flags
                        updateFlowRateMonitor();
                        addRealisticRedFlags();
                        
                        // Visual feedback
                        lowerThresholdSlider.style.boxShadow = '0 0 5px rgba(243, 156, 18, 0.7)';
                        setTimeout(() => lowerThresholdSlider.style.boxShadow = '', 500);
                        
                        // Update threshold lines if available
                        if (typeof updateThresholdLines === 'function') {
                            updateThresholdLines();
                        }
                    });
                }
            }
        }
        
        // Function to connect threshold sliders to flow rate monitoring
        function setupThresholdSliders() {
            // Get slider elements
            const upperSlider = document.getElementById('upperThreshold');
            const lowerSlider = document.getElementById('lowerThreshold');
            
            if (upperSlider) {
                upperSlider.addEventListener('input', (e) => {
                    const value = parseFloat(e.target.value);
                    document.getElementById('upperThresholdValue').textContent = value.toFixed(1);
                    
                    // Update flow rate display and red flags
                    updateFlowRateMonitor();
                    addRealisticRedFlags();
                    
                    // Visual feedback
                    upperSlider.style.boxShadow = '0 0 5px rgba(231, 76, 60, 0.7)';
                    setTimeout(() => upperSlider.style.boxShadow = '', 500);
                });
            }
            
            if (lowerSlider) {
                lowerSlider.addEventListener('input', (e) => {
                    const value = parseFloat(e.target.value);
                    document.getElementById('lowerThresholdValue').textContent = value.toFixed(1);
                    
                    // Update flow rate display and red flags
                    updateFlowRateMonitor();
                    addRealisticRedFlags();
                    
                    // Visual feedback
                    lowerSlider.style.boxShadow = '0 0 5px rgba(243, 156, 18, 0.7)';
                    setTimeout(() => lowerSlider.style.boxShadow = '', 500);
                });
            }
        }
        
        // Initialize flow rate monitoring from rfid.js
        if (typeof FlowRateMonitor !== 'undefined') {
            console.log("FlowRateMonitor class found");
            
            // Update RFID counters for visual feedback with realistic values
            function updateRfidIndicators() {
                const types = ["chassis", "engine", "body", "interior"];
                const baseReadings = {
                    "chassis": 42,
                    "engine": 38,
                    "body": 45,
                    "interior": 51
                };
                
                types.forEach(type => {
                    const counter = document.querySelector(`#rfid-${type} .data-counter`);
                    const indicator = document.querySelector(`#rfid-${type} .rfid-state`);
                    
                    if (counter) {
                        // Generate realistic RFID readings with incremental counts
                        const currentText = counter.textContent;
                        let currentCount = parseInt(currentText) || baseReadings[type];
                        const increment = Math.floor(Math.random() * 3) + 1;
                        currentCount += increment;
                        
                        counter.textContent = `${currentCount} readings`;
                        counter.classList.add('highlight');
                        setTimeout(() => counter.classList.remove('highlight'), 1000);
                    }
                    
                    if (indicator && Math.random() > 0.5) {
                        indicator.textContent = "Active";
                        indicator.classList.add('active');
                        
                        setTimeout(() => {
                            indicator.textContent = "Idle";
                            indicator.classList.remove('active');
                        }, 2000);
                    }
                });
            }
            
            // Update system status badge
            const statusBadge = document.querySelector('.system-status-badge');
            if (statusBadge) {
                statusBadge.textContent = 'Active';
                statusBadge.classList.add('active');
            }
            
            // Update the Flow Rate Monitor display with realistic automotive values
            function updateFlowRateMonitor() {
                const types = ["chassis", "engine", "body", "interior"];
                const baseRates = {
                    "chassis": 8.5,
                    "engine": 7.8, 
                    "body": 6.2,
                    "interior": 7.4
                };
                
                // Get current thresholds from sliders (not their display values)
                const upperThreshold = parseFloat(document.getElementById('upperThreshold').value) || 12.0;
                const lowerThreshold = parseFloat(document.getElementById('lowerThreshold').value) || 4.0;
                
                // Update threshold display values to ensure they're in sync
                document.getElementById('upperThresholdValue').textContent = upperThreshold.toFixed(1);
                document.getElementById('lowerThresholdValue').textContent = lowerThreshold.toFixed(1);
                
                // Flag to track if any rates changed outside thresholds
                let thresholdsViolated = false;
                
                types.forEach(type => {
                    // Update flow rate with random variations around realistic base rates
                    const baseRate = baseRates[type];
                    // Add realistic variations (±10%)
                    const variation = (Math.random() - 0.5) * baseRate * 0.2;
                    const rate = baseRate + variation;
                    
                    const rateDisplay = document.getElementById(`${type}-rate`);
                    if (rateDisplay) {
                        rateDisplay.innerHTML = `
                            <span>${rate.toFixed(1)}</span> parts/min
                            <span class="threshold-info">(Threshold: ${lowerThreshold.toFixed(1)}-${upperThreshold.toFixed(1)})</span>`;
                    }
                    
                    // Update gauge fill
                    const fillBar = document.getElementById(`${type}-fill`);
                    if (fillBar) {
                        const maxRate = Math.max(upperThreshold * 1.2, 20); // Scale based on current threshold
                        const fillPercentage = Math.min(100, (rate / maxRate) * 100);
                        fillBar.style.width = `${fillPercentage}%`;
                        
                        // Add color indicators based on current thresholds
                        fillBar.className = 'gauge-fill';
                        if (rate > upperThreshold) {
                            fillBar.classList.add('error');
                            thresholdsViolated = true;
                        } else if (rate < lowerThreshold) {
                            fillBar.classList.add('warning');
                            thresholdsViolated = true;
                        }
                    }
                });
                
                // Update red flags if thresholds were violated
                if (thresholdsViolated) {
                    addRealisticRedFlags();
                }
            }
            
            // Function to check if values are outside thresholds and create red flags
            function checkThresholds() {
                const types = ["chassis", "engine", "body", "interior"];
                const upperThreshold = parseFloat(document.getElementById('upperThresholdValue').textContent) || 12.0;
                const lowerThreshold = parseFloat(document.getElementById('lowerThresholdValue').textContent) || 4.0;
                
                const customFlags = [];
                
                types.forEach(type => {
                    const rateElement = document.getElementById(`${type}-rate`);
                    if (!rateElement) return;
                    
                    // Extract the current rate value
                    let rateText = rateElement.textContent;
                    let rateValue = parseFloat(rateText.split(' ')[0]) || 0;
                    
                    // Check if rate exceeds thresholds
                    if (rateValue > upperThreshold) {
                        customFlags.push({
                            message: `High flow rate for ${type}: ${rateValue.toFixed(1)} parts/min (threshold: ${upperThreshold.toFixed(1)})`,
                            time: new Date().toLocaleTimeString(),
                            severity: "error"
                        });
                        
                        // Update gauge style
                        const fill = document.getElementById(`${type}-fill`);
                        if (fill) fill.classList.add('error');
                    }
                    else if (rateValue < lowerThreshold && rateValue > 0) {
                        customFlags.push({
                            message: `Low flow rate for ${type}: ${rateValue.toFixed(1)} parts/min (threshold: ${lowerThreshold.toFixed(1)})`,
                            time: new Date().toLocaleTimeString(),
                            severity: "warning"
                        });
                        
                        // Update gauge style
                        const fill = document.getElementById(`${type}-fill`);
                        if (fill) fill.classList.add('warning');
                    }
                });
                
                // Update red flags with any threshold violations
                if (customFlags.length > 0) {
                    addRealisticRedFlags(customFlags);
                }
            }
            
            // Function to update threshold lines
            function updateThresholdLines() {
                const upperThreshold = parseFloat(document.getElementById('upperThresholdValue').textContent) || 12.0;
                const lowerThreshold = parseFloat(document.getElementById('lowerThresholdValue').textContent) || 4.0;
                
                const gauges = document.querySelectorAll('.gauge-bar');
                
                gauges.forEach(gauge => {
                    // Update upper threshold line
                    const upperLine = gauge.querySelector('.threshold-line.upper');
                    if (upperLine) {
                        upperLine.style.right = `${100 - (upperThreshold / 20 * 100)}%`;
                    }
                    
                    // Update lower threshold line
                    const lowerLine = gauge.querySelector('.threshold-line.lower');
                    if (lowerLine) {
                        lowerLine.style.right = `${100 - (lowerThreshold / 20 * 100)}%`;
                    }
                });
                
                // Update threshold info in gauge values
                const types = ["chassis", "engine", "body", "interior"];
                types.forEach(type => {
                    const rateElement = document.getElementById(`${type}-rate`);
                    if (rateElement) {
                        const rateText = rateElement.textContent;
                        const rate = parseFloat(rateText.split(' ')[0]) || 0;
                        
                        rateElement.innerHTML = `
                            <span>${rate.toFixed(1)} parts/min</span>
                            <span class="threshold-info">(Threshold: ${lowerThreshold.toFixed(1)}-${upperThreshold.toFixed(1)})</span>`;
                    }
                });
                
                // Check for threshold violations
                checkThresholds();
            }
            
            // Add function to update threshold lines visually
            function updateThresholdLines() {
                const upperThreshold = parseFloat(document.getElementById('upperThreshold').value) || 12.0;
                const lowerThreshold = parseFloat(document.getElementById('lowerThreshold').value) || 4.0;
                
                // Update all gauge bars
                const gauges = document.querySelectorAll('.gauge-bar');
                gauges.forEach(gauge => {
                    // Update upper threshold line
                    const upperLine = gauge.querySelector('.threshold-line.upper');
                    if (upperLine) {
                        upperLine.style.right = `${100 - (upperThreshold / 20 * 100)}%`;
                    }
                    
                    // Update lower threshold line
                    const lowerLine = gauge.querySelector('.threshold-line.lower');
                    if (lowerLine) {
                        lowerLine.style.right = `${100 - (lowerThreshold / 20 * 100)}%`;
                    }
                });
                
                // Also update any particles in the visualization that need to respect thresholds
                updateParticleFlowRates();
            }
            
            // Update particle flow rates based on thresholds
            function updateParticleFlowRates() {
                // This function can be expanded to adjust particle flow speeds
                // based on the current threshold values
                const types = ["chassis", "engine", "body", "interior"];
                types.forEach(type => {
                    // Find the associated conveyor and adjust its animation speed
                    const path = document.getElementById(`${type}-conveyor`);
                    if (path) {
                        // Update the stroke dasharray animation to reflect current thresholds
                        const upperThreshold = parseFloat(document.getElementById('upperThreshold').value) || 12.0;
                        const speed = Math.min(3 / (upperThreshold / 12), 5); // Inverse relation to threshold
                        path.style.animationDuration = `${speed}s`;
                    }
                });
            }
            
            // Initialize threshold sliders
            const upperThreshold = document.getElementById('upperThreshold');
            const lowerThreshold = document.getElementById('lowerThreshold');
            const upperThresholdValue = document.getElementById('upperThresholdValue');
            const lowerThresholdValue = document.getElementById('lowerThresholdValue');
            
            if (upperThreshold && upperThresholdValue) {
                upperThresholdValue.textContent = upperThreshold.value;
            }
            
            if (lowerThreshold && lowerThresholdValue) {
                lowerThresholdValue.textContent = lowerThreshold.value;
            }
            
            // Initialize visualization but don't start intervals yet
            addDetailedStats();
            updateRfidIndicators();
            updateFlowRateMonitor();
            addRealisticRedFlags();
            
            // Initialize threshold lines
            updateThresholdLines();
            
            // Create visualization when page loads, but wait for button click to animate
            setTimeout(createAutomotiveVisualization, 500);
            
            // Add initial collapsible behavior to legend
            const legendToggle = document.getElementById('legend-toggle');
            if (legendToggle) {
                // Initialize as collapsed
                const legendContent = document.querySelector('.legend-content');
                if (legendContent) {
                    legendContent.classList.add('collapsed');
                    legendToggle.classList.add('collapsed');
                }
            }
            
            // Create detailed automotive assembly line visualization
            function createAutomotiveVisualization() {
                const graph = document.getElementById('graph');
                if (!graph) {
                    console.error("Graph container not found");
                    return;
                }
                
                // Check if visualization already exists and remove it
                const existingSvg = graph.querySelector('svg');
                if (existingSvg) {
                    console.log("SVG already exists, removing it");
                    existingSvg.remove();
                }
                
                // Create SVG container with appropriate size
                const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                svg.setAttribute("width", "100%");
                svg.setAttribute("height", "100%");
                svg.setAttribute("viewBox", "0 0 1000 700");
                svg.style.overflow = "visible";
                graph.appendChild(svg);
                
                // Store reference to svg for later use
                window.simulationSvg = svg;
                
                // Add title
                const title = document.createElementNS("http://www.w3.org/2000/svg", "text");
                title.setAttribute("x", 500);
                title.setAttribute("y", 40);
                title.setAttribute("text-anchor", "middle");
                title.setAttribute("font-size", "20px");
                title.setAttribute("font-weight", "bold");
                title.textContent = "Automotive Manufacturing Assembly Process";
                svg.appendChild(title);
                
                // Draw factory layout background
                const factoryLayout = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                factoryLayout.setAttribute("x", 50);
                factoryLayout.setAttribute("y", 80);
                factoryLayout.setAttribute("width", 900);
                factoryLayout.setAttribute("height", 520);
                factoryLayout.setAttribute("fill", "#f8f9fa");
                factoryLayout.setAttribute("stroke", "#dee2e6");
                factoryLayout.setAttribute("stroke-width", "2");
                factoryLayout.setAttribute("rx", "5");
                svg.appendChild(factoryLayout);
                
                // Create main manufacturing sections
                const sections = [
                    { name: "Stamping & Welding", x: 80, y: 120, width: 260, height: 160 },
                    { name: "Paint Shop", x: 80, y: 300, width: 260, height: 140 },
                    { name: "Powertrain Assembly", x: 360, y: 120, width: 280, height: 160 },
                    { name: "Final Assembly", x: 660, y: 120, width: 260, height: 320 },
                    { name: "Testing & Quality", x: 360, y: 300, width: 280, height: 140 },
                    { name: "Parts & Subassemblies", x: 80, y: 460, width: 560, height: 110 }
                ];
                
                sections.forEach(section => {
                    // Section background
                    const sectionBg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                    sectionBg.setAttribute("x", section.x);
                    sectionBg.setAttribute("y", section.y);
                    sectionBg.setAttribute("width", section.width);
                    sectionBg.setAttribute("height", section.height);
                    sectionBg.setAttribute("fill", "rgba(248, 249, 250, 0.8)");
                    sectionBg.setAttribute("stroke", "#adb5bd");
                    sectionBg.setAttribute("stroke-width", "1");
                    sectionBg.setAttribute("stroke-dasharray", "4 2");
                    sectionBg.setAttribute("rx", "3");
                    svg.appendChild(sectionBg);
                    
                    // Section title with background for better visibility
                    const sectionTitleBg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                    sectionTitleBg.setAttribute("x", section.x + 5);
                    sectionTitleBg.setAttribute("y", section.y + 5);
                    sectionTitleBg.setAttribute("width", Math.min(section.width - 10, section.name.length * 9 + 10));
                    sectionTitleBg.setAttribute("height", 22);
                    sectionTitleBg.setAttribute("rx", 3);
                    sectionTitleBg.setAttribute("fill", "rgba(255,255,255,0.85)");
                    svg.appendChild(sectionTitleBg);
                    
                    // Section title
                    const sectionTitle = document.createElementNS("http://www.w3.org/2000/svg", "text");
                    sectionTitle.setAttribute("x", section.x + 10);
                    sectionTitle.setAttribute("y", section.y + 20);
                    sectionTitle.setAttribute("font-size", "14px");
                    sectionTitle.setAttribute("font-weight", "bold");
                    sectionTitle.setAttribute("fill", "#495057");
                    sectionTitle.setAttribute("class", "section-title");
                    sectionTitle.textContent = section.name;
                    svg.appendChild(sectionTitle);
                });
                
                // Create assembly stations
                const stations = [
                    { id: "frame-assembly", name: "Frame Assembly", x: 130, y: 170, section: 0 },
                    { id: "body-stamping", name: "Body Stamping", x: 230, y: 170, section: 0 },
                    { id: "body-welding", name: "Body Welding", x: 280, y: 220, section: 0 },
                    { id: "paint-prep", name: "Paint Prep", x: 130, y: 350, section: 1 },
                    { id: "painting", name: "Paint Booth", x: 230, y: 350, section: 1 },
                    { id: "body-qc", name: "Body QC", x: 280, y: 400, section: 1 },
                    { id: "engine-assembly", name: "Engine Assembly", x: 410, y: 150, section: 2 },
                    { id: "powertrain", name: "Powertrain", x: 500, y: 150, section: 2 },
                    { id: "drivetrain-test", name: "Drivetrain Test", x: 550, y: 220, section: 2 },
                    { id: "trim-assembly", name: "Trim Assembly", x: 440, y: 350, section: 4 },
                    { id: "electrical", name: "Electrical", x: 530, y: 350, section: 4 },
                    { id: "final-1", name: "Final Assembly 1", x: 710, y: 170, section: 3 },
                    { id: "final-2", name: "Final Assembly 2", x: 800, y: 220, section: 3 },
                    { id: "final-3", name: "Final Assembly 3", x: 780, y: 320, section: 3 },
                    { id: "quality", name: "Quality Inspection", x: 710, y: 370, section: 3 },
                    { id: "chassis-supply", name: "Chassis Supply", x: 130, y: 510, section: 5 },
                    { id: "engine-supply", name: "Engine Supply", x: 230, y: 510, section: 5 },
                    { id: "body-supply", name: "Body Parts Supply", x: 330, y: 510, section: 5 },
                    { id: "interior-supply", name: "Interior Supply", x: 440, y: 510, section: 5 },
                    { id: "electronics-supply", name: "Electronics", x: 540, y: 510, section: 5 },
                    { id: "shipping", name: "Shipping", x: 780, y: 440, section: 3 }
                ];
                
                // Draw stations
                stations.forEach(station => {
                    drawStation(svg, station);
                });
                
                // Create conveyor paths connecting stations
                const paths = [
                    // Supplies to initial assembly
                    { id: "chassis-conveyor", from: "chassis-supply", to: "frame-assembly", color: "#3498db" },
                    { id: "engine-conveyor", from: "engine-supply", to: "engine-assembly", color: "#e74c3c" },
                    { id: "body-conveyor", from: "body-supply", to: "body-stamping", color: "#f39c12" },
                    { id: "interior-conveyor", from: "interior-supply", to: "trim-assembly", color: "#9b59b6" },
                    { id: "electronics-conveyor", from: "electronics-supply", to: "electrical", color: "#2ecc71" },
                    
                    // Main assembly flow
                    { id: "frame-to-body", from: "frame-assembly", to: "body-welding", color: "#3498db" },
                    { id: "stamp-to-weld", from: "body-stamping", to: "body-welding", color: "#f39c12" },
                    { id: "weld-to-paint", from: "body-welding", to: "paint-prep", color: "#f39c12" },
                    { id: "prep-to-paint", from: "paint-prep", to: "painting", color: "#f39c12" },
                    { id: "paint-to-qc", from: "painting", to: "body-qc", color: "#f39c12" },
                    { id: "engine-to-powertrain", from: "engine-assembly", to: "powertrain", color: "#e74c3c" },
                    { id: "powertrain-to-test", from: "powertrain", to: "drivetrain-test", color: "#e74c3c" },
                    
                    // To final assembly
                    { id: "qc-to-final", from: "body-qc", to: "final-1", color: "#f39c12" },
                    { id: "test-to-final", from: "drivetrain-test", to: "final-1", color: "#e74c3c" },
                    { id: "trim-to-final", from: "trim-assembly", to: "final-2", color: "#9b59b6" },
                    { id: "electrical-to-final", from: "electrical", to: "final-2", color: "#2ecc71" },
                    
                    // Final assembly flow
                    { id: "final-1-to-2", from: "final-1", to: "final-2", color: "#34495e" },
                    { id: "final-2-to-3", from: "final-2", to: "final-3", color: "#34495e" },
                    { id: "final-3-to-quality", from: "final-3", to: "quality", color: "#34495e" },
                    { id: "quality-to-shipping", from: "quality", to: "shipping", color: "#34495e" }
                ];
                
                // Draw paths
                paths.forEach(pathData => {
                    drawConveyorPath(svg, pathData, stations);
                });
                
                // Create particles on paths
                paths.forEach(pathData => {
                    createParticlesOnPath(svg, pathData.id, pathData.color, 2000 + Math.random() * 1000);
                });
                
                // Add RFID checkpoints
                const rfidPoints = [
                    { id: "rfid-chassis", station: "frame-assembly", radius: 8 },
                    { id: "rfid-engine", station: "engine-assembly", radius: 8 },
                    { id: "rfid-body", station: "body-welding", radius: 8 },
                    { id: "rfid-interior", station: "trim-assembly", radius: 8 },
                ];
                
                rfidPoints.forEach(point => {
                    const station = stations.find(s => s.id === point.station);
                    if (station) {
                        drawRfidCheckpoint(svg, station.x + 25, station.y, point);
                    }
                });
                
                // Add animation effects to stations
                addAnimationEffects(svg, stations);
            }
            
            // Draw a manufacturing station
            function drawStation(svg, station) {
                const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
                group.setAttribute("id", `station-${station.id}`);
                
                // Add text background to ensure visibility
                const textBg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                textBg.setAttribute("x", station.x - 20);
                textBg.setAttribute("y", station.y + 10);
                textBg.setAttribute("width", 40);
                textBg.setAttribute("height", 16);
                textBg.setAttribute("rx", 2);
                textBg.setAttribute("ry", 2);
                textBg.setAttribute("fill", "rgba(0,0,0,0.6)");
                textBg.setAttribute("stroke", "none");
                svg.appendChild(textBg);
                
                // Station shape
                const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                rect.setAttribute("x", station.x - 20);
                rect.setAttribute("y", station.y - 15);
                rect.setAttribute("width", 40);
                rect.setAttribute("height", 30);
                rect.setAttribute("rx", 4);
                rect.setAttribute("ry", 4);
                rect.setAttribute("fill", "#34495e");
                rect.setAttribute("stroke", "#2c3e50");
                rect.setAttribute("stroke-width", "1.5");
                svg.appendChild(rect);
                
                // Station name (shortened appropriately)
                const displayName = station.name.length > 10 ? 
                    station.name.substring(0, 8) + "..." : 
                    station.name;
                
                // Main text inside station box
                const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                text.setAttribute("x", station.x);
                text.setAttribute("y", station.y + 5);
                text.setAttribute("text-anchor", "middle");
                text.setAttribute("font-size", "10px");
                text.setAttribute("fill", "white");
                text.setAttribute("font-weight", "bold");
                text.textContent = displayName;
                svg.appendChild(text);
                
                return group;
            }
            
            // Draw a conveyor path between stations
            function drawConveyorPath(svg, pathData, stations) {
                const fromStation = stations.find(s => s.id === pathData.from);
                const toStation = stations.find(s => s.id === pathData.to);
                
                if (!fromStation || !toStation) return;
                
                // Create path element
                const pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
                
                // Generate path data based on station positions
                let pathDef = "";
                
                // Determine if we need a direct line or a curved path
                const dx = toStation.x - fromStation.x;
                const dy = toStation.y - fromStation.y;
                const distance = Math.sqrt(dx*dx + dy*dy);
                
                if (distance < 120 && Math.abs(dx) > Math.abs(dy)) {
                    // Short horizontal distance - direct line
                    pathDef = `M${fromStation.x + 20},${fromStation.y} L${toStation.x - 20},${toStation.y}`;
                } else if (distance < 80 && Math.abs(dy) > Math.abs(dx)) {
                    // Short vertical distance - direct line
                    pathDef = `M${fromStation.x},${fromStation.y + 15} L${toStation.x},${toStation.y - 15}`;
                } else {
                    // Longer distance or complex route - use a curved path
                    // Calculate control points for a nice curve
                    const midX = (fromStation.x + toStation.x) / 2;
                    const midY = (fromStation.y + toStation.y) / 2;
                    
                    // Add some variation to avoid overlapping paths
                    const variationX = (Math.random() - 0.5) * 30;
                    const variationY = (Math.random() - 0.5) * 30;
                    
                    pathDef = `M${fromStation.x},${fromStation.y} Q${midX + variationX},${midY + variationY} ${toStation.x},${toStation.y}`;
                }
                
                pathElement.setAttribute("id", pathData.id);
                pathElement.setAttribute("d", pathDef);
                pathElement.setAttribute("fill", "none");
                pathElement.setAttribute("stroke", pathData.color || "#6c757d");
                pathElement.setAttribute("stroke-width", "3");
                pathElement.setAttribute("stroke-dasharray", "5,5");
                pathElement.setAttribute("class", "conveyor-path");
                
                svg.appendChild(pathElement);
            }
            
            // Legend is now handled by HTML/CSS
            function updateComponentColors(svg) {
                // Use the same colors as in the HTML legend
                const colorMap = {
                    "chassis": "#3498db",
                    "engine": "#e74c3c",
                    "body": "#f39c12",
                    "interior": "#9b59b6", 
                    "electronics": "#2ecc71"
                };
                
                // Update paths with consistent colors
                Object.entries(colorMap).forEach(([component, color]) => {
                    const paths = svg.querySelectorAll(`.${component}-path`);
                    paths.forEach(path => {
                        path.setAttribute("stroke", color);
                    });
                });
            }
            
            // Draw RFID checkpoint
            function drawRfidCheckpoint(svg, x, y, point) {
                // RFID base with highlight ring for visibility
                const outerRing = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                outerRing.setAttribute("cx", x);
                outerRing.setAttribute("cy", y);
                outerRing.setAttribute("r", (point.radius || 8) + 2);
                outerRing.setAttribute("fill", "rgba(0,0,0,0.3)");
                outerRing.setAttribute("stroke", "rgba(255,255,255,0.5)");
                outerRing.setAttribute("stroke-width", "1");
                outerRing.setAttribute("class", "rfid-highlight");
                svg.appendChild(outerRing);
                
                // RFID base
                const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                circle.setAttribute("cx", x);
                circle.setAttribute("cy", y);
                circle.setAttribute("r", point.radius || 8);
                circle.setAttribute("fill", "var(--secondary)");
                circle.setAttribute("stroke", "#343a40");
                circle.setAttribute("stroke-width", "1.5");
                circle.setAttribute("class", "rfid-checkpoint");
                svg.appendChild(circle);
                
                // RFID label with better visibility
                const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
                label.setAttribute("x", x);
                label.setAttribute("y", y + 3);
                label.setAttribute("text-anchor", "middle");
                label.setAttribute("font-size", "9px");
                label.setAttribute("font-weight", "bold");
                label.setAttribute("fill", "white");
                label.setAttribute("class", "station-text");
                label.textContent = "RFID";
                svg.appendChild(label);
                
                // No pulse animation - completely removed
            }
            
            // Create particles moving along a path
            function createParticlesOnPath(svg, pathId, color, delay = 0) {
                const path = document.getElementById(pathId);
                if (!path) return;
                
                // Get path length for animation
                const pathLength = path.getTotalLength();
                
                // Create particle function
                const createParticle = () => {
                    const particle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                    particle.setAttribute("r", "5");
                    particle.setAttribute("fill", color || "#6c757d");
                    particle.setAttribute("stroke", "#333");
                    particle.setAttribute("stroke-width", "1");
                    particle.setAttribute("opacity", "0.9");
                    
                    // Add to SVG but position will be updated during animation
                    svg.appendChild(particle);
                    
                    // Determine duration based on path length
                    const duration = Math.max(2000, pathLength * 10);
                    
                    // Animate along path
                    let start = null;
                    const animate = (timestamp) => {
                        if (!start) start = timestamp;
                        const elapsed = timestamp - start;
                        const progress = elapsed / duration;
                        
                        if (progress < 1) {
                            // Get position along path
                            const point = path.getPointAtLength(progress * pathLength);
                            particle.setAttribute("cx", point.x);
                            particle.setAttribute("cy", point.y);
                            requestAnimationFrame(animate);
                        } else {
                            // At end of animation, remove particle
                            svg.removeChild(particle);
                            
                            // Create a new particle to keep continuous flow
                            setTimeout(() => createParticle(), Math.random() * 500 + 500);
                        }
                    };
                    
                    // Start animation
                    requestAnimationFrame(animate);
                };
                
                // Create initial particles with staggered starts
                setTimeout(() => {
                    createParticle();
                    setTimeout(createParticle, Math.random() * 1000 + 500);
                }, delay);
            }
            
            // Add animation effects to stations
            function addAnimationEffects(svg, stations) {
                // Define station effects
                const effects = {
                    "body-welding": "welding",
                    "painting": "painting",
                    "engine-assembly": "assembly",
                    "final-1": "assembly",
                    "final-2": "assembly",
                    "quality": "testing"
                };
                
                // Create animation effects on stations
                Object.entries(effects).forEach(([stationId, effectType]) => {
                    const station = stations.find(s => s.id === stationId);
                    if (!station) return;
                    
                    // Schedule random effects
                    const createEffect = () => {
                        switch (effectType) {
                            case "welding":
                                createWeldingEffect(svg, station.x, station.y);
                                break;
                            case "painting":
                                createPaintingEffect(svg, station.x, station.y);
                                break;
                            case "assembly":
                                createAssemblyEffect(svg, station.x, station.y);
                                break;
                            case "testing":
                                createTestingEffect(svg, station.x, station.y);
                                break;
                        }
                        
                        // Schedule next effect
                        const nextTime = 3000 + Math.random() * 5000;
                        setTimeout(createEffect, nextTime);
                    };
                    
                    // Start with random delay
                    setTimeout(createEffect, Math.random() * 3000);
                });
            }
            
            // Create welding effect at position
            function createWeldingEffect(svg, x, y) {
                if (Math.random() > 0.4) return; // Only show sometimes
                
                // Create sparks container
                const sparks = document.createElementNS("http://www.w3.org/2000/svg", "g");
                sparks.setAttribute("class", "welding-effect");
                svg.appendChild(sparks);
                
                // Add glow
                const glow = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                glow.setAttribute("cx", x);
                glow.setAttribute("cy", y);
                glow.setAttribute("r", 10);
                glow.setAttribute("fill", "#f39c12");
                glow.setAttribute("opacity", 0.6);
                sparks.appendChild(glow);
                
                // Add individual sparks
                for (let i = 0; i < 8; i++) {
                    const spark = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                    const angle = Math.random() * Math.PI * 2;
                    const distance = Math.random() * 15;
                    
                    spark.setAttribute("cx", x);
                    spark.setAttribute("cy", y);
                    spark.setAttribute("r", 1 + Math.random() * 2);
                    spark.setAttribute("fill", Math.random() > 0.5 ? "#f1c40f" : "#ffffff");
                    
                    // Animate spark flying outward
                    spark.animate([
                        { cx: x, cy: y, opacity: 1 },
                        { 
                            cx: x + Math.cos(angle) * distance, 
                            cy: y + Math.sin(angle) * distance, 
                            opacity: 0 
                        }
                    ], {
                        duration: 300 + Math.random() * 300,
                        easing: "ease-out",
                        fill: "forwards"
                    });
                    
                    sparks.appendChild(spark);
                }
                
                // Remove effect after animation
                setTimeout(() => {
                    svg.removeChild(sparks);
                }, 600);
            }
            
            // Create painting effect
            function createPaintingEffect(svg, x, y) {
                if (Math.random() > 0.3) return; // Only show sometimes
                
                // Paint spray container
                const spray = document.createElementNS("http://www.w3.org/2000/svg", "g");
                spray.setAttribute("class", "painting-effect");
                svg.appendChild(spray);
                
                // Colors to cycle through
                const colors = ["#3498db", "#2ecc71", "#e74c3c", "#9b59b6"];
                const color = colors[Math.floor(Math.random() * colors.length)];
                
                // Paint mist
                const mist = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                mist.setAttribute("cx", x);
                mist.setAttribute("cy", y);
                mist.setAttribute("r", 12);
                mist.setAttribute("fill", color);
                mist.setAttribute("opacity", 0.2);
                spray.appendChild(mist);
                
                // Paint particles
                for (let i = 0; i < 12; i++) {
                    const particle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                    const angle = (Math.random() - 0.5) * Math.PI / 2;
                    const distance = 5 + Math.random() * 20;
                    
                    particle.setAttribute("cx", x);
                    particle.setAttribute("cy", y);
                    particle.setAttribute("r", 1 + Math.random() * 2);
                    particle.setAttribute("fill", color);
                    
                    // Animate particle
                    particle.animate([
                        { cx: x, cy: y, opacity: 0.8, r: 2 },
                        { 
                            cx: x + Math.cos(angle) * distance, 
                            cy: y + Math.sin(angle) * distance, 
                            opacity: 0,
                            r: 0.5
                        }
                    ], {
                        duration: 400 + Math.random() * 400,
                        easing: "ease-out",
                        fill: "forwards"
                    });
                    
                    spray.appendChild(particle);
                }
                
                // Remove effect
                setTimeout(() => {
                    svg.removeChild(spray);
                }, 800);
            }
            
            // Create assembly effect
            function createAssemblyEffect(svg, x, y) {
                if (Math.random() > 0.25) return; // Only show sometimes
                
                // Assembly effect container
                const assembly = document.createElementNS("http://www.w3.org/2000/svg", "g");
                assembly.setAttribute("class", "assembly-effect");
                svg.appendChild(assembly);
                
                // Tool symbol (X shape)
                const tool = document.createElementNS("http://www.w3.org/2000/svg", "path");
                tool.setAttribute("d", `M${x-5},${y-5} L${x+5},${y+5} M${x-5},${y+5} L${x+5},${y-5}`);
                tool.setAttribute("stroke", "#3498db");
                tool.setAttribute("stroke-width", 2);
                tool.setAttribute("stroke-linecap", "round");
                assembly.appendChild(tool);
                
                // Circular indicator
                const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                circle.setAttribute("cx", x);
                circle.setAttribute("cy", y);
                circle.setAttribute("r", 8);
                circle.setAttribute("fill", "none");
                circle.setAttribute("stroke", "#3498db");
                circle.setAttribute("stroke-width", 1);
                circle.setAttribute("stroke-dasharray", "4 2");
                assembly.appendChild(circle);
                
                // Rotate animation
                let rotation = 0;
                const animate = () => {
                    rotation += 10;
                    assembly.setAttribute("transform", `rotate(${rotation} ${x} ${y})`);
                    
                    if (rotation < 360) {
                        requestAnimationFrame(animate);
                    } else {
                        // Remove after animation completes
                        svg.removeChild(assembly);
                    }
                };
                
                requestAnimationFrame(animate);
            }
            
            // Create testing effect
            function createTestingEffect(svg, x, y) {
                if (Math.random() > 0.2) return; // Only show sometimes
                
                // Testing effect container
                const testing = document.createElementNS("http://www.w3.org/2000/svg", "g");
                testing.setAttribute("class", "testing-effect");
                svg.appendChild(testing);
                
                // Scanner beam
                const beam = document.createElementNS("http://www.w3.org/2000/svg", "line");
                beam.setAttribute("x1", x);
                beam.setAttribute("y1", y - 10);
                beam.setAttribute("x2", x);
                beam.setAttribute("y2", y + 10);
                beam.setAttribute("stroke", "#2ecc71");
                beam.setAttribute("stroke-width", 2);
                testing.appendChild(beam);
                
                // Checkmark
                setTimeout(() => {
                    const check = document.createElementNS("http://www.w3.org/2000/svg", "path");
                    check.setAttribute("d", `M${x-6},${y} L${x-2},${y+4} L${x+6},${y-4}`);
                    check.setAttribute("stroke", "#2ecc71");
                    check.setAttribute("stroke-width", 2);
                    check.setAttribute("fill", "none");
                    check.setAttribute("stroke-linecap", "round");
                    check.setAttribute("stroke-linejoin", "round");
                    check.setAttribute("opacity", 0);
                    testing.appendChild(check);
                    
                    // Fade in checkmark
                    check.animate([
                        { opacity: 0, pathLength: 0 },
                        { opacity: 1, pathLength: 1 }
                    ], {
                        duration: 300,
                        fill: "forwards"
                    });
                    
                    // Remove beam
                    beam.animate([
                        { opacity: 1 },
                        { opacity: 0 }
                    ], {
                        duration: 200,
                        fill: "forwards"
                    });
                }, 400);
                
                // Remove effect
                setTimeout(() => {
                    svg.removeChild(testing);
                }, 1500);
            }
            
            // Helper function to create text with enhanced visibility
            function createVisibleText(svg, x, y, text, options = {}) {
                const defaults = {
                    fontSize: '12px',
                    fontWeight: 'normal',
                    fill: 'white',
                    textAnchor: 'middle',
                    className: '',
                    background: false,
                    backgroundPadding: 4,
                    backgroundOpacity: 0.7
                };
                
                const settings = {...defaults, ...options};
                
                // Create background if requested
                if (settings.background) {
                    // Measure text approximately (this is an estimation)
                    const textWidth = text.length * parseInt(settings.fontSize) * 0.6;
                    const textHeight = parseInt(settings.fontSize) * 1.2;
                    const bgWidth = textWidth + (settings.backgroundPadding * 2);
                    const bgHeight = textHeight + (settings.backgroundPadding * 2);
                    
                    // Text background for better visibility
                    const textBg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                    textBg.setAttribute("x", x - (bgWidth / 2));
                    textBg.setAttribute("y", y - (textHeight / 2) - (settings.backgroundPadding / 2));
                    textBg.setAttribute("width", bgWidth);
                    textBg.setAttribute("height", bgHeight);
                    textBg.setAttribute("rx", 3);
                    textBg.setAttribute("ry", 3);
                    
                    // Background color based on fill color
                    let bgColor = '#333';
                    if (settings.fill == 'white' || settings.fill.startsWith('#f') || settings.fill.startsWith('rgb(2')) {
                        bgColor = 'rgba(0, 0, 0, ' + settings.backgroundOpacity + ')';
                    } else {
                        bgColor = 'rgba(255, 255, 255, ' + settings.backgroundOpacity + ')';
                    }
                    
                    textBg.setAttribute("fill", bgColor);
                    svg.appendChild(textBg);
                }
                
                // Create text element
                const textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
                textElement.setAttribute("x", x);
                textElement.setAttribute("y", y);
                textElement.setAttribute("text-anchor", settings.textAnchor);
                textElement.setAttribute("font-size", settings.fontSize);
                textElement.setAttribute("font-weight", settings.fontWeight);
                textElement.setAttribute("fill", settings.fill);
                
                if (settings.className) {
                    textElement.setAttribute("class", settings.className);
                }
                
                textElement.textContent = text;
                svg.appendChild(textElement);
                
                return textElement;
            }
            
            // Initialize visualization
            setTimeout(createAutomotiveVisualization, 100);
            
        } else {
            console.error("FlowRateMonitor class not found - check rfid.js loading");
        }
    } catch (error) {
        console.error("Error in script_enhanced.js initialization:", error);
    }
});
