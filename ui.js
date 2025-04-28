// UI Component for Simulation
class SimulationUI {
    constructor(simulation, flowMonitor) {
        this.simulation = simulation;
        this.flowMonitor = flowMonitor;
        
        // Enhance the UI and visualization
        this.enhanceSvgSize();
        this.makePartsMoreVisible();
        this.setupContinuousFlow();
        this.updateThresholdDisplay();
        this.setupLegendToggle();
    }
    
    enhanceSvgSize() {
        // Make the simulation view bigger
        const graph = document.getElementById('graph');
        if (graph) {
            graph.style.height = '800px'; // Increase height
            graph.style.width = '100%'; // Ensure full width
            
            // Also resize the SVG if it exists
            if (this.simulation.svg) {
                this.simulation.svg
                    .attr("width", graph.clientWidth)
                    .attr("height", graph.clientHeight);
                
                // Add a background to make visualization clearer
                this.simulation.svg.append("rect")
                    .attr("width", "100%")
                    .attr("height", "100%")
                    .attr("fill", "#f8f9fa")
                    .attr("opacity", 0.6)
                    .attr("class", "simulation-background");
            }
        }
    }
    
    makePartsMoreVisible() {
        // Make parts larger and more visible
        if (this.simulation.svg) {
            // Make main parts significantly larger
            this.simulation.svg.selectAll(".assembly-part")
                .attr("r", 24) // Much larger radius
                .attr("stroke-width", 3) // More visible stroke
                .attr("filter", "drop-shadow(0 4px 6px rgba(0,0,0,0.3))"); // Add shadow for depth
                
            this.simulation.svg.selectAll(".part-component")
                .attr("r", 10) // Larger components
                .attr("stroke-width", 2)
                .attr("filter", "drop-shadow(0 2px 3px rgba(0,0,0,0.2))"); // Add shadow
                
            // Make component labels more visible    
            this.simulation.svg.selectAll(".component-label")
                .attr("font-size", 12)
                .attr("font-weight", "bold")
                .attr("filter", "drop-shadow(0 1px 1px rgba(255,255,255,0.8))"); // Add text shadow
                
            // Make conveyor paths wider and more prominent
            this.simulation.svg.selectAll(".conveyor-path")
                .attr("stroke-width", 12) // Much wider conveyor paths
                .attr("filter", "drop-shadow(0 3px 5px rgba(0,0,0,0.2))"); // Add shadow
                
            // Make RFID checkpoints more visible with glow effect   
            this.simulation.svg.selectAll(".rfid-checkpoint")
                .attr("r", 18) // Larger RFID checkpoints
                .attr("filter", "drop-shadow(0 0 5px rgba(52, 152, 219, 0.5))"); // Add glow
            
            // Make assembly stations more visible and larger
            this.simulation.svg.selectAll(".assembly-station")
                .attr("width", 120) // Wider
                .attr("height", 60) // Taller
                .attr("filter", "drop-shadow(0 6px 8px rgba(0,0,0,0.3))"); // Add shadow
                
            // Update station labels
            this.simulation.svg.selectAll(".station-label")
                .attr("font-size", 14)
                .attr("dy", 5); // Center text vertically
                
            // Adjust existing effect emitters position based on new sizes
            this.simulation.svg.selectAll(".effect-emitter")
                .attr("transform", "scale(1.3)");
        }
    }
    
    setupContinuousFlow() {
        // Add continuous flow of items on conveyor belts
        this.startContinuousFlow("chassis", "chassis-conveyor", 4000);
        this.startContinuousFlow("engine", "engine-conveyor", 4500);
        this.startContinuousFlow("body", "body-conveyor", 5000);
        this.startContinuousFlow("interior", "interior-conveyor", 4200);
    }
    
    startContinuousFlow(partType, pathId, baseDuration) {
        const path = document.getElementById(pathId);
        if (!path) return;
        
        // Create smaller particles to represent continuous flow
        const createFlowParticle = () => {
            // Check if the SVG still exists (prevents errors when page is closed)
            if (!this.simulation.svg || !this.simulation.svg.node()) return;
            
            // Get the path for this conveyor
            const pathLength = path.getTotalLength();
            
            // Create a particle with improved visibility
            const particle = this.simulation.svg.append("circle")
                .attr("class", `flow-particle ${partType}`)
                .attr("r", 7) // Larger radius for better visibility
                .attr("cx", path.getPointAtLength(0).x)
                .attr("cy", path.getPointAtLength(0).y)
                .attr("filter", "drop-shadow(0 2px 3px rgba(0,0,0,0.25))"); // Add shadow for depth
                
            // Animate particle along the path with smoother motion
            const duration = baseDuration / this.simulation.simulationSpeed * (0.8 + Math.random() * 0.4);
            const easing = Math.random() > 0.5 ? "cubic-out" : "cubic-in-out"; // Varied easing
            
            particle.transition()
                .duration(duration)
                .ease(d3[easing])
                .attrTween("transform", () => {
                    return (t) => {
                        const point = path.getPointAtLength(t * pathLength);
                        // Add slight rotation for more interesting motion
                        const angle = t * 360 * (Math.random() * 0.5);
                        return `translate(${point.x}, ${point.y}) rotate(${angle})`;
                    };
                })
                .on("end", () => {
                    // Add pulse effect before removing
                    particle.transition()
                        .duration(200)
                        .attr("r", 10)
                        .attr("opacity", 0.7)
                        .transition()
                        .duration(200)
                        .attr("r", 2)
                        .attr("opacity", 0)
                        .remove()
                        .on("end", () => {
                            // Record the flow rate reading when particle reaches end
                            this.flowMonitor.recordReading(partType);
                        });
                });
                
            // Add random jitter to make flow look more natural
            const jitterAmount = 3;
            particle.attr("cx", function() { 
                return parseFloat(particle.attr("cx")) + (Math.random() * jitterAmount * 2 - jitterAmount);
            });
            
            particle.attr("cy", function() { 
                return parseFloat(particle.attr("cy")) + (Math.random() * jitterAmount * 2 - jitterAmount);
            });
            
            // Check flow rate threshold status
            const flowRate = this.flowMonitor.getFlowRate(partType);
            const thresholds = this.flowMonitor.getThresholds();
            
            // Add enhanced visual indication if flow is outside thresholds
            if (flowRate > thresholds.upper) {
                particle.classed("error", true)
                    .attr("r", 9)
                    .attr("stroke-width", 2);
                
                // Occasionally add a warning flash
                if (Math.random() > 0.8) {
                    const flash = this.simulation.svg.append("circle")
                        .attr("class", "flow-warning-flash")
                        .attr("cx", path.getPointAtLength(0).x)
                        .attr("cy", path.getPointAtLength(0).y)
                        .attr("r", 15)
                        .attr("fill", "none")
                        .attr("stroke", "var(--error)")
                        .attr("stroke-width", 2)
                        .attr("opacity", 0);
                        
                    flash.transition()
                        .duration(300)
                        .attr("opacity", 0.7)
                        .attr("r", 25)
                        .transition()
                        .duration(300)
                        .attr("opacity", 0)
                        .attr("r", 40)
                        .remove();
                }
            } else if (flowRate < thresholds.lower) {
                particle.classed("warning", true)
                    .attr("r", 8)
                    .attr("stroke-width", 1.5);
            }
        };
        
        // Create initial batch of particles
        for (let i = 0; i < 5; i++) { // More initial particles
            setTimeout(() => createFlowParticle(), i * (baseDuration / 8));
        }
        
        // Create new particles at intervals based on flow rate
        const baseInterval = Math.max(300, baseDuration / 10); // Faster creation rate
        const createParticles = () => {
            // Create 1-3 particles at once occasionally for burst effect
            const count = Math.random() > 0.8 ? Math.ceil(Math.random() * 3) : 1;
            for (let i = 0; i < count; i++) {
                setTimeout(() => createFlowParticle(), i * 100);
            }
            
            // Dynamic interval based on current flow rate
            const flowRate = this.flowMonitor.getFlowRate(partType);
            const thresholds = this.flowMonitor.getThresholds();
            let interval = baseInterval;
            
            // Adjust interval based on flow rate status
            if (flowRate > thresholds.upper) {
                interval = baseInterval * 0.5; // Much faster for high flow rate
            } else if (flowRate < thresholds.lower) {
                interval = baseInterval * 1.5; // Slower for low flow rate
            }
            
            setTimeout(createParticles, interval);
        };
        
        // Start the recursive creation
        createParticles();
    }
    
    updateThresholdDisplay() {
        // Add threshold lines to visualize on gauges
        const addThresholdLines = () => {
            const gauges = document.querySelectorAll('.gauge-bar');
            const thresholds = this.flowMonitor.getThresholds();
            
            gauges.forEach(gauge => {
                const gaugeWidth = gauge.offsetWidth;
                const gaugeType = gauge.id.split('-')[0]; // Get type (chassis, engine, etc)
                
                // Upper threshold line
                let upperLine = document.createElement('div');
                upperLine.className = 'threshold-line upper';
                upperLine.style.position = 'absolute';
                upperLine.style.right = `${100 - (thresholds.upper / 20 * 100)}%`;
                upperLine.style.top = '0';
                upperLine.style.height = '100%';
                upperLine.style.borderLeft = '2px dashed #e74c3c';
                
                // Add tooltip to upper threshold
                upperLine.setAttribute('title', `Upper threshold: ${thresholds.upper.toFixed(1)} parts/min`);
                upperLine.style.cursor = 'help';
                
                // Add upper threshold label
                let upperLabel = document.createElement('div');
                upperLabel.className = 'threshold-label upper';
                upperLabel.textContent = `${thresholds.upper.toFixed(1)}`;
                upperLabel.style.position = 'absolute';
                upperLabel.style.right = `${100 - (thresholds.upper / 20 * 100)}%`;
                upperLabel.style.top = '-18px';
                upperLabel.style.transform = 'translateX(50%)';
                upperLabel.style.color = '#e74c3c';
                upperLabel.style.fontSize = '10px';
                upperLabel.style.fontWeight = 'bold';
                
                // Lower threshold line
                let lowerLine = document.createElement('div');
                lowerLine.className = 'threshold-line lower';
                lowerLine.style.position = 'absolute';
                lowerLine.style.right = `${100 - (thresholds.lower / 20 * 100)}%`;
                lowerLine.style.top = '0';
                lowerLine.style.height = '100%';
                lowerLine.style.borderLeft = '2px dashed #f39c12';
                
                // Add tooltip to lower threshold
                lowerLine.setAttribute('title', `Lower threshold: ${thresholds.lower.toFixed(1)} parts/min`);
                lowerLine.style.cursor = 'help';
                
                // Add lower threshold label
                let lowerLabel = document.createElement('div');
                lowerLabel.className = 'threshold-label lower';
                lowerLabel.textContent = `${thresholds.lower.toFixed(1)}`;
                lowerLabel.style.position = 'absolute';
                lowerLabel.style.right = `${100 - (thresholds.lower / 20 * 100)}%`;
                lowerLabel.style.bottom = '-18px';
                lowerLabel.style.transform = 'translateX(50%)';
                lowerLabel.style.color = '#f39c12';
                lowerLabel.style.fontSize = '10px';
                lowerLabel.style.fontWeight = 'bold';
                
                // Make sure gauge has position relative
                gauge.style.position = 'relative';
                
                // Add elements to gauge
                gauge.appendChild(upperLine);
                gauge.appendChild(lowerLine);
                gauge.appendChild(upperLabel);
                gauge.appendChild(lowerLabel);
                
                // Add range indicator
                let rangeIndicator = document.createElement('div');
                rangeIndicator.className = 'range-indicator';
                rangeIndicator.style.position = 'absolute';
                rangeIndicator.style.background = 'rgba(46, 204, 113, 0.1)';
                rangeIndicator.style.right = `${100 - (thresholds.upper / 20 * 100)}%`;
                rangeIndicator.style.width = `${(thresholds.upper - thresholds.lower) / 20 * 100}%`;
                rangeIndicator.style.height = '100%';
                rangeIndicator.style.borderLeft = '1px solid rgba(46, 204, 113, 0.5)';
                rangeIndicator.style.borderRight = '1px solid rgba(46, 204, 113, 0.5)';
                rangeIndicator.style.zIndex = '-1';
                
                gauge.insertBefore(rangeIndicator, gauge.firstChild);
            });
        };
        
        // Add threshold lines after a short delay to ensure gauges are rendered
        setTimeout(() => addThresholdLines(), 500);
        
        // Add interactive help tooltip for threshold adjustment
        const thresholdControls = document.querySelector('.threshold-controls');
        if (thresholdControls) {
            const helpTip = document.createElement('div');
            helpTip.className = 'threshold-help-tip';
            helpTip.innerHTML = 'Adjust sliders to set acceptable flow rate ranges. <span class="tooltip-icon">?</span>';
            helpTip.style.fontSize = '0.9rem';
            helpTip.style.color = '#666';
            helpTip.style.marginTop = '0.5rem';
            helpTip.style.display = 'flex';
            helpTip.style.alignItems = 'center';
            helpTip.style.justifyContent = 'space-between';
            
            const tooltipIcon = helpTip.querySelector('.tooltip-icon');
            if (tooltipIcon) {
                tooltipIcon.style.display = 'inline-block';
                tooltipIcon.style.width = '16px';
                tooltipIcon.style.height = '16px';
                tooltipIcon.style.borderRadius = '50%';
                tooltipIcon.style.background = '#3498db';
                tooltipIcon.style.color = 'white';
                tooltipIcon.style.textAlign = 'center';
                tooltipIcon.style.lineHeight = '16px';
                tooltipIcon.style.cursor = 'help';
                
                tooltipIcon.setAttribute('title', 'Red flags will be generated when flow rates exceed these thresholds. The upper threshold prevents congestion, while the lower threshold ensures adequate supply.');
            }
            
            thresholdControls.appendChild(helpTip);
        }
    }
    
    setupLegendToggle() {
        // Make the legend toggleable
        const legendToggle = document.getElementById('legend-toggle');
        const legend = document.querySelector('.legend');
        
        if (legendToggle && legend) {
            // Initial state - collapsed
            legend.classList.remove('expanded');
            
            legendToggle.addEventListener('click', () => {
                legend.classList.toggle('expanded');
            });
        }
    }
}