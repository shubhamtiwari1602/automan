// RFID tag data structure
class RFIDTag {
    constructor(partType, id) {
        this.id = id;
        this.partType = partType;
        this.timestamps = {};
        this.qualityChecks = {};
        this.redFlags = [];
        this.createdAt = new Date();
    }
    
    recordCheckpoint(checkpoint, time = new Date()) {
        this.timestamps[checkpoint] = time;
        
        // Update counter in UI
        const partType = this.partType;
        const counterEl = document.querySelector(`#rfid-${partType} .data-counter`);
        if (counterEl) {
            const currentCount = parseInt(counterEl.textContent) || 0;
            counterEl.textContent = `${currentCount + 1} readings`;
            
            // Add highlight animation to counter
            counterEl.classList.add('highlight');
            setTimeout(() => counterEl.classList.remove('highlight'), 1000);
        }
    }
    
    addQualityCheck(station, result, details = {}) {
        this.qualityChecks[station] = { 
            result, 
            details,
            timestamp: new Date()
        };
        
        if (result === 'fail') {
            this.addRedFlag(`Quality issue at ${station}: ${details.reason || 'Unknown issue'}`, details);
        }
    }
    
    addRedFlag(message, details = {}) {
        this.redFlags.push({
            message,
            details,
            timestamp: new Date(),
            resolved: false
        });
    }
    
    getLastCheckpoint() {
        const checkpoints = Object.keys(this.timestamps);
        return checkpoints.length > 0 ? checkpoints[checkpoints.length - 1] : null;
    }
    
    getTimeAtCheckpoint(checkpoint) {
        return this.timestamps[checkpoint] || null;
    }
    
    getTimeBetweenCheckpoints(checkpoint1, checkpoint2) {
        const time1 = this.getTimeAtCheckpoint(checkpoint1);
        const time2 = this.getTimeAtCheckpoint(checkpoint2);
        
        if (!time1 || !time2) return null;
        
        return (time2 - time1) / 1000; // Time difference in seconds
    }
    
    hasRedFlags() {
        return this.redFlags.length > 0;
    }
    
    getActiveRedFlags() {
        return this.redFlags.filter(flag => !flag.resolved);
    }
}

// Flow rate monitoring class
class FlowRateMonitor {
    constructor(simulation) {
        this.simulation = simulation || { 
            addRedFlag: function(msg) { 
                console.log("Red flag:", msg);
                // Add to UI directly if simulation object not available
                const redFlagsContainer = document.getElementById('red-flags');
                if (redFlagsContainer) {
                    const flagDiv = document.createElement('div');
                    flagDiv.className = 'red-flag';
                    flagDiv.innerHTML = `
                        <span class="red-flag-message">${msg}</span>
                        <span class="red-flag-time">${new Date().toLocaleTimeString()}</span>
                    `;
                    redFlagsContainer.appendChild(flagDiv);
                    
                    // Update counter
                    const counter = document.querySelector('.red-flag-counter');
                    if (counter) {
                        const count = parseInt(counter.textContent || "0") + 1;
                        counter.textContent = count;
                    }
                }
            },
            svg: d3 ? d3.select("#graph svg") : null
        };
        
        this.flowRates = {
            chassis: 0,
            engine: 0,
            body: 0,
            interior: 0
        };
        this.upperThreshold = 12.0;
        this.lowerThreshold = 4.0;
        this.readings = [];
        this.lastCalculation = new Date();
        
        // Setup event listeners for threshold sliders
        this._setupThresholdListeners();
        
        // Start flow rate monitoring
        this.startMonitoring();
    }
    
    _setupThresholdListeners() {
        // Upper threshold slider
        document.getElementById('upperThreshold').addEventListener('input', (e) => {
            this.upperThreshold = parseFloat(e.target.value);
            document.getElementById('upperThresholdValue').textContent = this.upperThreshold.toFixed(1);
            this.updateGauges();
            this.updateThresholdLines();
            
            // Visual feedback when threshold changes
            const slider = document.getElementById('upperThreshold');
            slider.style.boxShadow = '0 0 5px rgba(231, 76, 60, 0.7)';
            setTimeout(() => slider.style.boxShadow = '', 500);
        });
        
        // Lower threshold slider
        document.getElementById('lowerThreshold').addEventListener('input', (e) => {
            this.lowerThreshold = parseFloat(e.target.value);
            document.getElementById('lowerThresholdValue').textContent = this.lowerThreshold.toFixed(1);
            this.updateGauges();
            this.updateThresholdLines();
            
            // Visual feedback when threshold changes
            const slider = document.getElementById('lowerThreshold');
            slider.style.boxShadow = '0 0 5px rgba(243, 156, 18, 0.7)';
            setTimeout(() => slider.style.boxShadow = '', 500);
        });
    }
    
    updateThresholdLines() {
        const gauges = document.querySelectorAll('.gauge-bar');
        
        gauges.forEach(gauge => {
            // Update upper threshold line
            const upperLine = gauge.querySelector('.threshold-line.upper');
            if (upperLine) {
                upperLine.style.right = `${100 - (this.upperThreshold / 20 * 100)}%`;
            }
            
            // Update lower threshold line
            const lowerLine = gauge.querySelector('.threshold-line.lower');
            if (lowerLine) {
                lowerLine.style.right = `${100 - (this.lowerThreshold / 20 * 100)}%`;
            }
        });
    }
    
    recordReading(partType, timestamp = new Date()) {
        this.readings.push({
            partType,
            timestamp
        });
        
        // Keep only readings from the last minute
        const oneMinuteAgo = new Date(timestamp.getTime() - 60000);
        this.readings = this.readings.filter(r => r.timestamp >= oneMinuteAgo);
        
        // Calculate flow rates
        this.calculateFlowRates();
    }
    
    calculateFlowRates() {
        const now = new Date();
        // Only recalculate every second to avoid excessive updates
        if (now - this.lastCalculation < 1000) return;
        this.lastCalculation = now;
        
        // Calculate one-minute rolling window
        const oneMinuteAgo = new Date(now.getTime() - 60000);
        
        // Group readings by part type and count them
        const counts = {
            chassis: 0,
            engine: 0,
            body: 0,
            interior: 0
        };
        
        this.readings.forEach(reading => {
            if (reading.timestamp >= oneMinuteAgo) {
                counts[reading.partType]++;
            }
        });
        
        // Calculate parts per minute for each type
        const timeWindowMinutes = Math.min(1, (now - oneMinuteAgo) / 60000);
        
        for (const type of Object.keys(this.flowRates)) {
            // Parts per minute
            this.flowRates[type] = counts[type] / timeWindowMinutes || 0;
        }
        
        // Update UI gauges
        this.updateGauges();
    }
    
    updateGauges() {
        for (const type of Object.keys(this.flowRates)) {
            const rate = this.flowRates[type];
            const gaugeElement = document.getElementById(`${type}-fill`);
            const rateElement = document.getElementById(`${type}-rate`);
            const gaugeContainer = document.getElementById(`${type}-gauge`);
            
            if (!gaugeElement || !rateElement) continue;
            
            // Update gauge fill
            const maxRate = Math.max(this.upperThreshold * 1.2, 20); // Scale to ensure visibility
            const fillPercentage = Math.min(100, (rate / maxRate) * 100);
            gaugeElement.style.width = `${fillPercentage}%`;
            
            // Update rate text with threshold indication
            rateElement.innerHTML = `
                <span>${rate.toFixed(1)} parts/min</span>
                <span class="threshold-info">(Threshold: ${this.lowerThreshold.toFixed(1)}-${this.upperThreshold.toFixed(1)})</span>
            `;
            
            // Add status indicator if it doesn't exist
            let statusIndicator = gaugeContainer.querySelector('.gauge-status-indicator');
            if (!statusIndicator) {
                const gaugeLabel = gaugeContainer.querySelector('.gauge-label');
                if (gaugeLabel) {
                    // Convert to flexible layout if not already
                    if (!gaugeLabel.querySelector('.gauge-label-text')) {
                        const text = gaugeLabel.textContent;
                        gaugeLabel.innerHTML = `<span class="gauge-label-text">${text}</span>`;
                    }
                    
                    statusIndicator = document.createElement('span');
                    statusIndicator.className = 'gauge-status-indicator';
                    gaugeLabel.appendChild(statusIndicator);
                }
            }
            
            // Determine status based on thresholds
            if (rate > this.upperThreshold) {
                gaugeElement.className = 'gauge-fill error';
                if (statusIndicator) statusIndicator.className = 'gauge-status-indicator error';
                
                // Create red flag for high flow rate
                this.simulation.addRedFlag(
                    `High flow rate for ${type}: ${rate.toFixed(1)} parts/min (threshold: ${this.upperThreshold})`,
                    { type, rate, threshold: this.upperThreshold, severity: 'medium' },
                    `FLOW-HIGH-${type}-${Date.now()}`
                );
                
                // Add visual indicator on the conveyor
                this.addFlowRateIndicator(type, 'high');
                
            } else if (rate < this.lowerThreshold) {
                gaugeElement.className = 'gauge-fill warning';
                if (statusIndicator) statusIndicator.className = 'gauge-status-indicator warning';
                
                // Create red flag for low flow rate if rate is not zero
                if (rate > 0) {
                    this.simulation.addRedFlag(
                        `Low flow rate for ${type}: ${rate.toFixed(1)} parts/min (threshold: ${this.lowerThreshold})`,
                        { type, rate, threshold: this.lowerThreshold, severity: 'low' },
                        `FLOW-LOW-${type}-${Date.now()}`
                    );
                    
                    // Add visual indicator on the conveyor
                    this.addFlowRateIndicator(type, 'low');
                }
            } else {
                gaugeElement.className = 'gauge-fill';
                if (statusIndicator) statusIndicator.className = 'gauge-status-indicator';
            }
        }
    }
    
    addFlowRateIndicator(type, status) {
        if (!document.getElementById('graph')) return;
        
        // Find the conveyor path for this part type
        const path = document.getElementById(`${type}-conveyor`);
        if (!path) return;
        
        try {
            // Get the current SVG element - don't rely on d3 instance
            const svg = document.querySelector('#graph svg');
            if (!svg) return;
            
            // Create a red flag indicator at a position along the path
            const pathLength = path.getTotalLength ? path.getTotalLength() : 100;
            const point = path.getPointAtLength ? 
                          path.getPointAtLength(pathLength * 0.6) : 
                          {x: 0, y: 0};
            
            // Create the indicator using standard SVG, not D3
            const indicator = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            indicator.setAttribute("class", `flow-indicator ${status === 'high' ? 'error' : 'warning'}`);
            indicator.setAttribute("cx", point.x);
            indicator.setAttribute("cy", point.y);
            indicator.setAttribute("r", 8);
            indicator.setAttribute("fill", status === 'high' ? '#e74c3c' : '#f39c12');
            indicator.setAttribute("stroke", "white");
            indicator.setAttribute("stroke-width", 1.5);
            indicator.setAttribute("opacity", 0);
            svg.appendChild(indicator);
            
            // Add text or icon
            const iconText = document.createElementNS("http://www.w3.org/2000/svg", "text");
            iconText.setAttribute("x", point.x);
            iconText.setAttribute("y", point.y + 4);
            iconText.setAttribute("text-anchor", "middle");
            iconText.setAttribute("font-size", "12px");
            iconText.setAttribute("font-weight", "bold");
            iconText.setAttribute("fill", "white");
            iconText.textContent = status === 'high' ? '!' : '↓';
            svg.appendChild(iconText);
            
            // Animate using standard Web Animations API
            indicator.animate(
                [
                    { opacity: 0 },
                    { opacity: 0.9 },
                    { opacity: 0.9 },
                    { opacity: 0 }
                ],
                {
                    duration: 4000,
                    fill: "forwards",
                    easing: "ease-in-out"
                }
            );
            
            // Remove after animation completes
            setTimeout(() => {
                if (svg.contains(indicator)) svg.removeChild(indicator);
                if (svg.contains(iconText)) svg.removeChild(iconText);
            }, 4100);
        } catch (err) {
            console.error("Error adding flow rate indicator:", err);
        }
    }
    
    startMonitoring() {
        // Initialize with sample rates based on simulation data
        const sampleRates = {
            chassis: 8,
            engine: 7.5,
            body: 6,
            interior: 7
        };
        
        // Set initial values
        for (const [type, rate] of Object.entries(sampleRates)) {
            this.flowRates[type] = rate;
            
            // Populate with sample readings
            const now = new Date();
            const count = Math.floor(rate);
            
            for (let i = 0; i < count; i++) {
                const pastTime = new Date(now.getTime() - (i * (60000 / count)));
                this.readings.push({
                    partType: type,
                    timestamp: pastTime
                });
            }
        }
        
        this.updateGauges();
        
        // Start periodic updates with automatic increment
        setInterval(() => {
            // Simulate new readings
            for (const type of Object.keys(this.flowRates)) {
                // Add a bit of randomness to flow rates
                const baseRate = sampleRates[type];
                const variation = (Math.random() - 0.5) * 2; // -1 to +1
                this.flowRates[type] = Math.max(0, baseRate + variation);
                
                // Add new reading with current timestamp
                this.readings.push({
                    partType: type,
                    timestamp: new Date()
                });
            }
            
            // Update gauges with new values
            this.calculateFlowRates();
            
            // Sometimes exceed thresholds to generate warnings/errors
            if (Math.random() < 0.05) {
                const types = Object.keys(this.flowRates);
                const randomType = types[Math.floor(Math.random() * types.length)];
                if (Math.random() < 0.5) {
                    // High flow rate
                    this.flowRates[randomType] = this.upperThreshold + 1 + Math.random() * 3;
                } else {
                    // Low flow rate
                    this.flowRates[randomType] = this.lowerThreshold - 1 - Math.random() * 2;
                }
            }
        }, 1000);
    }
    
    getFlowRate(partType) {
        return this.flowRates[partType] || 0;
    }
    
    isFlowRateNormal(partType) {
        const rate = this.getFlowRate(partType);
        return rate >= this.lowerThreshold && rate <= this.upperThreshold;
    }
    
    getThresholds() {
        return {
            upper: this.upperThreshold,
            lower: this.lowerThreshold
        };
    }
}