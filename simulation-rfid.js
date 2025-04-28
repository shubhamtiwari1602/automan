class RFIDSystem {
    constructor() {
        this.rfidTags = new Map();
        this.readings = {
            chassis: { active: false, lastReading: null, count: 0, status: 'idle' },
            engine: { active: false, lastReading: null, count: 0, status: 'idle' },
            body: { active: false, lastReading: null, count: 0, status: 'idle' },
            interior: { active: false, lastReading: null, count: 0, status: 'idle' }
        };
        
        // Track all recent readings for synchronization analysis
        this.recentReadings = [];
        
        // RFID checkpoint status
        this.checkpoints = {};
        
        // Start tracking time
        this.startTime = Date.now();
        
        // Set up UI update interval
        this.uiUpdateInterval = setInterval(() => this.updateRFIDUI(), 1000);
    }

    addTag(id, data) {
        this.rfidTags.set(id, {
            ...data,
            id: id,
            checkpoints: {},
            currentPosition: 'entry',
            lastUpdated: Date.now()
        });
        
        // Return the created tag for reference
        return this.rfidTags.get(id);
    }

    updateReading(type, active, reading = null) {
        const now = Date.now();
        this.readings[type].active = active;
        
        if (reading) {
            // Store the reading
            this.readings[type].lastReading = {
                ...reading,
                timestamp: reading.timestamp || now
            };
            
            // Update count
            this.readings[type].count++;
            
            // Update status
            this.readings[type].status = active ? 'active' : 'idle';
            
            // Add to recent readings (keep only last 60 seconds)
            this.recentReadings.push({
                type,
                timestamp: reading.timestamp || now,
                data: reading
            });
            
            // Clean up old readings
            const cutoffTime = now - 60000; // 60 seconds ago
            this.recentReadings = this.recentReadings.filter(r => r.timestamp >= cutoffTime);
            
            // Update corresponding UI elements
            this.updateRFIDUI(type);
            
            // If this is a checkpoint reading, record it for the tag
            if (reading.checkpoint && reading.tagId) {
                const tag = this.rfidTags.get(reading.tagId);
                if (tag) {
                    tag.checkpoints[reading.checkpoint] = {
                        timestamp: now,
                        data: reading
                    };
                    tag.currentPosition = reading.checkpoint;
                    tag.lastUpdated = now;
                }
            }
        }
    }

    getReading(type) {
        return this.readings[type];
    }
    
    getTagInfo(tagId) {
        return this.rfidTags.get(tagId) || null;
    }
    
    getAllTagsOfType(type) {
        return Array.from(this.rfidTags.values())
            .filter(tag => tag.type === type);
    }

    checkSyncStatus() {
        // Check synchronization between different parts using recent readings
        const now = Date.now();
        const lastMinuteReadings = this.recentReadings.filter(r => r.timestamp > now - 30000);
        
        // Group readings by type
        const typeGroups = {};
        for (const reading of lastMinuteReadings) {
            if (!typeGroups[reading.type]) {
                typeGroups[reading.type] = [];
            }
            typeGroups[reading.type].push(reading);
        }
        
        // We need at least 2 types of components with readings
        const typesWithReadings = Object.keys(typeGroups);
        if (typesWithReadings.length < 2) {
            return true; // Not enough data to determine sync issues
        }
        
        // Get the most recent reading of each type
        const latestReadings = typesWithReadings.map(type => {
            const readings = typeGroups[type];
            return readings.reduce((latest, reading) => {
                return (!latest || reading.timestamp > latest.timestamp) ? reading : latest;
            }, null);
        }).filter(Boolean);
        
        // Calculate time spread
        const timestamps = latestReadings.map(r => r.timestamp);
        const maxDiff = Math.max(...timestamps) - Math.min(...timestamps);
        
        // Determine if in sync based on time difference
        return maxDiff <= 10000; // 10 second tolerance
    }
    
    updateRFIDUI(specificType = null) {
        // Update UI for RFID components
        const types = specificType ? [specificType] : ['chassis', 'engine', 'body', 'interior'];
        
        types.forEach(type => {
            const reading = this.readings[type];
            const indicator = document.querySelector(`#rfid-${type} .rfid-state`);
            const counter = document.querySelector(`#rfid-${type} .data-counter`);
            
            if (indicator) {
                // Update indicator state
                indicator.textContent = reading.active ? 'Active' : 'Idle';
                indicator.className = 'rfid-state';
                if (reading.active) {
                    indicator.classList.add('active');
                }
            }
            
            if (counter) {
                // Update counter value
                counter.textContent = `${reading.count} readings`;
                
                // Add highlight effect for recent updates
                if (reading.lastReading && (Date.now() - reading.lastReading.timestamp) < 2000) {
                    counter.classList.add('highlight');
                    setTimeout(() => counter.classList.remove('highlight'), 1000);
                }
            }
        });
        
        // Update system status badge
        const statusBadge = document.querySelector('.system-status-badge');
        if (statusBadge) {
            const anyActive = types.some(type => this.readings[type].active);
            
            statusBadge.textContent = anyActive ? 'Active' : 'Standby';
            statusBadge.className = 'system-status-badge';
            if (anyActive) {
                statusBadge.classList.add('active');
            }
        }
    }
    
    // Handle cleanup
    destroy() {
        if (this.uiUpdateInterval) {
            clearInterval(this.uiUpdateInterval);
        }
    }
}

export default RFIDSystem;