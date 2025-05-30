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

// Function to calculate score based on distance
function calculateScore(distance) {
    // Maximum distance for 0 points (in km)
    const maxDistance = 10000;
    // Minimum distance for 100 points (in km)
    const minDistance = 1;

    // If distance is greater than maxDistance, return 0
    if (distance > maxDistance) return 0;

    // If distance is less than minDistance, return 100
    if (distance < minDistance) return 100;

    // Calculate score using logarithmic scale
    // Using log base 10, scaled to 0-100
    const score = 100 - (Math.log10(distance) / Math.log10(maxDistance)) * 100;

    // Round to nearest integer
    return Math.round(score);
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
app.post('/api/calculate-distance', async (req, res) => {
    const { cityName, clickedLat, clickedLng } = req.body;

    try {
        const city = cities.find(c => c.name === cityName);
        if (!city) {
            return res.status(404).json({ error: 'City not found' });
        }

        const distance = calculateDistance(city.lat, city.lng, clickedLat, clickedLng);
        const score = calculateScore(distance);

        // Check if clicked location is in the wrong country
        const wrongCountry = !isInSameCountry(city.lat, city.lng, clickedLat, clickedLng);

        res.json({
            city: cityName,
            distance,
            score,
            clickedLat,
            clickedLng,
            wrongCountry
        });
    } catch (error) {
        console.error('Error calculating distance:', error);
        res.status(500).json({ error: 'Error calculating distance' });
    }
});

// Helper function to check if two coordinates are in the same country
function isInSameCountry(lat1, lng1, lat2, lng2) {
    // This is a simplified check - in a real application, you would use a proper
    // geocoding service to determine the country for each coordinate
    const maxDistanceForSameCountry = 1000; // 1000 km
    const distance = calculateDistance(lat1, lng1, lat2, lng2);
    return distance <= maxDistanceForSameCountry;
}

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});