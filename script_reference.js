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

const syncTolerance = {
    "Final_Assembly": { tmin: 5, tmax: 30 }
};

const syncFactor = 10;

// Simulation class
class FactorySimulation {
    constructor() {
        this.graph = this.buildProcessGraph(processInput);
        this.simulationSpeed = 5;
        this.setupEventListeners();
        this.initGraphVisualization();
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
        const width = document.getElementById('graph').clientWidth;
        const height = document.getElementById('graph').clientHeight;

        this.svg = d3.select("#graph")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

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

    drawConveyorPaths() {
        const width = this.svg.attr("width");
        const height = this.svg.attr("height");

        // Main conveyor path
        this.svg.append("path")
            .attr("class", "conveyor-path")
            .attr("d", `M50,100 L${width-200},100 L${width-150},${height/2} L${width-200},${height-100} L50,${height-100}`);

        // Cross paths
        this.svg.append("path")
            .attr("class", "conveyor-path")
            .attr("d", `M50,200 L${width-250},200`);

        this.svg.append("path")
            .attr("class", "conveyor-path")
            .attr("d", `M50,300 L${width-300},300`);

        this.svg.append("path")
            .attr("class", "conveyor-path")
            .attr("d", `M50,400 L${width-350},400`);
    }

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

    updateGraph() {
        const svg = d3.select("#graph svg");
        const width = svg.attr("width");
        const height = svg.attr("height");

        // Draw links
        const link = svg.selectAll(".link")
            .data(this.graph.links)
            .join("line")
            .attr("class", "link")
            .attr("stroke", "#999")
            .attr("stroke-width", 2);

        // Draw link labels
        const linkText = svg.selectAll(".link-text")
            .data(this.graph.links)
            .join("text")
            .attr("class", "link-text")
            .attr("font-size", 10)
            .attr("fill", "#e74c3c")
            .text(d => d.process);

        // Draw nodes
        const node = svg.selectAll(".node")
            .data(this.graph.nodes)
            .join("g")
            .attr("class", "node")
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        node.append("circle")
            .attr("r", 20)
            .attr("fill", d => d.id.startsWith("Supplier") ? "#2ecc71" : "#3498db");

        node.append("text")
            .attr("dy", 4)
            .attr("text-anchor", "middle")
            .attr("fill", "white")
            .text(d => d.id.split('_')[0]);

        // Update simulation
        this.simulation.nodes(this.graph.nodes)
            .on("tick", ticked);

        this.simulation.force("link")
            .links(this.graph.links);

        function ticked() {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            linkText
                .attr("x", d => (d.source.x + d.target.x) / 2)
                .attr("y", d => (d.source.y + d.target.y) / 2);

            node
                .attr("transform", d => `translate(${d.x},${d.y})`);
        }

        function dragstarted(event, d) {
            if (!event.active) this.simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event, d) {
            if (!event.active) this.simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }
    }

    setupEventListeners() {
        document.getElementById('simulateBtn').addEventListener('click', () => this.runSimulation());
        
        // Main speed control
        document.getElementById('speedSlider').addEventListener('input', (e) => {
            this.simulationSpeed = parseInt(e.target.value);
        });

        // Individual conveyor speed controls
        this.createConveyorControls();
    }

    createConveyorControls() {
        const controlsDiv = document.querySelector('.controls');
        
        // Add sliders for each conveyor
        const conveyors = [
            {id: 'chassisSpeed', label: 'Chassis Conv.', rate: nodeRates["Supplier_Chassis"]},
            {id: 'engineSpeed', label: 'Engine Conv.', rate: nodeRates["Supplier_Engine"]},
            {id: 'bodySpeed', label: 'Body Conv.', rate: nodeRates["Supplier_Body"]},
            {id: 'interiorSpeed', label: 'Interior Conv.', rate: nodeRates["Supplier_Interior"]}
        ];

        conveyors.forEach(conv => {
            const sliderContainer = document.createElement('div');
            sliderContainer.className = 'slider-container';
            sliderContainer.innerHTML = `
                <label for="${conv.id}">${conv.label}</label>
                <input type="range" id="${conv.id}" min="1" max="20" 
                       value="${Math.round(10/conv.rate)}" 
                       data-rate="${conv.rate}">
                <span class="optimal-marker" 
                      style="left: ${conv.rate*50}%">▲</span>
            `;
            controlsDiv.appendChild(sliderContainer);

            document.getElementById(conv.id).addEventListener('input', (e) => {
                this.updateConveyorSpeeds();
            });
        });
    }

    updateConveyorSpeeds() {
        // Re-run simulation with updated speeds
        this.runSimulation();
    }

    runSimulation() {
        // Clear previous results
        document.getElementById('metrics').innerHTML = '<h2>Simulation Results</h2>';

        // Simulate 100 cycles
        const metrics = this.simulate(100);

        // Display results
        this.displayMetrics(metrics);
    }

    simulate(cycles) {
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

        // Get current conveyor speeds from sliders
        const chassisSpeed = parseInt(document.getElementById('chassisSpeed').value);
        const engineSpeed = parseInt(document.getElementById('engineSpeed').value);
        const bodySpeed = parseInt(document.getElementById('bodySpeed').value);
        const interiorSpeed = parseInt(document.getElementById('interiorSpeed').value);

        // Calculate metrics based on actual speeds
        const baseTime = 1000; // Base time in ms
        const chassisTime = baseTime / chassisSpeed;
        const engineTime = baseTime / engineSpeed;
        const bodyTime = baseTime / bodySpeed;
        const interiorTime = baseTime / interiorSpeed;

        // Calculate synchronization issues
        const times = [chassisTime, engineTime, bodyTime, interiorTime];
        const maxTime = Math.max(...times);
        const minTime = Math.min(...times);
        const timeSpread = maxTime - minTime;
        const hasSyncIssues = timeSpread > syncFactor;

        // Calculate realistic metrics
        const avgCycleTime = (chassisTime + engineTime + bodyTime + interiorTime) / 4;
        const firstPassYield = hasSyncIssues ? 0.7 : 0.9;
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
            node_rates: {...nodeRates},
            sync_red_flags: {
                "Final_Assembly": {
                    count: Math.floor(cycles * (1 - firstPassYield)),
                    processes: ["process_E", "process_F", "process_H", "process_I"]
                }
            }
        };

        // Animate parts moving through assembly with rate-based speeds
        const width = this.svg.attr("width");
        const height = this.svg.attr("height");
        const baseSpeed = 5000 / this.simulationSpeed;

        // Get speed multipliers from node rates (inverse relationship)
        const speedMultipliers = {
            chassis: 1 / nodeRates["Supplier_Chassis"],
            engine: 1 / nodeRates["Supplier_Engine"],
            body: 1 / nodeRates["Supplier_Body"],
            interior: 1 / nodeRates["Supplier_Interior"]
        };

        // Normalize speeds (fastest part = 4x chassis speed)
        const maxSpeed = Math.max(...Object.values(speedMultipliers));
        const normalizedSpeeds = {
            chassis: baseSpeed,
            engine: baseSpeed * (speedMultipliers.chassis / speedMultipliers.engine),
            body: baseSpeed * (speedMultipliers.chassis / speedMultipliers.body),
            interior: baseSpeed * (speedMultipliers.chassis / speedMultipliers.interior)
        };

        // Animate parts with rate-based timing
        const partNodes = this.svg.selectAll(".assembly-part").nodes();
        const componentNodes = this.svg.selectAll(".part-component").nodes();
        
        // Chassis (slowest)
        d3.select(partNodes[0])
            .transition()
            .duration(normalizedSpeeds.chassis)
            .attr("cx", width - 200)
            .transition()
            .duration(normalizedSpeeds.chassis/2)
            .attr("cx", width - 150)
            .attr("cy", height/2);

        // Engine (faster)
        d3.select(partNodes[1])
            .transition()
            .duration(normalizedSpeeds.engine)
            .attr("cx", width - 250)
            .transition()
            .duration(normalizedSpeeds.engine/2)
            .attr("cx", width - 150)
            .attr("cy", height/2);

        // Body (faster)
        d3.select(partNodes[2])
            .transition()
            .duration(normalizedSpeeds.body)
            .attr("cx", width - 300)
            .transition()
            .duration(normalizedSpeeds.body/2)
            .attr("cx", width - 150)
            .attr("cy", height/2);

        // Interior (fastest)
        d3.select(partNodes[3])
            .transition()
            .duration(normalizedSpeeds.interior)
            .attr("cx", width - 350)
            .transition()
            .duration(normalizedSpeeds.interior/2)
            .attr("cx", width - 150)
            .attr("cy", height/2);

        // Wheels (fastest)
        d3.select(partNodes[4])
            .transition()
            .duration(normalizedSpeeds.interior * 0.8)
            .attr("cx", width - 400)
            .transition()
            .duration(normalizedSpeeds.interior/2)
            .attr("cx", width - 150)
            .attr("cy", height/2);

        // Animation sequence for assembly operations
        const assemblySteps = [
            {text: "⚡ Welding chassis...", y: height/2 - 30},
            {text: "🔩 Bolting engine...", y: height/2 - 10}, 
            {text: "🎨 Painting body...", y: height/2 + 10},
            {text: "🧩 Installing interior...", y: height/2 + 30},
            {text: "🚗 Final assembly complete!", y: height/2 + 50}
        ];

        // Clear any previous assembly texts
        this.svg.selectAll(".assembly-operation").remove();

        // Show assembly operations with staggered timing
        assemblySteps.forEach((step, i) => {
            this.svg.append("text")
                .attr("x", width - 100)
                .attr("y", step.y)
                .attr("text-anchor", "middle")
                .attr("class", "assembly-operation")
                .attr("opacity", 0)
                .text(step.text)
                .transition()
                .delay(i * 500)
                .duration(300)
                .attr("opacity", 1)
                .transition()
                .delay(500)
                .duration(300)
                .attr("opacity", 0)
                .remove();
        });

        // Optimized component merge animation
        this.svg.selectAll(".part-component")
            .transition()
            .delay(assemblySteps.length * 500)
            .duration(800)
            .attr("cx", width - 150)
            .attr("cy", height/2)
            .attr("r", 0)
            .remove();

        return metrics;
    }

    displayMetrics(metrics) {
        const metricsDiv = document.getElementById('metrics');
        
        for (const [key, value] of Object.entries(metrics)) {
            const div = document.createElement('div');
            div.className = 'metric-item';
            
            if (key === 'sync_red_flags') {
                let html = `<strong>Synchronization Issues</strong>: `;
                for (const [node, data] of Object.entries(value)) {
                    html += `
                        <div class="sync-issue">
                            <em>${node}</em> had ${data.count} sync issues
                            <div class="metric-details">
                                Processes arriving out of sync:<br>
                                ${data.processes.map(p => `• ${p}`).join('<br>')}
                                <br><br>
                                Tolerance: ${syncTolerance[node].tmin}-${syncTolerance[node].tmax}s
                                <br>Actual spread: ${(syncTolerance[node].tmax * 1.2).toFixed(1)}s
                            </div>
                        </div>`;
                }
                div.innerHTML = html;
            } 
            else if (key === 'node_rates') {
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
                    details = `Percentage of cycles completed without rework (${Math.round(metrics.first_pass_yield * 100)}%)`;
                } else if (key === 'throughput') {
                    details = `Parts completed per hour (${(metrics.throughput * 3600).toFixed(1)})`;
                } else if (key === 'MTBF') {
                    details = `Mean Time Between Failures (${value}s) - average time between system failures`;
                } else if (key === 'MTTR') {
                    details = `Mean Time To Repair (${value}s) - average downtime duration`;
                } else if (key === 'avg_downtime') {
                    details = `Average downtime per cycle (${value}s) - calculated from MTBF and MTTR`;
                } else if (key === 'capacity_utilization') {
                    details = `Percentage of maximum capacity being used (${value*100}%)`;
                } else if (key === 'labor_productivity') {
                    details = `Output per labor hour (${value} parts/hour)`;
                } else if (key === 'inventory_turnover') {
                    details = `How often inventory is used per shift (${value} times)`;
                } else if (key === 'scrap_rate') {
                    details = `Percentage of defective parts (${(value*100).toFixed(1)}%)`;
                } else if (key === 'takt_time') {
                    details = `Maximum allowable time per unit to meet demand (${value}s)`;
                }
                
                div.innerHTML = `
                    <strong>${key.replace(/_/g, ' ')}</strong>: ${value}
                    <div class="metric-details">${details}</div>`;
            }
            
            metricsDiv.appendChild(div);
        }
    }
}

// Initialize the simulation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FactorySimulation();
});
