import { nodeRates, rfidCheckpoints, syncTolerance, syncFactor } from './simulation-config.js';
import SimulationVisualization from './simulation-visualization.js';
import SimulationAnimations from './simulation-animations.js';
import RFIDSystem from './simulation-rfid.js';

class Simulation {
    constructor() {
        // Initialize the SVG element
        const graphElement = document.getElementById('graph');
        this.svg = d3.select("#graph")
            .append("svg")
            .attr("width", graphElement ? graphElement.clientWidth : 800)
            .attr("height", graphElement ? graphElement.clientHeight : 600);
        
        this.visualization = new SimulationVisualization(this.svg);
        this.animations = new SimulationAnimations(this.svg);
        this.rfidSystem = new RFIDSystem();
        this.simulationSpeed = 1.0;
        this.redFlagHistory = [];
        this.partCounter = 0;
        this.stats = {
            cycles: 0,
            completedParts: 0,
            avgCycleTime: 0,
            firstPassYield: 0.95,
            throughput: 0
        };
        
        // Track moving parts
        this.activeParts = [];
        
        // Set up conveyor paths
        this.conveyorPaths = {};
    }

    start() {
        // Draw the basic layout
        this.visualization.drawConveyorPath();
        
        // Create paths for each component type with IDs for referencing
        this.createComponentPaths();
        
        // Draw RFID checkpoints
        this.visualization.drawRFIDCheckpoints(rfidCheckpoints);
        
        // Draw assembly stations
        this.visualization.drawAssemblyStation({ x: 250, y: 100, label: "Chassis Assembly" });
        this.visualization.drawAssemblyStation({ x: 250, y: 200, label: "Engine Assembly" });
        this.visualization.drawAssemblyStation({ x: 250, y: 300, label: "Body Welding" });
        this.visualization.drawAssemblyStation({ x: 500, y: 300, label: "Final Assembly" });
        
        // Initialize continuous flow
        this.startContinuousFlow();
        
        // Initialize metrics display
        this.updateMetricsDisplay();
    }
    
    createComponentPaths() {
        // Create individual paths for different component types
        this.svg.append("path")
            .attr("id", "chassis-conveyor")
            .attr("class", "conveyor-path")
            .attr("d", "M50,100 H250");
            
        this.svg.append("path")
            .attr("id", "engine-conveyor")
            .attr("class", "conveyor-path")
            .attr("d", "M50,200 H250");
            
        this.svg.append("path")
            .attr("id", "body-conveyor")
            .attr("class", "conveyor-path")
            .attr("d", "M50,300 H250");
            
        this.svg.append("path")
            .attr("id", "interior-conveyor")
            .attr("class", "conveyor-path")
            .attr("d", "M50,400 H250");
            
        this.svg.append("path")
            .attr("id", "assembly-conveyor")
            .attr("class", "conveyor-path")
            .attr("d", "M250,300 Q270,300 270,280 V150 Q270,130 290,130 H450 Q470,130 470,150 V280 Q470,300 490,300 H600");
    }
    
    startContinuousFlow() {
        // Start continuous flow for each component type
        this.startComponentFlow("chassis", "chassis-conveyor", 4000);
        this.startComponentFlow("engine", "engine-conveyor", 4500);
        this.startComponentFlow("body", "body-conveyor", 5000);
        this.startComponentFlow("interior", "interior-conveyor", 4200);
    }
    
    startComponentFlow(partType, pathId, baseDuration) {
        const path = document.getElementById(pathId);
        if (!path) return;
        
        const createPart = () => {
            // Check if the SVG still exists
            if (!this.svg || !this.svg.node()) return;
            
            const pathLength = path.getTotalLength();
            
            // Create a component with proper styling
            const part = this.svg.append("circle")
                .attr("class", `assembly-part ${partType}`)
                .attr("r", 12)
                .attr("cx", path.getPointAtLength(0).x)
                .attr("cy", path.getPointAtLength(0).y)
                .attr("fill", `var(--${partType})`)
                .attr("stroke", "#333")
                .attr("stroke-width", 2);
            
            // Add RFID tracking to some parts
            const hasRFID = Math.random() > 0.3;
            if (hasRFID) {
                part.classed("with-rfid", true);
                const tagId = `${partType}-${Date.now()}`;
                
                // Register with RFID system
                this.rfidSystem.addTag(tagId, {
                    type: partType,
                    createdAt: new Date()
                });
                
                // Visual indicator for RFID
                this.svg.append("circle")
                    .attr("class", "rfid-indicator")
                    .attr("r", 4)
                    .attr("cx", path.getPointAtLength(0).x)
                    .attr("cy", path.getPointAtLength(0).y)
                    .attr("fill", "var(--secondary)")
                    .attr("opacity", 0.8);
            }
            
            // Animate part along the path
            const duration = baseDuration / this.simulationSpeed;
            
            part.transition()
                .duration(duration)
                .ease(d3.easeLinear) // Linear movement for consistent speed
                .attrTween("transform", () => {
                    return (t) => {
                        const point = path.getPointAtLength(t * pathLength);
                        return `translate(${point.x}, ${point.y})`;
                    };
                })
                .on("end", () => {
                    // When part reaches the end of this conveyor
                    if (hasRFID) {
                        // Update RFID system
                        this.rfidSystem.updateReading(partType, true, { 
                            timestamp: Date.now(),
                            location: pathId
                        });
                        
                        // Update RFID indicator in UI
                        const indicator = document.querySelector(`#rfid-${partType} .rfid-state`);
                        if (indicator) {
                            indicator.textContent = "Active";
                            indicator.classList.add("active");
                            
                            // Reset after a delay
                            setTimeout(() => {
                                indicator.textContent = "Idle";
                                indicator.classList.remove("active");
                            }, 2000);
                        }
                    }
                    
                    // Remove the part
                    part.remove();
                    
                    // Update stats
                    this.stats.completedParts++;
                    if (this.stats.completedParts % 10 === 0) {
                        this.stats.cycles++;
                        this.updateMetricsDisplay();
                    }
                });
                
            // Add to active parts list
            this.activeParts.push({
                element: part,
                type: partType,
                path: path,
                pathId: pathId,
                hasRFID: hasRFID,
                startTime: Date.now()
            });
        };
        
        // Create initial parts
        for (let i = 0; i < 3; i++) {
            setTimeout(() => createPart(), i * (baseDuration / 5));
        }
        
        // Schedule new parts
        const interval = Math.max(300, baseDuration / 3);
        setInterval(createPart, interval);
    }
    
    updateMetricsDisplay() {
        const metricsDiv = document.getElementById('metrics');
        if (!metricsDiv) return;
        
        // Calculate realistic metrics
        this.stats.avgCycleTime = 23.5 - (this.stats.cycles * 0.05);
        this.stats.throughput = (60 / this.stats.avgCycleTime).toFixed(2);
        
        // Clear previous content
        metricsDiv.innerHTML = '<h3>Simulation Statistics</h3>';
        
        // Create metrics display
        const metrics = [
            { name: "Completed Cycles", value: this.stats.cycles },
            { name: "Parts Produced", value: this.stats.completedParts },
            { name: "Avg Cycle Time", value: `${this.stats.avgCycleTime.toFixed(1)}s` },
            { name: "First Pass Yield", value: `${(this.stats.firstPassYield * 100).toFixed(1)}%` },
            { name: "Throughput", value: `${this.stats.throughput} parts/min` },
            { name: "Sync Issues", value: this.rfidSystem.checkSyncStatus() ? "None" : "Warning" }
        ];
        
        // Create metric items
        metrics.forEach(metric => {
            const item = document.createElement('div');
            item.className = 'metric-item';
            item.innerHTML = `<strong>${metric.name}</strong>: ${metric.value}`;
            metricsDiv.appendChild(item);
        });
    }

    update() {
        // Animation effects at assembly stations
        this.animations.createWeldingEffect({ x: 250, y: 100 });
        this.animations.createPaintingEffect({ x: 500, y: 300 });
        this.animations.createAssemblyEffect({ x: 250, y: 200 });
        
        // Update RFID readings periodically
        if (Math.random() > 0.95) {
            const types = ["chassis", "engine", "body", "interior"];
            const randomType = types[Math.floor(Math.random() * types.length)];
            
            this.rfidSystem.updateReading(randomType, true, { 
                timestamp: Date.now(),
                randomCheck: true
            });
        }
    }

    addRedFlag(message, details = {}, id = null) {
        const flagId = id || `flag-${this.partCounter++}`;
        this.redFlagHistory.push({
            id: flagId,
            message,
            time: new Date(),
            details,
            resolved: false
        });
        
        // Update UI with new red flag
        this.updateRedFlagsDisplay();
        
        return flagId;
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
}

export default Simulation;