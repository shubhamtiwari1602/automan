class SimulationAnimations {
    constructor(svg) {
        this.svg = svg;
        this.timelines = {};
        this.effectsContainer = this.createEffectsContainer();
        this.effectsActive = false;
    }
    
    createEffectsContainer() {
        // Create a container for all animation effects
        return this.svg.append("g")
            .attr("class", "effects-container");
    }

    createWeldingEffect(position) {
        if (!this.svg || Math.random() > 0.2) return; // Only show occasionally
        
        // Create welding sparks animation with improved visual fidelity
        const sparks = this.effectsContainer.append("g")
            .attr("class", "welding-sparks effect-emitter")
            .attr("transform", `translate(${position.x}, ${position.y})`);
            
        // Create an outer glow for the welding
        sparks.append("circle")
            .attr("class", "welding-glow")
            .attr("r", 15)
            .attr("fill", "#FFC107")
            .attr("opacity", 0.3)
            .attr("filter", "blur(5px)");
            
        // Add a visual base for the welding point
        sparks.append("circle")
            .attr("class", "welding-point")
            .attr("r", 4)
            .attr("fill", "#ff9800")
            .attr("opacity", 0.9);
            
        // Add multiple sparks with random directions
        for (let i = 0; i < 8; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 3 + Math.random() * 15;
            const size = 1 + Math.random() * 2;
            const duration = 200 + Math.random() * 300;
            
            const spark = sparks.append("circle")
                .attr("class", "spark")
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("r", size)
                .attr("fill", Math.random() > 0.7 ? "#FFFFFF" : "#FFC107")
                .attr("opacity", 0.9);
                
            // Animate the spark flying outward
            spark.transition()
                .duration(duration)
                .attr("cx", Math.cos(angle) * distance)
                .attr("cy", Math.sin(angle) * distance)
                .attr("r", size * 0.5)
                .attr("opacity", 0)
                .remove();
        }
        
        // Add sparkling effect
        const sparkle = sparks.append("circle")
            .attr("class", "sparkle")
            .attr("r", 8)
            .attr("fill", "none")
            .attr("stroke", "#FFFFFF")
            .attr("stroke-width", 1.5)
            .attr("opacity", 0.7);
            
        // Pulse animation
        sparkle.transition()
            .duration(400)
            .attr("r", 20)
            .attr("opacity", 0)
            .remove();
            
        // Remove the whole effect after a short time
        setTimeout(() => {
            sparks.transition()
                .duration(200)
                .attr("opacity", 0)
                .remove();
        }, 600);
    }

    createPaintingEffect(position) {
        if (!this.svg || Math.random() > 0.15) return; // Only show occasionally
        
        // Create paint spray animation with improved visual fidelity
        const spray = this.effectsContainer.append("g")
            .attr("class", "paint-spray effect-emitter")
            .attr("transform", `translate(${position.x}, ${position.y})`);
            
        // Add paint spray mist
        spray.append("circle")
            .attr("class", "spray-mist")
            .attr("r", 20)
            .attr("fill", "rgba(46, 204, 113, 0.2)")
            .attr("filter", "blur(8px)");
            
        // Add multiple paint particles with random spray pattern
        const colors = ["#2ecc71", "#27ae60", "#1abc9c"];
        
        for (let i = 0; i < 12; i++) {
            const angle = (Math.random() * Math.PI / 2) - Math.PI / 4; // Spray cone
            const distance = 5 + Math.random() * 25;
            const size = 1 + Math.random() * 3;
            const duration = 400 + Math.random() * 500;
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            const particle = spray.append("circle")
                .attr("class", "paint-particle")
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("r", size)
                .attr("fill", color)
                .attr("opacity", 0.8);
                
            // Animate the particle in spray pattern
            particle.transition()
                .duration(duration)
                .attr("cx", Math.cos(angle) * distance)
                .attr("cy", Math.sin(angle) * distance)
                .attr("r", size * 1.5)
                .attr("opacity", 0)
                .remove();
        }
        
        // Add spray nozzle
        spray.append("circle")
            .attr("class", "spray-nozzle")
            .attr("r", 4)
            .attr("fill", "#95a5a6")
            .attr("stroke", "#7f8c8d")
            .attr("stroke-width", 1);
            
        // Remove entire spray effect after animation completes
        setTimeout(() => {
            spray.transition()
                .duration(300)
                .attr("opacity", 0)
                .remove();
        }, 800);
    }

    createAssemblyEffect(position) {
        if (!this.svg || Math.random() > 0.25) return; // Only show occasionally
        
        // Create assembly indicator animation
        const assembly = this.effectsContainer.append("g")
            .attr("class", "assembly-effect effect-emitter")
            .attr("transform", `translate(${position.x}, ${position.y})`);
            
        // Add assembly tool visual (wrench-like shape)
        assembly.append("path")
            .attr("class", "assembly-tool")
            .attr("d", "M-5,-5 L5,5 M-5,5 L5,-5")
            .attr("stroke", "#3498db")
            .attr("stroke-width", 3)
            .attr("stroke-linecap", "round");
            
        // Add rotation indicator circle
        assembly.append("circle")
            .attr("class", "rotation-indicator")
            .attr("r", 12)
            .attr("fill", "none")
            .attr("stroke", "#3498db")
            .attr("stroke-width", 1.5)
            .attr("stroke-dasharray", "4,4")
            .attr("opacity", 0.7);
            
        // Animate rotation
        assembly.transition()
            .duration(800)
            .attrTween("transform", () => {
                return (t) => `translate(${position.x}, ${position.y}) rotate(${t * 360})`;
            })
            .on("end", () => {
                assembly.transition()
                    .duration(200)
                    .attr("opacity", 0)
                    .remove();
            });
    }
    
    // Create a new effect for final assembly integration
    createIntegrationEffect(position) {
        if (!this.svg || Math.random() > 0.1) return; // Show rarely for special effect
        
        const integration = this.effectsContainer.append("g")
            .attr("class", "integration-effect effect-emitter")
            .attr("transform", `translate(${position.x}, ${position.y})`);
            
        // Create convergence effect where parts come together
        const convergence = integration.append("g")
            .attr("class", "convergence");
            
        // Add convergence lines representing different component paths
        const colors = ["var(--chassis)", "var(--engine)", "var(--body)", "var(--interior)"];
        const count = colors.length;
        
        for (let i = 0; i < count; i++) {
            const angle = (i * Math.PI * 2 / count);
            const start = 30;
            const end = 5;
            
            convergence.append("line")
                .attr("x1", Math.cos(angle) * start)
                .attr("y1", Math.sin(angle) * start)
                .attr("x2", Math.cos(angle) * start)
                .attr("y2", Math.sin(angle) * start)
                .attr("stroke", colors[i])
                .attr("stroke-width", 2)
                .attr("opacity", 0.8)
                .transition()
                .duration(600)
                .attr("x2", Math.cos(angle) * end)
                .attr("y2", Math.sin(angle) * end);
        }
        
        // Add central glow
        integration.append("circle")
            .attr("class", "integration-glow")
            .attr("r", 0)
            .attr("fill", "#f39c12")
            .attr("opacity", 0)
            .attr("filter", "blur(3px)")
            .transition()
            .delay(300)
            .duration(300)
            .attr("r", 15)
            .attr("opacity", 0.7)
            .transition()
            .duration(400)
            .attr("r", 5)
            .attr("opacity", 0);
            
        // Add completion pulse
        integration.append("circle")
            .attr("class", "completion-pulse")
            .attr("r", 5)
            .attr("fill", "none")
            .attr("stroke", "#2ecc71")
            .attr("stroke-width", 2)
            .attr("opacity", 0.8)
            .transition()
            .delay(700)
            .duration(500)
            .attr("r", 30)
            .attr("opacity", 0)
            .remove();
            
        // Remove the entire effect
        setTimeout(() => {
            integration.transition()
                .duration(200)
                .attr("opacity", 0)
                .remove();
        }, 1200);
    }
}

export default SimulationAnimations;