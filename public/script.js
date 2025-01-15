document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  const cityInput = document.querySelector('#city');
  const weatherContainer = document.querySelector('#weather');
  const photosContainer = document.querySelector('#photos');
  const errorMessage = document.querySelector('#error');


  let map;

  const initMap = (lat, lon) => {
    if (map) {
      map.setView([lat, lon], 10);
    } else {
      map = L.map('map').setView([lat, lon], 10);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);
      L.marker([lat, lon]).addTo(map).bindPopup('Location').openPopup();
    }
  };

  const updateWeatherAndPhotos = async (city) => {
    try {
      const weatherResponse = await fetch(`/weather?city=${city}`);
      const weatherData = await weatherResponse.json();

      if (weatherData.error) {
        errorMessage.textContent = weatherData.error;
        weatherContainer.innerHTML = '';
        photosContainer.innerHTML = '';
        return;
      }

      errorMessage.textContent = '';
      weatherContainer.innerHTML = '';
      photosContainer.innerHTML = '';

      weatherContainer.innerHTML = `
        <h2>${weatherData.city}, ${weatherData.countryCode}</h2>
        <p><strong>Temperature:</strong> ${weatherData.temperature}°C</p>
        <p><strong>Feels like:</strong> ${weatherData.feelsLike}°C</p>
        <p><strong>Humidity:</strong> ${weatherData.humidity}%</p>
        <p><strong>Pressure:</strong> ${weatherData.pressure} hPa</p>
        <p><strong>Wind Speed:</strong> ${weatherData.windSpeed} m/s</p>
        <p><strong>Description:</strong> ${weatherData.description}</p>
        <img src="http://openweathermap.org/img/wn/${weatherData.icon}@2x.png" alt="Weather icon">
      `;

      if (weatherData.photos && weatherData.photos.length > 0) {
        const photosData = weatherData.photos.map(photo => {
          return `<img src="${photo}" alt="Photo">`;
        }).join('');
        photosContainer.innerHTML = photosData;
      } else {
        photosContainer.innerHTML = '<p>No photos found.</p>';
      }

      initMap(weatherData.coordinates.lat, weatherData.coordinates.lon);

    } catch (error) {
      errorMessage.textContent = 'Error loading data.';
      console.error('Error:', error);
    }
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const city = cityInput.value.trim();
    if (city) {
      updateWeatherAndPhotos(city);
    } else {
      errorMessage.textContent = 'Please enter a city.';
    }
  });
});
