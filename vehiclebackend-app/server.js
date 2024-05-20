
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const app = express();
const PORT = 5000;

app.use(bodyParser.json());
app.use(cors());

const DATA_FILE = 'data.json';

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
    console.log('Initializing data file...');
    const initialData = { scenarios: [], vehicles: [], nextScenarioId: 1, nextVehicleId: 1 };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
    console.log('Data file initialized:', JSON.stringify(initialData, null, 2));
}

// Read data from JSON file
const readData = () => {
    const jsonData = fs.readFileSync('data.json', 'utf8');
    return JSON.parse(jsonData, (key, value) => {
        if (key === 'nextScenarioId' || key === 'nextVehicleId') {
            return parseInt(value); // Parse as integer
        }
        return value;
    });
};
 

// Write data to JSON file
const writeData = (data) => {
    try {
        // Increment the nextScenarioId and nextVehicleId
        data.nextScenarioId += data.scenarios.length;
        data.nextVehicleId += data.vehicles.length;
        
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        console.log('Data written successfully:', data);
    } catch (error) {
        console.error('Error writing data file:', error);
    }
};


 //Generate the next ID and update it in the file
const generateNextId = (type) => {
    const nextIdKey = type === 'scenario' ? 'nextScenarioId' : 'nextVehicleId';
    try {
        let data = readData();
        if (!data) {
            console.error('Failed to read data for ID generation');
            return null;
        }
        const id = data[nextIdKey];
        console.log(`Current ${nextIdKey}: ${id}`);
        data[nextIdKey] += 1;
        writeData(data); // Update the entire data object
        console.log(`Updated ${nextIdKey} in file to: ${data[nextIdKey]}`);
        return id;
    } catch (error) {
        console.error('Error generating next ID:', error);
        return null;
    }
}; 

// Routes

app.get('/scenarios', (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).json({ message: 'Error reading data file' });
    }
    res.json(data.scenarios);
});

app.post('/scenarios', (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).json({ message: 'Error reading data file' });
    }

    const scenarioId = generateNextId('scenario');
    if (scenarioId === null) {
        return res.status(500).json({ message: 'Error generating scenario ID' });
    }

    const scenario = { id: scenarioId, ...req.body };
    data.scenarios.push(scenario);
    writeData(data);
    console.log(`Added scenario: ${JSON.stringify(scenario)}`);
    res.status(201).json(scenario);
});

app.put('/scenarios/:id', (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).json({ message: 'Error reading data file' });
    }

    const scenarioIndex = data.scenarios.findIndex(scenario => scenario.id === parseInt(req.params.id));
    if (scenarioIndex !== -1) {
        data.scenarios[scenarioIndex] = { ...data.scenarios[scenarioIndex], ...req.body };
        writeData(data);
        res.json(data.scenarios[scenarioIndex]);
    } else {
        res.status(404).json({ message: 'Scenario not found' });
    }
});

app.delete('/scenarios/:id', (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).json({ message: 'Error reading data file' });
    }

    data.scenarios = data.scenarios.filter(scenario => scenario.id !== parseInt(req.params.id));
    writeData(data);
    res.status(204).send();
});

app.get('/vehicles', (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).json({ message: 'Error reading data file' });
    }
    res.json(data.vehicles);
});

app.post('/vehicles', (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).json({ message: 'Error reading data file' });
    }

    const vehicleId = generateNextId('vehicle');
    if (vehicleId === null) {
        return res.status(500).json({ message: 'Error generating vehicle ID' });
    }

    const vehicle = { id: vehicleId, ...req.body };
    data.vehicles.push(vehicle);
    writeData(data);
    console.log(`Added vehicle: ${JSON.stringify(vehicle)}`);
    res.status(201).json(vehicle);
});

app.put('/vehicles/:id', (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).json({ message: 'Error reading data file' });
    }

    const vehicleIndex = data.vehicles.findIndex(vehicle => vehicle.id === parseInt(req.params.id));
    if (vehicleIndex !== -1) {
        data.vehicles[vehicleIndex] = { ...data.vehicles[vehicleIndex], ...req.body };
        writeData(data);
        res.json(data.vehicles[vehicleIndex]);
    } else {
        res.status(404).json({ message: 'Vehicle not found' });
    }
});

app.delete('/vehicles/:id', (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).json({ message: 'Error reading data file' });
    }

    data.vehicles = data.vehicles.filter(vehicle => vehicle.id !== parseInt(req.params.id));
    writeData(data);
    res.status(204).send();
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});








