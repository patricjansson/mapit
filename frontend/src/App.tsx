import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMapEvents, Marker, Polyline } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';

const API_URL = 'http://localhost:3001';
const TIME_LIMIT = 5;

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
  const [hasGuessed, setHasGuessed] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [currentScore, setCurrentScore] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [showMiss, setShowMiss] = useState(false);
  const [showWrongCountry, setShowWrongCountry] = useState(false);
  const [showCityName, setShowCityName] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [goldRain, setGoldRain] = useState(false);

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

  useEffect(() => {
    let countdownTimer: NodeJS.Timeout;
    if (!hasGuessed && timeLeft > 0 && !showCityName) {
      countdownTimer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(countdownTimer);
            setShowMiss(true);
            setTimeout(() => {
              setShowMiss(false);
              getNewCity();
            }, 1000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (countdownTimer) {
        clearInterval(countdownTimer);
      }
    };
  }, [hasGuessed, timeLeft, showCityName]);

  const getNewCity = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/random-city`);
      setCurrentCity(response.data.city);
      setCityCoords([response.data.lat, response.data.lng]);
      setClickedCoords(null);
      setCurrentScore(null);
      setHasGuessed(false);
      setTimeLeft(TIME_LIMIT);
      setDistance(null);
      setShowCityName(true);
      setTimeout(() => {
        setShowCityName(false);
      }, 1000);
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
      setClickedCoords([response.data.clickedLat, response.data.clickedLng]);
      setCurrentScore(response.data.score);
      setDistance(response.data.distance);

      if (response.data.distance <= 40 && !response.data.wrongCountry) {
        setGoldRain(true);
        setTimeout(() => setGoldRain(false), 1500);
      }

      if (response.data.wrongCountry) {
        setShowWrongCountry(true);
        setTotalScore(0);
        setTimeout(() => {
          setShowWrongCountry(false);
          getNewCity();
        }, 1000);
      } else {
        setTotalScore(prev => prev + response.data.score);
      }

      setHasGuessed(true);
    } catch (error) {
      console.error('Error calculating distance:', error);
    }
  };

  return (
    <div className="App">
      <div className="score-display">
        Poäng: {totalScore}
        {currentScore !== null && <div className="current-score">+{currentScore}</div>}
      </div>
      {showMiss && (
        <div className="miss-splash">
          <div className="miss-text">MISS!</div>
        </div>
      )}
      {showWrongCountry && (
        <div className="wrong-country-splash">
          <div className="wrong-country-text">FEL LAND!</div>
        </div>
      )}
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
        <div className="countdown-container">
          <div
            className={`countdown-bar ${timeLeft <= 2 ? 'pulse' : ''}`}
            style={{ width: `${(timeLeft / TIME_LIMIT) * 100}%` }}
          />
        </div>
      </div>
      {showCityName && (
        <div className="city-name-display">
          {currentCity}
        </div>
      )}
      {distance !== null && !showWrongCountry && (
        <div className="distance-display">
          {Math.round(distance)} km
        </div>
      )}
      {goldRain && (
        <div className="gold-rain">
          {Array.from({ length: 24 }).map((_, i) => {
            const left = Math.random() * 100;
            const emojis = ['💰', '✨', '🥇', '⭐️', '🪙', '💛', '🏅', '🌟'];
            const emoji = emojis[Math.floor(Math.random() * emojis.length)];
            return (
              <span
                key={i}
                style={{ left: `${left}vw`, animationDelay: `${Math.random() * 0.7}s` }}
              >
                {emoji}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default App;
