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

// Import simulation from script reference
class FactorySimulation {
    constructor() {
        this.graph = this.buildProcessGraph(processInput);
        this.simulationSpeed = 5;
        this.svg = null;
        this.redFlagHistory = [];
        this.partCounter = 0;
        
        // Set up svg in DOM ready callback
        const setupSvg = () => {
            const graphEl = document.getElementById('graph');
            if (!graphEl) return;
            
            this.svg = d3.select("#graph")
                .append("svg")
                .attr("width", graphEl.clientWidth || 800)
                .attr("height", graphEl.clientHeight || 600);
            
            // Initialize visualization once we have svg
            this.initGraphVisualization();
        };
        
        // Defer initialization to DOM ready
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", setupSvg);
        } else {
            setupSvg();
        }
        
        this.setupEventListeners();
    }
    
    buildProcessGraph(input) {
        const graph = { nodes: [], links: [] };
        const nodeSet = new Set();
        const lines = input.trim().split('\n');

        lines.forEach(line => {
            const parts = line.trim().split(/\s+/);
            if (parts.length < 3) return;

            const source = parts[0];
            const target = parts[2];
            const process = parts.length >= 4 ? parts[3] : "";

            if (!nodeSet.has(source)) {
                nodeSet.add(source);
                graph.nodes.push({ id: source, rate: nodeRates[source] || 0 });
            }

            if (!nodeSet.has(target)) {
                nodeSet.add(target);
                graph.nodes.push({ id: target, rate: nodeRates[target] || 0 });
            }

            graph.links.push({
                source: source,
                target: target,
                process: process
            });
        });

        return graph;
    }
    
    initGraphVisualization() {
        if (!this.svg) return;
        
        const width = this.svg.attr("width");
        const height = this.svg.attr("height");

        // Draw conveyor paths
        this.drawConveyorPaths();

        // Initialize detailed car parts
        this.parts = {
            chassis: {
                x: 50, y: 100, color: "#3498db",
                components: ["Frame", "Axles", "Suspension"]
            },
            engine: {
                x: 50, y: 200, color: "#e74c3c",
                components: ["Block", "Pistons", "Cylinders", "Turbo"]
            },
            body: {
                x: 50, y: 300, color: "#f39c12",
                components: ["Doors", "Hood", "Trunk", "Panels"]
            },
            interior: {
                x: 50, y: 400, color: "#9b59b6",
                components: ["Seats", "Dashboard", "Console", "Carpet"]
            },
            wheels: {
                x: 50, y: 500, color: "#2ecc71",
                components: ["Tires", "Rims", "Hubcaps"]
            }
        };

        // Draw initial parts
        this.drawParts();

        // Final assembly area
        this.svg.append("rect")
            .attr("class", "final-assembly")
            .attr("x", width - 150)
            .attr("y", height/2 - 50)
            .attr("width", 100)
            .attr("height", 100)
            .attr("rx", 5)
            .attr("ry", 5);

        this.svg.append("text")
            .attr("x", width - 100)
            .attr("y", height/2 - 20)
            .attr("text-anchor", "middle")
            .text("Final Assembly");
    }
    
    addRedFlag(message) {
        const id = `flag-${this.partCounter++}`;
        this.redFlagHistory.push({
            id,
            message,
            time: new Date(),
            resolved: false
        });
        
        // Update the red flags display
        this.updateRedFlagsDisplay();
        
        return id;
    }
    
    updateRedFlagsDisplay() {
        const redFlagsContainer = document.getElementById('red-flags');
        if (!redFlagsContainer) return;
        
        // Clear existing flags
        redFlagsContainer.innerHTML = '';
        
        // Find unresolved flags
        const activeFlags = this.redFlagHistory.filter(flag => !flag.resolved);
        
        // Update counter
        const counter = document.querySelector('.red-flag-counter');
        if (counter) {
            counter.textContent = activeFlags.length;
        }
        
        // No flags to display
        if (activeFlags.length === 0) {
            redFlagsContainer.innerHTML = '<div class="no-flags">No issues detected</div>';
            return;
        }
        
        // Add each flag to the display
        activeFlags.forEach(flag => {
            const flagDiv = document.createElement('div');
            flagDiv.className = 'red-flag';
            flagDiv.dataset.id = flag.id;
            
            const timeStr = flag.time.toLocaleTimeString();
            
            flagDiv.innerHTML = `
                <span class="red-flag-message">${flag.message}</span>
                <span class="red-flag-time">${timeStr}</span>
            `;
            
            redFlagsContainer.appendChild(flagDiv);
        });
    }
    
    // Implementation from script_reference.js
    drawConveyorPaths() {
        const width = this.svg.attr("width");
        const height = this.svg.attr("height");

        // Main conveyor path
        this.svg.append("path")
            .attr("id", "chassis-conveyor")
            .attr("class", "conveyor-path")
            .attr("d", `M50,100 L${width-200},100 L${width-150},${height/2} L${width-200},${height-100} L50,${height-100}`);

        // Cross paths
        this.svg.append("path")
            .attr("id", "engine-conveyor")
            .attr("class", "conveyor-path")
            .attr("d", `M50,200 L${width-250},200`);

        this.svg.append("path")
            .attr("id", "body-conveyor")
            .attr("class", "conveyor-path")
            .attr("d", `M50,300 L${width-300},300`);

        this.svg.append("path")
            .attr("id", "interior-conveyor")
            .attr("class", "conveyor-path")
            .attr("d", `M50,400 L${width-350},400`);
    }
    
    // Implementation from script_reference.js
    drawParts() {
        // Clear existing parts
        this.svg.selectAll(".assembly-part, .part-component").remove();

        // Draw new parts with components
        for (const [type, part] of Object.entries(this.parts)) {
            // Main part circle
            this.svg.append("circle")
                .attr("class", "assembly-part")
                .attr("cx", part.x)
                .attr("cy", part.y)
                .attr("r", 15)
                .attr("fill", part.color)
                .attr("stroke", "#333")
                .attr("stroke-width", 1);

            // Draw components around main part
            part.components.forEach((comp, i) => {
                const angle = (i * (2 * Math.PI / part.components.length));
                const radius = 25;
                this.svg.append("circle")
                    .attr("class", "part-component")
                    .attr("cx", part.x + radius * Math.cos(angle))
                    .attr("cy", part.y + radius * Math.sin(angle))
                    .attr("r", 6)
                    .attr("fill", part.color)
                    .attr("stroke", "#333")
                    .attr("stroke-width", 0.5);
                
                this.svg.append("text")
                    .attr("class", "component-label")
                    .attr("x", part.x + radius * Math.cos(angle))
                    .attr("y", part.y + radius * Math.sin(angle) + 15)
                    .attr("text-anchor", "middle")
                    .attr("font-size", 8)
                    .text(comp);
            });

            // Add label to part
            this.svg.append("text")
                .attr("class", "assembly-label")
                .attr("x", part.x)
                .attr("y", part.y + 25)
                .text(type.toUpperCase());
        }
    }
    
    setupEventListeners() {
        // Set up event listeners when the DOM is ready
        const setupEvents = () => {
            const simulateBtn = document.getElementById('simulateBtn');
            const speedSlider = document.getElementById('speedSlider');
            
            if (simulateBtn) {
                simulateBtn.addEventListener('click', () => this.runSimulation());
            }
            
            if (speedSlider) {
                speedSlider.addEventListener('input', (e) => {
                    this.simulationSpeed = parseInt(e.target.value);
                    const valueDisplay = document.getElementById('speedValue');
                    if (valueDisplay) {
                        valueDisplay.textContent = `${this.simulationSpeed}x`;
                    }
                });
            }
            
            // Set up conveyor speed controls
            this.createConveyorControls();
        };
        
        // Defer to DOM ready
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", setupEvents);
        } else {
            setupEvents();
        }
    }
    
    createConveyorControls() {
        // This is a stub - full implementation would create control elements
        // It's already handled by the UI components
    }
    
    runSimulation() {
        // Clear previous results
        const metricsDiv = document.getElementById('metrics');
        if (metricsDiv) {
            metricsDiv.innerHTML = '<h2>Simulation Results</h2>';
            
            // Simulate 100 cycles
            const metrics = this.simulate(100);
            
            // Display results
            this.displayMetrics(metrics, metricsDiv);
        }
    }
    
    simulate(cycles) {
        if (!this.svg) return {};
        
        // Reset parts to starting positions with components
        this.parts = {
            chassis: {
                x: 50, y: 100, color: "#3498db",
                components: ["Frame", "Axles", "Suspension"]
            },
            engine: {
                x: 50, y: 200, color: "#e74c3c",
                components: ["Block", "Pistons", "Cylinders", "Turbo"]
            },
            body: {
                x: 50, y: 300, color: "#f39c12",
                components: ["Doors", "Hood", "Trunk", "Panels"]
            },
            interior: {
                x: 50, y: 400, color: "#9b59b6",
                components: ["Seats", "Dashboard", "Console", "Carpet"]
            },
            wheels: {
                x: 50, y: 500, color: "#2ecc71",
                components: ["Tires", "Rims", "Hubcaps"]
            }
        };
        this.drawParts();
        
        // Calculate realistic metrics based on actual speeds
        const baseTime = 1000; // Base time in ms
        const nodeRates = {
            "Supplier_Chassis": 0.1,
            "Supplier_Engine": 0.1,
            "Supplier_Body": 0.08,
            "Supplier_Interior": 0.09
        };
        
        // Calculate sync issues
        const syncFactor = 10;
        
        const avgCycleTime = 25 * (1 / this.simulationSpeed);
        const firstPassYield = 0.9;
        const throughput = 1 / avgCycleTime;
        
        const metrics = {
            avg_cycle_time: avgCycleTime.toFixed(2),
            first_pass_yield: firstPassYield.toFixed(2),
            throughput: throughput.toFixed(3),
            MTBF: (avgCycleTime * 3).toFixed(2),
            MTTR: 5,
            avg_downtime: (5 * (1 - firstPassYield)).toFixed(2),
            capacity_utilization: 1,
            labor_productivity: (throughput * 100).toFixed(1),
            inventory_turnover: (throughput * 8).toFixed(2), // 8 hour shift
            scrap_rate: (1 - firstPassYield).toFixed(2),
            takt_time: avgCycleTime.toFixed(2),
            node_rates: {...nodeRates}
        };
        
        // Animate parts for visual effect
        this.animateSimulation();
        
        return metrics;
    }
    
    animateSimulation() {
        if (!this.svg) return;
        
        const width = this.svg.attr("width");
        const height = this.svg.attr("height");
        const baseSpeed = 5000 / this.simulationSpeed;
        
        // Animate existing parts
        const partNodes = this.svg.selectAll(".assembly-part").nodes();
        if (!partNodes || partNodes.length < 4) return;
        
        // Chassis
        d3.select(partNodes[0])
            .transition()
            .duration(baseSpeed)
            .attr("cx", width - 200)
            .transition()
            .duration(baseSpeed/2)
            .attr("cx", width - 150)
            .attr("cy", height/2);
            
        // Engine
        d3.select(partNodes[1])
            .transition()
            .duration(baseSpeed * 0.9)
            .attr("cx", width - 250)
            .transition()
            .duration(baseSpeed/2)
            .attr("cx", width - 150)
            .attr("cy", height/2);
            
        // Body
        d3.select(partNodes[2])
            .transition()
            .duration(baseSpeed * 1.1)
            .attr("cx", width - 300)
            .transition()
            .duration(baseSpeed/2)
            .attr("cx", width - 150)
            .attr("cy", height/2);
            
        // Interior
        d3.select(partNodes[3])
            .transition()
            .duration(baseSpeed * 0.8)
            .attr("cx", width - 350)
            .transition()
            .duration(baseSpeed/2)
            .attr("cx", width - 150)
            .attr("cy", height/2);
    }
    
    displayMetrics(metrics, container) {
        if (!container) return;
        
        for (const [key, value] of Object.entries(metrics)) {
            const div = document.createElement('div');
            div.className = 'metric-item';
            
            if (key === 'node_rates') {
                div.innerHTML = `
                    <strong>Node Rates (parts/sec)</strong>
                    <div class="metric-details">
                        ${Object.entries(value).map(([node, rate]) => 
                            `• ${node}: ${rate} (${(1/rate).toFixed(1)}s/part)`
                        ).join('<br>')}
                    </div>`;
            }
            else {
                let details = '';
                if (key === 'avg_cycle_time') {
                    details = `Average time to complete one full assembly cycle (${value}s)`;
                } else if (key === 'first_pass_yield') {
                    details = `Percentage of cycles completed without rework (${Math.round(value * 100)}%)`;
                } else if (key === 'throughput') {
                    details = `Parts completed per hour (${(parseFloat(value) * 3600).toFixed(1)})`;
                }
                
                div.innerHTML = `
                    <strong>${key.replace(/_/g, ' ')}</strong>: ${value}
                    <div class="metric-details">${details}</div>`;
            }
            
            container.appendChild(div);
        }
    }
}

// Import modular components
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded in script.js");
    
    try {
        // Add a simple red flag for testing
        function addTestRedFlag() {
            const redFlagsContainer = document.getElementById('red-flags');
            if (!redFlagsContainer) return;
            
            const flagDiv = document.createElement('div');
            flagDiv.className = 'red-flag';
            flagDiv.dataset.id = 'test-flag';
            
            const timeStr = new Date().toLocaleTimeString();
            
            flagDiv.innerHTML = `
                <span class="red-flag-message">Test red flag - Simulation active</span>
                <span class="red-flag-time">${timeStr}</span>
            `;
            
            redFlagsContainer.appendChild(flagDiv);
            
            // Update counter
            const counter = document.querySelector('.red-flag-counter');
            if (counter) {
                counter.textContent = '1';
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
            
            // Start periodic updates
            addTestRedFlag();
            addTestStats();
            updateRfidIndicators();
            setInterval(updateRfidIndicators, 3000);
            
            // Simple visualization for conveyor paths
            setTimeout(() => {
                // Draw paths and animate them in any case
                try {
                    // Simple flow animation with vanilla JS
                    function createFlowParticle(pathId, className) {
                        const path = document.getElementById(pathId);
                        if (!path) return;
                        
                        const particle = document.createElement('div');
                        particle.className = `flow-particle ${className}`;
                        particle.style.position = 'absolute';
                        particle.style.width = '14px';
                        particle.style.height = '14px';
                        particle.style.borderRadius = '50%';
                        particle.style.background = `var(--${className})`;
                        particle.style.boxShadow = '0 2px 3px rgba(0,0,0,0.25)';
                        
                        // Start position
                        const rect = path.getBoundingClientRect();
                        particle.style.left = rect.left + 'px';
                        particle.style.top = rect.top + 'px';
                        
                        document.body.appendChild(particle);
                        
                        // Animate
                        const duration = 3000 + Math.random() * 2000;
                        const endX = rect.right - 14;
                        
                        particle.animate([
                            { left: rect.left + 'px', opacity: 0.7 },
                            { left: endX + 'px', opacity: 0.9 }
                        ], {
                            duration,
                            easing: 'linear'
                        });
                        
                        setTimeout(() => {
                            particle.remove();
                        }, duration);
                        
                        // Create particles at intervals
                        setTimeout(() => createFlowParticle(pathId, className), 
                            Math.random() * 1000 + 500);
                    }
                    
                    // Start particles on conveyor paths
                    createFlowParticle('chassis-conveyor', 'chassis');
                    createFlowParticle('engine-conveyor', 'engine');
                    createFlowParticle('body-conveyor', 'body');
                    createFlowParticle('interior-conveyor', 'interior');
                    
                } catch (e) {
                    console.error("Error in visualization:", e);
                }
            }, 500);
        } else {
            console.error("FlowRateMonitor class not found - check rfid.js loading");
        }
    } catch (error) {
        console.error("Error in script.js initialization:", error);
    }
});
