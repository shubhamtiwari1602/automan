class SimulationVisualization {
    constructor(svg) {
        this.svg = svg;
    }

    drawConveyorPath() {
        // Main conveyor backbone with animation
        this.svg.append("path")
            .attr("class", "conveyor-path main-conveyor")
            .attr("d", "M50,100 H250 Q270,100 270,120 V250 Q270,270 290,270 H450 Q470,270 470,290 V280 Q470,300 490,300 H600");
    }

    drawRFIDCheckpoints(checkpoints) {
        if (!checkpoints || !Array.isArray(checkpoints)) return;
        
        checkpoints.forEach(checkpoint => {
            // Create the RFID checkpoint circle
            const rfidPoint = this.svg.append("circle")
                .attr("class", "rfid-checkpoint")
                .attr("cx", checkpoint.x)
                .attr("cy", checkpoint.y)
                .attr("r", 12)
                .attr("data-station", checkpoint.station);

            // Add the label
            this.svg.append("text")
                .attr("class", "rfid-checkpoint-label")
                .attr("x", checkpoint.x)
                .attr("y", checkpoint.y + 4)
                .text(checkpoint.id.split('-')[1][0].toUpperCase());
                
            // Add pulsing animation effect
            this.addCheckpointPulse(checkpoint);
        });
    }

    addCheckpointPulse(checkpoint) {
        // Add a subtle pulsing effect to help visibility
        const pulse = this.svg.append("circle")
            .attr("class", "rfid-checkpoint-pulse")
            .attr("cx", checkpoint.x)
            .attr("cy", checkpoint.y)
            .attr("r", 12)
            .attr("fill", "none")
            .attr("stroke", "var(--secondary)")
            .attr("stroke-width", 2)
            .attr("opacity", 0.6);
            
        // Create pulsing animation
        function animatePulse() {
            pulse.transition()
                .duration(1500)
                .attr("r", 24)
                .attr("opacity", 0)
                .on("end", () => {
                    pulse
                        .attr("r", 12)
                        .attr("opacity", 0.6);
                    animatePulse();
                });
        }
        
        // Start animation
        animatePulse();
    }

    drawAssemblyStation(station) {
        // Enhanced assembly station with label
        const group = this.svg.append("g")
            .attr("class", "assembly-station-group");
            
        // Main station rectangle
        group.append("rect")
            .attr("class", "assembly-station")
            .attr("x", station.x - 40)
            .attr("y", station.y - 20)
            .attr("width", 80)
            .attr("height", 40)
            .attr("rx", 5)
            .attr("ry", 5);
            
        // Station label
        if (station.label) {
            group.append("text")
                .attr("class", "station-label")
                .attr("x", station.x)
                .attr("y", station.y + 5)
                .attr("text-anchor", "middle")
                .attr("fill", "white")
                .text(station.label);
        }
    }
    
    // Add new method to visualize a component moving along a path
    animateComponentOnPath(component, path, duration) {
        const pathElement = document.getElementById(path);
        if (!pathElement) return null;
        
        const pathLength = pathElement.getTotalLength();
        
        // Create component visual
        const componentElement = this.svg.append("circle")
            .attr("class", `assembly-part ${component.type}`)
            .attr("r", 15)
            .attr("cx", pathElement.getPointAtLength(0).x)
            .attr("cy", pathElement.getPointAtLength(0).y)
            .attr("fill", `var(--${component.type})`)
            .attr("stroke", "#333")
            .attr("stroke-width", 2);
            
        // Add component label
        this.svg.append("text")
            .attr("class", "assembly-label")
            .attr("x", pathElement.getPointAtLength(0).x)
            .attr("y", pathElement.getPointAtLength(0).y + 25)
            .attr("text-anchor", "middle")
            .text(component.type.toUpperCase());
            
        // Animate along the path
        componentElement.transition()
            .duration(duration)
            .ease(d3.easeLinear)
            .attrTween("transform", () => {
                return (t) => {
                    const point = pathElement.getPointAtLength(t * pathLength);
                    return `translate(${point.x}, ${point.y})`;
                };
            });
            
        return componentElement;
    }
}

export default SimulationVisualization;