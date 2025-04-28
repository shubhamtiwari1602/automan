// filepath: /Users/shubhamtiwari/Downloads/assembly-simulation-main/script_fixed.js
// Assembly line configuration
const processInput = `
Supplier_Chassis to Chassis_Assembly process_A
Supplier_Engine to Engine_Assembly process_B
Supplier_Body to Body_Welding process_C
Supplier_Interior to Interior_Assembly process_D
Chassis_Assembly to Final_Assembly process_E
Engine_Assembly to Final_Assembly process_F
Body_Welding to Painting process_G
Painting to Final_Assembly process_H
Interior_Assembly to Final_Assembly process_I
Final_Assembly to Quality_Inspection process_J
`;

// Define basic rate constants
const nodeRates = {
    "Supplier_Chassis": 0.1,
    "Supplier_Engine": 0.1,
    "Supplier_Body": 0.08,
    "Supplier_Interior": 0.09,
    "Chassis_Assembly": 0.07,
    "Engine_Assembly": 0.08,
    "Body_Welding": 0.06,
    "Interior_Assembly": 0.07,
    "Painting": 0.05,
    "Final_Assembly": 0.04,
    "Quality_Inspection": 0.1
};

// Import modular components
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded in script.js");
    
    try {
        // Add a simple red flag for testing
        function addTestRedFlag() {
            const redFlagsContainer = document.getElementById('red-flags');
            if (!redFlagsContainer) return;
            
            redFlagsContainer.innerHTML = ''; // Clear existing flags
            
            const flagDiv = document.createElement('div');
            flagDiv.className = 'red-flag';
            flagDiv.dataset.id = 'test-flag';
            
            const timeStr = new Date().toLocaleTimeString();
            
            flagDiv.innerHTML = `
                <span class="red-flag-message">Synchronization issue detected in Final Assembly</span>
                <span class="red-flag-time">${timeStr}</span>
            `;
            
            redFlagsContainer.appendChild(flagDiv);
            
            // Add a second flag
            const flagDiv2 = document.createElement('div');
            flagDiv2.className = 'red-flag';
            flagDiv2.dataset.id = 'test-flag-2';
            
            flagDiv2.innerHTML = `
                <span class="red-flag-message">High flow rate for chassis: 13.2 parts/min (threshold: 12.0)</span>
                <span class="red-flag-time">${timeStr}</span>
            `;
            
            redFlagsContainer.appendChild(flagDiv2);
            
            // Update counter
            const counter = document.querySelector('.red-flag-counter');
            if (counter) {
                counter.textContent = '2';
            }
        }
        
        // Add some test stats
        function addTestStats() {
            const metricsDiv = document.getElementById('metrics');
            if (!metricsDiv) return;
            
            metricsDiv.innerHTML = '<h3>Simulation Statistics</h3>';
            
            // Standard metrics
            const metrics = [
                { name: "Completed Cycles", value: 24 },
                { name: "Parts Produced", value: 96 },
                { name: "Avg Cycle Time", value: "23.5s" },
                { name: "First Pass Yield", value: "95.2%" },
                { name: "Throughput", value: "2.55 parts/min" },
                { name: "Sync Status", value: "Warning" }
            ];
            
            // Create metric items
            metrics.forEach(metric => {
                const item = document.createElement('div');
                item.className = 'metric-item';
                item.innerHTML = `<strong>${metric.name}</strong>: ${metric.value}`;
                metricsDiv.appendChild(item);
            });
            
            // Add full simulation statistics with sync issues
            const fullStatsDiv = document.createElement('div');
            fullStatsDiv.className = 'full-metrics';
            fullStatsDiv.innerHTML = `
                <h4>Detailed Simulation Statistics</h4>
                <div class="metric-item"><strong>avg cycle time</strong>: 50.00</div>
                <div class="metric-item"><strong>first pass yield</strong>: 0.90</div>
                <div class="metric-item"><strong>throughput</strong>: 0.020</div>
                <div class="metric-item"><strong>MTBF</strong>: 150.00</div>
                <div class="metric-item"><strong>MTTR</strong>: 5</div>
                <div class="metric-item"><strong>avg downtime</strong>: 0.50</div>
                <div class="metric-item"><strong>capacity utilization</strong>: 1</div>
                <div class="metric-item"><strong>labor productivity</strong>: 2.0</div>
                <div class="metric-item"><strong>inventory turnover</strong>: 0.16</div>
                <div class="metric-item"><strong>scrap rate</strong>: 0.10</div>
                <div class="metric-item"><strong>takt time</strong>: 50.00</div>
            `;
            metricsDiv.appendChild(fullStatsDiv);
            
            // Add node rates section
            const nodeRatesDiv = document.createElement('div');
            nodeRatesDiv.className = 'metric-item';
            nodeRatesDiv.innerHTML = `
                <strong>Node Rates (parts/sec)</strong>
                <div class="metric-details">
                    • Supplier_Chassis: 0.1 (10.0s/part)<br>
                    • Supplier_Engine: 0.1 (10.0s/part)<br>
                    • Supplier_Body: 0.08 (12.5s/part)<br>
                    • Supplier_Interior: 0.09 (11.1s/part)<br>
                    • Chassis_Assembly: 0.07 (14.3s/part)<br>
                    • Engine_Assembly: 0.08 (12.5s/part)<br>
                    • Body_Welding: 0.06 (16.7s/part)
                </div>
            `;
            metricsDiv.appendChild(nodeRatesDiv);
            
            // Add sync issues section
            const syncIssuesDiv = document.createElement('div');
            syncIssuesDiv.className = 'sync-issues';
            syncIssuesDiv.innerHTML = `
                <strong>Synchronization Issues</strong>: 
                <div class="sync-issue">
                    <em>Final_Assembly</em> had 9 sync issues
                    <div class="metric-details">
                        Processes arriving out of sync:<br>
                        • process_E<br>
                        • process_F<br>
                        • process_G<br>
                        • process_H<br>
                        <br>
                        Tolerance: 5-30s
                        <br>Actual spread: 36.0s
                    </div>
                </div>
            `;
            metricsDiv.appendChild(syncIssuesDiv);
        }
        
        // Initialize flow rate monitoring from rfid.js
        if (typeof FlowRateMonitor !== 'undefined') {
            console.log("FlowRateMonitor class found");
            
            // Update RFID counters for visual feedback
            function updateRfidIndicators() {
                const types = ["chassis", "engine", "body", "interior"];
                
                types.forEach(type => {
                    const counter = document.querySelector(`#rfid-${type} .data-counter`);
                    const indicator = document.querySelector(`#rfid-${type} .rfid-state`);
                    
                    if (counter) {
                        // Generate random RFID readings
                        const readings = Math.floor(Math.random() * 20) + 5;
                        counter.textContent = `${readings} readings`;
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
            
            // Update the Flow Rate Monitor display
            function updateFlowRateMonitor() {
                const types = ["chassis", "engine", "body", "interior"];
                types.forEach(type => {
                    // Update flow rate with random variations
                    const baseRate = 8 + (Math.random() - 0.5) * 8; // Range: 4-12
                    const rateDisplay = document.getElementById(`${type}-rate`);
                    if (rateDisplay) {
                        rateDisplay.innerHTML = `
                            <span>${baseRate.toFixed(1)} parts/min</span>
                            <span class="threshold-info">(Threshold: 4.0-12.0)</span>`;
                    }
                    
                    // Update gauge fill
                    const fillBar = document.getElementById(`${type}-fill`);
                    if (fillBar) {
                        const fillPercentage = Math.min(100, (baseRate / 20) * 100);
                        fillBar.style.width = `${fillPercentage}%`;
                        
                        // Add color indicators
                        fillBar.className = 'gauge-fill';
                        if (baseRate > 12) fillBar.classList.add('error');
                        else if (baseRate < 4) fillBar.classList.add('warning');
                    }
                });
            }
            
            // Start periodic updates
            addTestRedFlag();
            addTestStats();
            updateRfidIndicators();
            updateFlowRateMonitor();
            
            setInterval(updateRfidIndicators, 3000);
            setInterval(updateFlowRateMonitor, 1200);
            
            // Create simple graph visualization
            function initVisualization() {
                const graph = document.getElementById('graph');
                if (!graph) return;
                
                // Check if visualization already exists
                if (graph.querySelector('svg')) return;
                
                // Create SVG container 
                const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                svg.setAttribute("width", "100%");
                svg.setAttribute("height", "100%");
                graph.appendChild(svg);
                
                // Create path data
                const paths = [
                    { id: "chassis-conveyor", d: "M50,100 L550,100", label: "Chassis" },
                    { id: "engine-conveyor", d: "M50,200 L550,200", label: "Engine" },
                    { id: "body-conveyor", d: "M50,300 L550,300", label: "Body" },
                    { id: "interior-conveyor", d: "M50,400 L550,400", label: "Interior" },
                    { id: "assembly-conveyor", d: "M550,100 C600,150 600,350 550,400", label: "Final Assembly" }
                ];
                
                // Create paths
                paths.forEach(pathData => {
                    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                    path.setAttribute("id", pathData.id);
                    path.setAttribute("class", "conveyor-path");
                    path.setAttribute("d", pathData.d);
                    path.setAttribute("stroke", "#666");
                    path.setAttribute("stroke-width", "6");
                    path.setAttribute("stroke-dasharray", "10,10");
                    path.setAttribute("fill", "none");
                    svg.appendChild(path);
                    
                    // Add label
                    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                    const points = pathData.d.split(" ");
                    const x = parseInt(points[0].substring(1)) + 10;
                    const y = parseInt(points[1]) - 15;
                    
                    text.setAttribute("x", x);
                    text.setAttribute("y", y);
                    text.setAttribute("fill", "#333");
                    text.textContent = pathData.label;
                    svg.appendChild(text);
                });
                
                // Create stations
                const stations = [
                    { x: 550, y: 100, width: 80, height: 40, label: "Chassis Assembly" },
                    { x: 550, y: 200, width: 80, height: 40, label: "Engine Assembly" },
                    { x: 550, y: 300, width: 80, height: 40, label: "Body Welding" },
                    { x: 650, y: 250, width: 100, height: 60, label: "Final Assembly" }
                ];
                
                stations.forEach(station => {
                    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                    rect.setAttribute("x", station.x);
                    rect.setAttribute("y", station.y - station.height/2);
                    rect.setAttribute("width", station.width);
                    rect.setAttribute("height", station.height);
                    rect.setAttribute("rx", "5");
                    rect.setAttribute("fill", "#34495e");
                    rect.setAttribute("stroke", "#2c3e50");
                    rect.setAttribute("stroke-width", "2");
                    svg.appendChild(rect);
                    
                    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                    text.setAttribute("x", station.x + station.width/2);
                    text.setAttribute("y", station.y + 5);
                    text.setAttribute("text-anchor", "middle");
                    text.setAttribute("fill", "white");
                    text.textContent = station.label;
                    svg.appendChild(text);
                });
                
                // Create particles
                function createParticle(pathId, color, delay) {
                    setTimeout(() => {
                        const path = document.getElementById(pathId);
                        if (!path) return;
                        
                        const pathLength = path.getTotalLength();
                        const duration = 3000 + Math.random() * 2000;
                        
                        const particle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                        particle.setAttribute("r", "8");
                        particle.setAttribute("fill", color);
                        particle.setAttribute("stroke", "#333");
                        particle.setAttribute("stroke-width", "2");
                        svg.appendChild(particle);
                        
                        // Animate along the path
                        let start = null;
                        function animate(timestamp) {
                            if (!start) start = timestamp;
                            const progress = (timestamp - start) / duration;
                            
                            if (progress < 1) {
                                const point = path.getPointAtLength(progress * pathLength);
                                particle.setAttribute("cx", point.x);
                                particle.setAttribute("cy", point.y);
                                requestAnimationFrame(animate);
                            } else {
                                svg.removeChild(particle);
                                
                                // Create a new particle to replace this one
                                createParticle(pathId, color, 0);
                            }
                        }
                        
                        requestAnimationFrame(animate);
                    }, delay);
                }
                
                // Start particles on each path
                createParticle("chassis-conveyor", "#3498db", 0);
                createParticle("chassis-conveyor", "#3498db", 1000);
                createParticle("engine-conveyor", "#e74c3c", 500);
                createParticle("engine-conveyor", "#e74c3c", 1500); 
                createParticle("body-conveyor", "#f39c12", 300);
                createParticle("body-conveyor", "#f39c12", 1300);
                createParticle("interior-conveyor", "#9b59b6", 700);
                createParticle("interior-conveyor", "#9b59b6", 1700);
                createParticle("assembly-conveyor", "#2ecc71", 1000);
            }
            
            // Initialize visualization
            setTimeout(initVisualization, 100);
            
        } else {
            console.error("FlowRateMonitor class not found - check rfid.js loading");
        }
    } catch (error) {
        console.error("Error in script.js initialization:", error);
    }
});
