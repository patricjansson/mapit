import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMapEvents, Marker, Polyline } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';

const API_URL = 'http://localhost:3001';

// Fix for default marker icons in Leaflet with React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom city emoji icon
const cityIcon = new L.DivIcon({
  className: 'custom-city-icon',
  html: '<div style="font-size: 24px;">🏙️</div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function MapEvents({ onMapClick, hasGuessed }: { onMapClick: (lat: number, lng: number) => void, hasGuessed: boolean }) {
  useMapEvents({
    click: (e) => {
      if (!hasGuessed) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

function App() {
  const [currentCity, setCurrentCity] = useState<string>('');
  const [cityCoords, setCityCoords] = useState<[number, number] | null>(null);
  const [clickedCoords, setClickedCoords] = useState<[number, number] | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [message, setMessage] = useState<string>('');
  const [hasGuessed, setHasGuessed] = useState(false);

  useEffect(() => {
    getNewCity();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (hasGuessed) {
      timer = setTimeout(() => {
        getNewCity();
      }, 5000);
    }
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [hasGuessed]);

  const getNewCity = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/random-city`);
      setCurrentCity(response.data.city);
      setCityCoords([response.data.lat, response.data.lng]);
      setClickedCoords(null);
      setDistance(null);
      setHasGuessed(false);
      setMessage(`Var ligger ${response.data.city}?`);
    } catch (error) {
      console.error('Error fetching city:', error);
    }
  };

  const handleMapClick = async (lat: number, lng: number) => {
    if (hasGuessed) return;

    try {
      const response = await axios.post(`${API_URL}/api/calculate-distance`, {
        cityName: currentCity,
        clickedLat: lat,
        clickedLng: lng,
      });
      setDistance(response.data.distance);
      setClickedCoords([response.data.clickedLat, response.data.clickedLng]);
      setMessage(`Du klickade ${response.data.distance}km från ${response.data.city}`);
      setHasGuessed(true);
    } catch (error) {
      console.error('Error calculating distance:', error);
    }
  };

  return (
    <div className="App">
      <h1>Geografi Quiz</h1>
      <div className="message">{message}</div>
      <div className="map-container">
        <MapContainer
          center={[50, 10]}
          zoom={4}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
          scrollWheelZoom={true}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapEvents onMapClick={handleMapClick} hasGuessed={hasGuessed} />

          {cityCoords && hasGuessed && (
            <Marker
              position={cityCoords}
              icon={cityIcon}
            />
          )}

          {clickedCoords && (
            <Marker
              position={clickedCoords}
              opacity={1}
            />
          )}

          {cityCoords && clickedCoords && hasGuessed && (
            <Polyline
              positions={[clickedCoords, cityCoords]}
              color="red"
              weight={2}
              opacity={0.7}
            />
          )}
        </MapContainer>
      </div>
      <button onClick={getNewCity} className="new-city-button">
        Ny Stad
      </button>
    </div>
  );
}

export default App;
