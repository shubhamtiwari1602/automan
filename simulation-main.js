// This is a backup script that works even when modules fail to load

// Simple animation fallback - ensure we have animation even without modules
document.addEventListener('DOMContentLoaded', () => {
    console.log("Simulation main fallback initialized");
    
    try {
        // Ensure we show something on the screen
        function createFallbackVisualization() {
            const graph = document.getElementById('graph');
            if (!graph) return;
            
            // Check if we already have SVG content
            if (graph.querySelector('svg')) {
                console.log("SVG already exists, skipping fallback");
                return;
            }
            
            console.log("Creating fallback visualization");
            
            // Create basic SVG
            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttribute("width", "100%");
            svg.setAttribute("height", "100%");
            svg.style.overflow = "visible";
            graph.appendChild(svg);
            
            // Create basic paths
            const pathData = [
                { id: "chassis-conveyor", d: "M50,100 L550,100" },
                { id: "engine-conveyor", d: "M50,200 L550,200" },
                { id: "body-conveyor", d: "M50,300 L550,300" },
                { id: "interior-conveyor", d: "M50,400 L550,400" }
            ];
            
            pathData.forEach(p => {
                const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                path.setAttribute("id", p.id);
                path.setAttribute("class", "conveyor-path");
                path.setAttribute("d", p.d);
                svg.appendChild(path);
            });
            
            // Add basic stations
            const stations = [
                { x: 250, y: 100, label: "Chassis Assembly" },
                { x: 250, y: 200, label: "Engine Assembly" },
                { x: 250, y: 300, label: "Body Welding" },
                { x: 500, y: 300, label: "Final Assembly" }
            ];
            
            stations.forEach(s => {
                const station = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                station.setAttribute("class", "assembly-station");
                station.setAttribute("x", s.x - 40);
                station.setAttribute("y", s.y - 20);
                station.setAttribute("width", 80);
                station.setAttribute("height", 40);
                station.setAttribute("rx", 5);
                svg.appendChild(station);
                
                const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
                label.setAttribute("class", "station-label");
                label.setAttribute("x", s.x);
                label.setAttribute("y", s.y + 5);
                label.setAttribute("text-anchor", "middle");
                label.setAttribute("fill", "white");
                label.textContent = s.label;
                svg.appendChild(label);
            });
        }
        
        // Initialize visualization after a short delay
        setTimeout(createFallbackVisualization, 500);
        
    } catch (error) {
        console.error("Error in simulation-main fallback:", error);
    }
});

// Try to load the real simulation if modules work
try {
    import('./simulation.js').then(module => {
        const Simulation = module.default;
        console.log("Simulation module loaded successfully");
        
        // Initialize simulation
        const simulation = new Simulation();

        // Start simulation
        simulation.start();

        // Update simulation loop
        function update() {
            simulation.update();
            requestAnimationFrame(update);
        }

        // Start update loop
        requestAnimationFrame(update);

        // Export for debugging
        window.simulation = simulation;
        
    }).catch(err => {
        console.error("Failed to load simulation module:", err);
    });
} catch (e) {
    console.error("Module loading not supported:", e);
}