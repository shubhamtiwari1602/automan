// Base node rates and RFID configuration
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

// RFID checkpoint configuration
const rfidCheckpoints = [
    { id: "rfid-chassis-1", station: "Chassis_Assembly", x: 250, y: 100 },
    { id: "rfid-engine-1", station: "Engine_Assembly", x: 250, y: 200 },
    { id: "rfid-body-1", station: "Body_Welding", x: 250, y: 300 },
    { id: "rfid-interior-1", station: "Interior_Assembly", x: 250, y: 400 },
    { id: "rfid-final-1", station: "Final_Assembly", x: 500, y: 300 },
    { id: "rfid-quality-1", station: "Quality_Inspection", x: 650, y: 300 }
];

// Synchronization requirements for assembly stations
const syncTolerance = {
    "Final_Assembly": { tmin: 5, tmax: 30 },
    "Chassis_Assembly": { tmin: 3, tmax: 15 },
    "Engine_Assembly": { tmin: 3, tmax: 15 },
    "Body_Welding": { tmin: 3, tmax: 12 },
    "Painting": { tmin: 2, tmax: 10 }
};

// Synchronization factor
const syncFactor = 10; // General sync factor

// Component flow rate defaults (parts per minute)
const flowRates = {
    "chassis": 8.0,
    "engine": 7.5, 
    "body": 6.0,
    "interior": 7.0
};

// Flow rate thresholds
const flowThresholds = {
    "upper": 12.0,
    "lower": 4.0
};

export { nodeRates, rfidCheckpoints, syncTolerance, syncFactor, flowRates, flowThresholds };