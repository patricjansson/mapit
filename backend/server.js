const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// List of cities with their coordinates
const cities = [
    { name: 'London', lat: 51.5074, lng: -0.1278 },
    { name: 'Paris', lat: 48.8566, lng: 2.3522 },
    { name: 'Berlin', lat: 52.5200, lng: 13.4050 },
    { name: 'Rome', lat: 41.9028, lng: 12.4964 },
    { name: 'Madrid', lat: 40.4168, lng: -3.7038 },
    { name: 'Amsterdam', lat: 52.3676, lng: 4.9041 },
    { name: 'Vienna', lat: 48.2082, lng: 16.3738 },
    { name: 'Stockholm', lat: 59.3293, lng: 18.0686 },
    { name: 'Oslo', lat: 59.9139, lng: 10.7522 },
    { name: 'Copenhagen', lat: 55.6761, lng: 12.5683 }
];

// Function to calculate distance between two points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Get random city
app.get('/api/random-city', (req, res) => {
    const randomCity = cities[Math.floor(Math.random() * cities.length)];
    res.json({
        city: randomCity.name,
        lat: randomCity.lat,
        lng: randomCity.lng
    });
});

// Calculate distance
app.post('/api/calculate-distance', (req, res) => {
    const { cityName, clickedLat, clickedLng } = req.body;
    const city = cities.find(c => c.name === cityName);

    if (!city) {
        return res.status(404).json({ error: 'City not found' });
    }

    const distance = calculateDistance(
        city.lat,
        city.lng,
        clickedLat,
        clickedLng
    );

    res.json({
        distance: Math.round(distance),
        city: cityName,
        cityLat: city.lat,
        cityLng: city.lng,
        clickedLat,
        clickedLng
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});