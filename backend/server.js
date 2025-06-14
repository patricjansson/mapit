const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// List of cities with their coordinates
const cities = [
    { name: 'Stockholm', lat: 59.3293, lng: 18.0686 },
    { name: 'Oslo', lat: 59.9139, lng: 10.7522 },
    { name: 'Köpenhamn', lat: 55.6761, lng: 12.5683 },
    { name: 'Helsingfors', lat: 60.1699, lng: 24.9384 },
    { name: 'Reykjavik', lat: 64.1265, lng: -21.8174 },
    { name: 'London', lat: 51.5074, lng: -0.1278 },
    { name: 'Dublin', lat: 53.3498, lng: -6.2603 },
    { name: 'Paris', lat: 48.8566, lng: 2.3522 },
    { name: 'Berlin', lat: 52.5200, lng: 13.4050 },
    { name: 'Rom', lat: 41.9028, lng: 12.4964 },
    { name: 'Madrid', lat: 40.4168, lng: -3.7038 },
    { name: 'Lissabon', lat: 38.7223, lng: -9.1393 },
    { name: 'Amsterdam', lat: 52.3676, lng: 4.9041 },
    { name: 'Bryssel', lat: 50.8503, lng: 4.3517 },
    { name: 'Bern', lat: 46.9480, lng: 7.4474 },
    { name: 'Wien', lat: 48.2082, lng: 16.3738 },
    { name: 'Budapest', lat: 47.4979, lng: 19.0402 },
    { name: 'Prag', lat: 50.0755, lng: 14.4378 },
    { name: 'Warszawa', lat: 52.2297, lng: 21.0122 },
    { name: 'Bratislava', lat: 48.1486, lng: 17.1077 },
    { name: 'Ljubljana', lat: 46.0569, lng: 14.5058 },
    { name: 'Zagreb', lat: 45.8150, lng: 15.9819 },
    { name: 'Beograd', lat: 44.7866, lng: 17.1891 },
    { name: 'Sofia', lat: 42.6977, lng: 23.3219 },
    { name: 'Bukarest', lat: 44.4268, lng: 26.1025 },
    { name: 'București', lat: 44.4268, lng: 26.1025 },
    { name: 'Athen', lat: 37.9838, lng: 23.7275 },
    { name: 'Ankara', lat: 39.9334, lng: 32.8597 },
    { name: 'Nicosia', lat: 35.1856, lng: 33.3823 },
    { name: 'Valletta', lat: 35.9042, lng: 14.5189 },
    { name: 'Vaduz', lat: 47.1410, lng: 9.5209 },
    { name: 'San Marino', lat: 43.9424, lng: 12.4578 },
    { name: 'Vatikanstaten', lat: 41.9022, lng: 12.4539 },
    { name: 'Monaco', lat: 43.7384, lng: 7.4246 },
    { name: 'Andorra la Vella', lat: 42.5063, lng: 1.5218 },
    { name: 'Podgorica', lat: 42.4304, lng: 19.2594 },
    { name: 'Skopje', lat: 42.0038, lng: 21.4522 },
    { name: 'Tirana', lat: 41.3275, lng: 19.8187 },
    { name: 'Sarajevo', lat: 43.8564, lng: 18.4131 },
    { name: 'Chisinau', lat: 47.0105, lng: 28.8638 },
    { name: 'Kiev', lat: 50.4547, lng: 30.5238 },
    { name: 'Minsk', lat: 53.9045, lng: 27.5615 },
    { name: 'Vilnius', lat: 54.6872, lng: 25.2797 },
    { name: 'Riga', lat: 56.9496, lng: 24.1052 },
    { name: 'Tallinn', lat: 59.4370, lng: 24.7536 }
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

// Function to get country from coordinates using Nominatim API
async function getCountryFromCoordinates(lat, lng) {
    try {
        const response = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
            {
                headers: {
                    'User-Agent': 'GeographyQuiz/1.0'
                }
            }
        );

        if (response.data && response.data.address) {
            return response.data.address.country;
        }
        return null;
    } catch (error) {
        console.error('Error fetching country from Nominatim:', error);
        return null;
    }
}

// Updated function to check if two coordinates are in the same country
async function isInSameCountry(lat1, lng1, lat2, lng2) {
    try {
        // Try to get countries from Nominatim API
        const [country1, country2] = await Promise.all([
            getCountryFromCoordinates(lat1, lng1),
            getCountryFromCoordinates(lat2, lng2)
        ]);

        // If we got both countries from the API, compare them
        if (country1 && country2) {
            return country1 === country2;
        }

        // Fallback to our existing boundary check
        const countryBoundaries = {
            'Sweden': { minLat: 55.0, maxLat: 69.0, minLng: 11.0, maxLng: 24.0 },
            'Norway': { minLat: 58.0, maxLat: 71.0, minLng: 4.0, maxLng: 31.0 },
            'Denmark': { minLat: 54.5, maxLat: 58.0, minLng: 8.0, maxLng: 15.0 },
            'Finland': { minLat: 60.0, maxLat: 70.0, minLng: 20.0, maxLng: 32.0 },
            'Iceland': { minLat: 63.0, maxLat: 66.0, minLng: -25.0, maxLng: -13.0 },
            'UK': { minLat: 49.0, maxLat: 61.0, minLng: -8.0, maxLng: 2.0 },
            'Ireland': { minLat: 51.0, maxLat: 55.0, minLng: -11.0, maxLng: -5.0 },
            'France': { minLat: 41.0, maxLat: 51.0, minLng: -5.0, maxLng: 9.0 },
            'Germany': { minLat: 47.0, maxLat: 55.0, minLng: 6.0, maxLng: 15.0 },
            'Italy': { minLat: 36.0, maxLat: 47.0, minLng: 6.0, maxLng: 18.0 },
            'Spain': { minLat: 36.0, maxLat: 44.0, minLng: -10.0, maxLng: 4.0 },
            'Portugal': { minLat: 36.0, maxLat: 42.0, minLng: -10.0, maxLng: -6.0 },
            'Netherlands': { minLat: 50.0, maxLat: 54.0, minLng: 3.0, maxLng: 7.0 },
            'Belgium': { minLat: 49.0, maxLat: 51.0, minLng: 2.0, maxLng: 6.0 },
            'Switzerland': { minLat: 45.0, maxLat: 48.0, minLng: 6.0, maxLng: 10.0 },
            'Austria': { minLat: 46.0, maxLat: 49.0, minLng: 9.0, maxLng: 17.0 },
            'Hungary': { minLat: 45.0, maxLat: 49.0, minLng: 16.0, maxLng: 23.0 },
            'Czech Republic': { minLat: 48.0, maxLat: 51.0, minLng: 12.0, maxLng: 19.0 },
            'Poland': { minLat: 49.0, maxLat: 55.0, minLng: 14.0, maxLng: 24.0 },
            'Slovakia': { minLat: 47.0, maxLat: 50.0, minLng: 16.0, maxLng: 22.0 },
            'Slovenia': { minLat: 45.0, maxLat: 47.0, minLng: 13.0, maxLng: 16.0 },
            'Croatia': { minLat: 42.0, maxLat: 47.0, minLng: 13.0, maxLng: 19.0 },
            'Serbia': { minLat: 42.0, maxLat: 46.0, minLng: 18.0, maxLng: 23.0 },
            'Bulgaria': { minLat: 41.0, maxLat: 44.0, minLng: 22.0, maxLng: 28.0 },
            'Romania': { minLat: 43.0, maxLat: 48.0, minLng: 20.0, maxLng: 30.0 },
            'Greece': { minLat: 35.0, maxLat: 42.0, minLng: 19.0, maxLng: 28.0 },
            'Turkey': { minLat: 36.0, maxLat: 42.0, minLng: 26.0, maxLng: 45.0 },
            'Cyprus': { minLat: 34.0, maxLat: 36.0, minLng: 32.0, maxLng: 35.0 },
            'Malta': { minLat: 35.0, maxLat: 36.0, minLng: 14.0, maxLng: 15.0 },
            'Liechtenstein': { minLat: 47.0, maxLat: 47.5, minLng: 9.0, maxLng: 10.0 },
            'San Marino': { minLat: 43.0, maxLat: 44.0, minLng: 12.0, maxLng: 13.0 },
            'Vatican': { minLat: 41.0, maxLat: 42.0, minLng: 12.0, maxLng: 13.0 },
            'Monaco': { minLat: 43.0, maxLat: 44.0, minLng: 7.0, maxLng: 8.0 },
            'Andorra': { minLat: 42.0, maxLat: 43.0, minLng: 1.0, maxLng: 2.0 },
            'Montenegro': { minLat: 41.0, maxLat: 43.0, minLng: 18.0, maxLng: 20.0 },
            'North Macedonia': { minLat: 40.0, maxLat: 43.0, minLng: 20.0, maxLng: 23.0 },
            'Albania': { minLat: 39.0, maxLat: 43.0, minLng: 19.0, maxLng: 21.0 },
            'Bosnia': { minLat: 42.0, maxLat: 45.0, minLng: 15.0, maxLng: 20.0 },
            'Moldova': { minLat: 45.0, maxLat: 49.0, minLng: 26.0, maxLng: 30.0 },
            'Ukraine': { minLat: 44.0, maxLat: 53.0, minLng: 22.0, maxLng: 40.0 },
            'Belarus': { minLat: 51.0, maxLat: 56.0, minLng: 23.0, maxLng: 33.0 },
            'Lithuania': { minLat: 53.0, maxLat: 56.0, minLng: 20.0, maxLng: 27.0 },
            'Latvia': { minLat: 55.0, maxLat: 58.0, minLng: 20.0, maxLng: 28.0 },
            'Estonia': { minLat: 57.0, maxLat: 60.0, minLng: 21.0, maxLng: 28.0 }
        };

        function findCountry(lat, lng) {
            for (const [country, bounds] of Object.entries(countryBoundaries)) {
                if (lat >= bounds.minLat && lat <= bounds.maxLat &&
                    lng >= bounds.minLng && lng <= bounds.maxLng) {
                    return country;
                }
            }
            return null;
        }

        const fallbackCountry1 = findCountry(lat1, lng1);
        const fallbackCountry2 = findCountry(lat2, lng2);

        if (fallbackCountry1 && fallbackCountry2) {
            return fallbackCountry1 === fallbackCountry2;
        }

        // If all else fails, use distance check
        const maxDistanceForSameCountry = 100;
        const distance = calculateDistance(lat1, lng1, lat2, lng2);
        return distance <= maxDistanceForSameCountry;
    } catch (error) {
        console.error('Error in isInSameCountry:', error);
        // If there's an error, fall back to distance check
        const maxDistanceForSameCountry = 100;
        const distance = calculateDistance(lat1, lng1, lat2, lng2);
        return distance <= maxDistanceForSameCountry;
    }
}

// Update the calculate-distance endpoint to use async/await
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
        const wrongCountry = !(await isInSameCountry(city.lat, city.lng, clickedLat, clickedLng));

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

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});